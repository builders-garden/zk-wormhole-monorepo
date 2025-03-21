#![no_main]
sp1_zkvm::entrypoint!(main);


use alloy_primitives::{Address, U256, B256, hex};
use alloy_sol_macro::sol;
use alloy_sol_types::{SolCall, SolValue};
use sp1_cc_client_executor::{io::EVMStateSketch, ClientExecutor, ContractInput};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

sol! {
    interface IERC20 {
        function balanceOf(address account) external view returns (uint256);
        function getDeadHashAmount(bytes32 h) external view returns (uint256);
    }
}

sol! {
    struct PublicValuesStruct {
        uint64 amount;
        address receiver;
        bytes32 nullifier;
        bytes32 deadAddressHash;
        bytes32 blockHash;
        address contractAddress;
        bytes data;
    }
}



#[derive(Debug, Clone, Serialize, Deserialize)]
struct AddressInput {
    contract: Address,
    target: Address,
    min_amount: u64,
}

pub fn main() {
    let secret: [u8; 32] = sp1_zkvm::io::read();
    let nonce: [u8; 32] = sp1_zkvm::io::read();
    let dead_address: [u8; 20] = sp1_zkvm::io::read();
    let amount: u64 = sp1_zkvm::io::read();
    let receiver: [u8; 20] = sp1_zkvm::io::read();
    let block_hash: [u8; 32] = sp1_zkvm::io::read();
    let wormAddress: [u8; 20] = sp1_zkvm::io::read();
    let contract_address: [u8; 20] = sp1_zkvm::io::read();
    let data: Vec<u8> = sp1_zkvm::io::read();

    // Debug prints to verify inputs
    println!("Amount read: {}", amount);
    println!("Receiver read: 0x{}", hex::encode(receiver));

    let state_sketch_bytes = sp1_zkvm::io::read::<Vec<u8>>();
    let state_sketch = bincode::deserialize::<EVMStateSketch>(&state_sketch_bytes).unwrap();

    let address_input_bytes = sp1_zkvm::io::read::<Vec<u8>>();
    let mut address_input: AddressInput = bincode::deserialize(&address_input_bytes).unwrap();

    let msg_sender: [u8; 20] = [0x01; 20];
    let bytecode: [u8; 32] = [0x00; 32];
    let mut hasher = Sha256::new();
    hasher.update(&secret);
    let secret_hash = hasher.finalize();
    let mut hasher = Sha256::new();
    hasher.update(&secret_hash);
    hasher.update(&nonce);
    let salt = hasher.finalize();
    let mut hasher = Sha256::new();
    hasher.update(&[0xff]);
    hasher.update(&msg_sender);
    hasher.update(&salt);
    hasher.update(&bytecode);
    let computed_address_full = hasher.finalize();
    let computed_address = &computed_address_full[12..];
    assert_eq!(dead_address, computed_address, "deadAddress does not match Create2 result");

    address_input.target = Address::from_slice(&dead_address);
    address_input.min_amount = amount;

    let executor = ClientExecutor::new(&state_sketch).unwrap();
    let balance_call = IERC20::balanceOfCall { account: address_input.target };
    let call = ContractInput::new_call(address_input.contract, Address::default(), balance_call);
    let public_vals = executor.execute(call).unwrap();
    let balance = IERC20::balanceOfCall::abi_decode_returns(&public_vals.contractOutput, true).unwrap();

    let min_amount = U256::from(address_input.min_amount);
    let mut hasher = Sha256::new();
    hasher.update(&dead_address);
    let dead_address_hash = hasher.finalize();
    let dead_address_hash_bytes: [u8; 32] = dead_address_hash.into();

    let get_dead_hash_amount_call = IERC20::getDeadHashAmountCall { h: B256::from(dead_address_hash_bytes) };
    let call = ContractInput::new_call(address_input.contract, Address::default(), get_dead_hash_amount_call);
    let public_vals = executor.execute(call).unwrap();
    let dead_hash_amount = IERC20::getDeadHashAmountCall::abi_decode_returns(&public_vals.contractOutput, true).unwrap();

    assert!(
        balance._0 >= min_amount + dead_hash_amount._0,
        "Balance {} is less than required minimum {} + dead hash amount {}",
        balance._0,
        min_amount,
        dead_hash_amount._0
    );

    let mut hasher = Sha256::new();
    hasher.update(&dead_address);
    hasher.update(&receiver);
    hasher.update(&amount.to_be_bytes());
    hasher.update(&block_hash);
    hasher.update(&wormAddress);
    hasher.update(&data);
    let nullifier = hasher.finalize();

    let public_values = PublicValuesStruct {
        amount,
        receiver: receiver.into(),
        nullifier: alloy_primitives::FixedBytes(nullifier.into()),
        deadAddressHash: alloy_primitives::FixedBytes(dead_address_hash_bytes),
        blockHash: alloy_primitives::FixedBytes(block_hash),
        contractAddress: wormAddress.into(),
        data: data.into(),
    };
    let bytes = public_values.abi_encode();
    println!("bytesxxxx: 0x{}", hex::encode(&bytes));

    sp1_zkvm::io::commit_slice(&bytes);
}