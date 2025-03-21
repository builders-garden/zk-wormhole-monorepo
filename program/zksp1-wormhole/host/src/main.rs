use std::path::PathBuf;
use std::str::FromStr;

use alloy::hex;
use alloy_primitives::Address;
use alloy_provider::RootProvider;
use alloy_rpc_types::BlockNumberOrTag;
use alloy_sol_macro::sol;
use alloy_sol_types::{SolCall, SolValue};
use clap::Parser;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use sp1_cc_client_executor::ContractInput;
use sp1_cc_host_executor::HostExecutor;
use sp1_sdk::{include_elf, utils, HashableKey, ProverClient, SP1ProofWithPublicValues, SP1Stdin};
use url::Url;

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
    block_hash: [u8; 32],
    contract_address: [u8; 20],
    data: Vec<u8>,
}

impl PublicValuesStruct {
    fn abi_decode(bytes: &[u8], validate: bool) -> Result<Self, alloy_sol_types::Error> {
        let amount = u64::from_be_bytes(bytes[0..8].try_into().unwrap());
        let receiver = bytes[8..28].try_into().unwrap();
        let proof_hash = bytes[28..60].try_into().unwrap();
        let block_hash = bytes[60..92].try_into().unwrap();
        let contract_address = bytes[92..112].try_into().unwrap();
        let data = bytes[112..].to_vec();
        Ok(Self { amount, receiver, proof_hash, block_hash, contract_address, data })
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct AddressInput {
    contract: Address,
    target: Address,
    min_amount: u64,
}

/// The ELF we want to execute inside the zkVM.
const ELF: &[u8] = include_elf!("zk-wormhole-program");

/// A fixture that can be used to test the verification of SP1 zkVM proofs inside Solidity.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct SP1CCProofFixture {
    vkey: String,
    public_values: String,
    proof: String,
}

/// Function to precompute dead_address using Create2-like logic
fn compute_dead_address(secret: &[u8; 32], nonce: &[u8; 32], amount: u64) -> [u8; 20] {
    let msg_sender: [u8; 20] = [0x01; 20];
    let bytecode: [u8; 32] = [0x00; 32];

    let mut hasher = Sha256::new();
    hasher.update(secret);
    let secret_hash = hasher.finalize();

    let mut hasher = Sha256::new();
    hasher.update(&secret_hash);
    hasher.update(nonce);
    hasher.update(&amount.to_be_bytes());
    let salt = hasher.finalize();

    let mut hasher = Sha256::new();
    hasher.update(&[0xff]);
    hasher.update(&msg_sender);
    hasher.update(&salt);
    hasher.update(&bytecode);
    let computed_address_full = hasher.finalize();

    computed_address_full[12..].try_into().unwrap()
}

/// The arguments for the command.
#[derive(Parser, Debug)]
#[clap(author, version, about, long_about = None)]
struct Args {
    #[clap(long, default_value = "false")]
    prove: bool,

    #[clap(long, default_value = "0x4C6D1355Ff9922ac12Bd2BBA55d1E2CB9101BbCE")] // our token on holesky
    contract_address: String,

    #[clap(long, default_value = "1000")]
    amount: u64,

    #[clap(long, default_value = "0xABABABABABABABABABABABABABABABABABABABAB")]
    receiver: String,

    #[clap(long, default_value = "0x4242424242424242424242424242424242424242424242424242424242424242")]
    secret: String,

