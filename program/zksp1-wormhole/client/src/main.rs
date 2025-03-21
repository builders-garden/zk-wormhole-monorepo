#![no_main]
sp1_zkvm::entrypoint!(main);

use alloy_primitives::{Address, U256};
use alloy_sol_macro::sol;
use alloy_sol_types::{SolCall, SolValue};
use sp1_cc_client_executor::{io::EVMStateSketch, ClientExecutor, ContractInput};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

sol! {
    /// ERC20 interface for balanceOf
    interface IERC20 {
        function balanceOf(address account) external view returns (uint256);
    }
}

#[derive(Debug)]
struct PublicValuesStruct {
    amount: u64,
    receiver: [u8; 20],
    proof_hash: [u8; 32],
}

impl PublicValuesStruct {
    fn abi_encode(&self) -> Vec<u8> {
        let mut bytes = Vec::new();
        bytes.extend_from_slice(&self.amount.to_be_bytes());
        bytes.extend_from_slice(&self.receiver);
        bytes.extend_from_slice(&self.proof_hash);
        bytes
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct AddressInput {
    contract: Address,
    target: Address,
    min_amount: u64,
}

pub fn main() {
    // Read inputs for dead address verification
    let secret: [u8; 32] = sp1_zkvm::io::read();
    let nonce: [u8; 32] = sp1_zkvm::io::read();
    let dead_address: [u8; 20] = sp1_zkvm::io::read();
    let amount: u64 = sp1_zkvm::io::read();
    let receiver: [u8; 20] = sp1_zkvm::io::read();

    // Read the state sketch for EVM execution
    let state_sketch_bytes = sp1_zkvm::io::read::<Vec<u8>>();
    let state_sketch = bincode::deserialize::<EVMStateSketch>(&state_sketch_bytes).unwrap();

    // Read the address input (token contract address) from stdin
    let address_input_bytes = sp1_zkvm::io::read::<Vec<u8>>();
    let mut address_input: AddressInput = bincode::deserialize(&address_input_bytes).unwrap();

    // Compute the dead address
    let msg_sender: [u8; 20] = [0x01; 20];
    let bytecode: [u8; 32] = [0x00; 32];

    let mut hasher = Sha256::new();
    hasher.update(&secret);
    let secret_hash = hasher.finalize();

    let mut hasher = Sha256::new();
    hasher.update(&secret_hash);
    hasher.update(&nonce);
    hasher.update(&amount.to_be_bytes());
    let salt = hasher.finalize();

    let mut hasher = Sha256::new();
    hasher.update(&[0xff]);
    hasher.update(&msg_sender);
    hasher.update(&salt);
    hasher.update(&bytecode);
    let computed_address_full = hasher.finalize();
    let computed_address = &computed_address_full[12..];

    assert_eq!(
        dead_address, computed_address,
        "deadAddress does not match Create2 result"
    );

    // Update address_input to use the computed dead_address as the target
    address_input.target = Address::from_slice(&dead_address);
    address_input.min_amount = amount;

    // Initialize the client executor with the state sketch
    let executor = ClientExecutor::new(&state_sketch).unwrap();

    // Execute the balanceOf call
    let balance_call = IERC20::balanceOfCall { account: address_input.target };
    let call = ContractInput::new_call(address_input.contract, Address::default(), balance_call);
    let public_vals = executor.execute(call).unwrap();

    // Decode the balance
    let balance = IERC20::balanceOfCall::abi_decode_returns(&public_vals.contractOutput, true).unwrap();
    
    // Convert min_amount to U256 for comparison
    let min_amount = U256::from(address_input.min_amount);
    
    // Verify the balance requirement
    assert!(
        balance._0 >= min_amount,
        "Balance {} is less than required minimum {}",
        balance._0,
        min_amount
    );

    // Compute proof hash
    let mut hasher = Sha256::new();
    hasher.update(&dead_address);
    hasher.update(&receiver);
    hasher.update(&amount.to_be_bytes());
    let proof_hash = hasher.finalize();

    // Commit public values
    let public_values = PublicValuesStruct {
        amount,
        receiver,
        proof_hash: proof_hash.into(),
    };
    let bytes = public_values.abi_encode();
    sp1_zkvm::io::commit_slice(&bytes);
}