    #[clap(long, default_value = "0x9999999999999999999999999999999999999999999999999999999999999999")]
    nonce: String,
}

fn save_fixture(vkey: String, proof: &SP1ProofWithPublicValues) {
    let fixture = SP1CCProofFixture {
        vkey,
        public_values: format!("0x{}", hex::encode(proof.public_values.as_slice())),
        proof: format!("0x{}", hex::encode(proof.bytes())),
    };

    let fixture_path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../contracts/src/fixtures");
    std::fs::create_dir_all(&fixture_path).expect("failed to create fixture path");
    std::fs::write(
        fixture_path.join("plonk-fixture.json".to_lowercase()),
        serde_json::to_string_pretty(&fixture).unwrap(),
    )
    .expect("failed to write fixture");
}

#[tokio::main]
async fn main() -> eyre::Result<()> {
    dotenv::dotenv().ok();
    utils::setup_logger();

    let args = Args::parse();

    // Parse CLI arguments
    let contract_address = Address::from_str(&args.contract_address)
        .map_err(|_| eyre::eyre!("Invalid contract address"))?;
    let secret: [u8; 32] = hex::decode(&args.secret[2..])?.try_into().map_err(|_| eyre::eyre!("Invalid secret length"))?;
    let nonce: [u8; 32] = hex::decode(&args.nonce[2..])?.try_into().map_err(|_| eyre::eyre!("Invalid nonce length"))?;
    let amount = args.amount;
    let receiver: [u8; 20] = hex::decode(&args.receiver[2..])?.try_into().map_err(|_| eyre::eyre!("Invalid receiver length"))?;

    // Precompute dead_address
    let dead_address = compute_dead_address(&secret, &nonce, amount);

    println!("Checking dead address: 0x{}", hex::encode(dead_address));
    println!("Amount: {}", amount);
    println!("Receiver: {}", args.receiver);
    println!("Contract address: {}", args.contract_address);

    // Set up the EVM state
    let rpc_url = std::env::var("ETH_RPC_URL").unwrap_or_else(|_| panic!("Missing ETH_RPC_URL in env"));
    let provider = RootProvider::new_http(Url::parse(&rpc_url)?);
    let mut host_executor = HostExecutor::new(provider.clone(), BlockNumberOrTag::Latest).await?;
    let block_hash = host_executor.header.hash_slow();

    // Execute balanceOf call to get EVM state sketch
    let balance_call = IERC20::balanceOfCall { account: Address::from_slice(&dead_address) };
    host_executor
        .execute(ContractInput::new_call(contract_address, Address::default(), balance_call))
        .await?;
    let state_sketch = host_executor.finalize().await?;

    // Prepare AddressInput
    let address_input = AddressInput {
        contract: contract_address,
        target: Address::from_slice(&dead_address),
        min_amount: amount,
    };

    // Prepare SP1 input
    let mut stdin = SP1Stdin::new();
    stdin.write(&secret);
    stdin.write(&nonce);
    stdin.write(&dead_address);
    stdin.write(&amount);
    stdin.write(&receiver);
    stdin.write(&block_hash);
    stdin.write(&contract_address);
    stdin.write(&Vec::<u8>::new()); // Empty data as default
    stdin.write(&bincode::serialize(&state_sketch)?);
    stdin.write(&bincode::serialize(&address_input)?);

    // Create ProverClient
    let client = ProverClient::from_env();

    // Execute or prove
    if !args.prove {
        let (output, report) = client
            .execute(ELF, &stdin)
            .run()
            .map_err(|e| eyre::eyre!("Execution failed: {}", e))?;
        println!("Program executed successfully with {} cycles", report.total_instruction_count());
        let decoded = PublicValuesStruct::abi_decode(output.as_slice(), true)?;
        println!("Amount: {}", decoded.amount);
        println!("Receiver: 0x{}", hex::encode(decoded.receiver));
        println!("Proof hash: 0x{}", hex::encode(decoded.proof_hash));
        println!("Block hash: 0x{}", hex::encode(decoded.block_hash));
        println!("Contract address: 0x{}", hex::encode(decoded.contract_address));
        println!("Data: 0x{}", hex::encode(decoded.data));
    } else {
        let (pk, vk) = client.setup(ELF);
        let proof = client
            .prove(&pk, &stdin)
            .groth16()
            .run()
            .map_err(|e| eyre::eyre!("Proof generation failed: {}", e))?;
        println!("Generated proof");

        let public_vals = PublicValuesStruct::abi_decode(proof.public_values.as_slice(), true)?;
        println!("Amount: {}", public_vals.amount);
        println!("Receiver: 0x{}", hex::encode(public_vals.receiver));
        println!("Proof hash: 0x{}", hex::encode(public_vals.proof_hash));
        println!("Block hash: 0x{}", hex::encode(public_vals.block_hash));
        println!("Contract address: 0x{}", hex::encode(public_vals.contract_address));
        println!("Data: 0x{}", hex::encode(public_vals.data));

        save_fixture(vk.bytes32(), &proof);
        println!("Saved proof to plonk-fixture.json");

        client.verify(&proof, &vk).map_err(|e| eyre::eyre!("Verification failed: {}", e))?;
        println!("Successfully verified proof!");
    }

    Ok(())
}