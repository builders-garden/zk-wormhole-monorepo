use std::path::PathBuf;
use std::str::FromStr;

use alloy::hex;
use alloy_primitives::{Address,B256};
use alloy_provider::RootProvider;
use alloy_rpc_types::BlockNumberOrTag;
use alloy_sol_types::{SolType, SolValue};
use alloy_sol_macro::sol;
use clap::Parser;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use sp1_cc_client_executor::ContractInput;
use sp1_cc_host_executor::HostExecutor;
use sp1_sdk::{include_elf, utils, HashableKey, ProverClient, SP1ProofWithPublicValues, SP1Stdin};
use url::Url;

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

const ELF: &[u8] = include_elf!("zk-wormhole-program");

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct SP1CCProofFixture {
    vkey: String,
    public_values: String,
    proof: String,
}

fn compute_dead_address(secret: &[u8; 32], nonce: &[u8; 32], amount: u64) -> [u8; 20] {
    let msg_sender: [u8; 20] = [0x01; 20];
    let bytecode: [u8; 32] = [0x00; 32];

    let mut hasher = Sha256::new();
    hasher.update(secret);
    let secret_hash = hasher.finalize();

    let mut hasher = Sha256::new();
    hasher.update(&secret_hash);
    hasher.update(nonce);
    let salt = hasher.finalize();

    let mut hasher = Sha256::new();
    hasher.update(&[0xff]);
    hasher.update(&msg_sender);
    hasher.update(&salt);
    hasher.update(&bytecode);
    let computed_address_full = hasher.finalize();

    computed_address_full[12..].try_into().unwrap()
}

#[derive(Parser, Debug)]
#[clap(author, version, about, long_about = None)]
struct Args {
    #[clap(long, default_value = "false")]
    prove: bool,

    #[clap(long, default_value = "0xDE08A36B14Bf476da888cCAf6EFBCc02E6107c28")]
    contract_address: String,

    #[clap(long, default_value = "100000000000000000")]
    amount: u64,

    #[clap(long, default_value = "0xB80f75Bb1a766BC6269D2eB205ed7C986513BC0b")] 
    receiver: String,

    #[clap(long, default_value = "0x4242424242424242424242424242424242424242424242424242424242424242")]
    secret: String,

    #[clap(long, default_value = "0x9999999999999999999999999999999999999999999999999999999999999999")]
    nonce: String,
}

fn save_fixture(vkey: String, proof: &SP1ProofWithPublicValues) {
    let fixture = SP1CCProofFixture {
        vkey: format!("0x{}", hex::encode(vkey)),
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
    println!("Parsed Args: {:?}", args); // Debug print to verify args

    let contract_address = Address::from_str(&args.contract_address)
        .map_err(|_| eyre::eyre!("Invalid contract address"))?;
    let secret: [u8; 32] = hex::decode(&args.secret[2..])?.try_into().map_err(|_| eyre::eyre!("Invalid secret length"))?;
    let nonce: [u8; 32] = hex::decode(&args.nonce[2..])?.try_into().map_err(|_| eyre::eyre!("Invalid nonce length"))?;
    let amount = args.amount;
    let receiver: [u8; 20] = hex::decode(&args.receiver[2..])?.try_into().map_err(|_| eyre::eyre!("Invalid receiver length"))?;
    let wormAddress: [u8; 20] = hex::decode(&args.contract_address[2..])?.try_into().map_err(|_| eyre::eyre!("Invalid receiver length"))?;

    let dead_address = compute_dead_address(&secret, &nonce, amount);

    println!("Checking dead address: 0x{}", hex::encode(dead_address));
    println!("Amount: {}", amount);
    println!("Receiver: {}", args.receiver);
    println!("Worm address: {}", hex::encode(wormAddress));
    println!("Contract_address: {}", contract_address);

    let rpc_url = std::env::var("ETH_RPC_URL").unwrap_or_else(|_| panic!("Missing ETH_RPC_URL in env"));
    let provider = RootProvider::new_http(Url::parse(&rpc_url)?);
    let mut host_executor = HostExecutor::new(provider.clone(), BlockNumberOrTag::Latest).await?;
    let block_hash = host_executor.header.hash_slow();

    let balance_call = IERC20::balanceOfCall { account: Address::from_slice(&dead_address) };
    host_executor
        .execute(ContractInput::new_call(contract_address, Address::default(), balance_call))
        .await?;

    let mut hasher = Sha256::new();
    hasher.update(&dead_address);
    let dead_address_hash = hasher.finalize();
    let dead_address_hash_bytes: [u8; 32] = dead_address_hash.into();

    let get_dead_hash_amount_call = IERC20::getDeadHashAmountCall { h: alloy_primitives::FixedBytes(dead_address_hash_bytes) };
    host_executor
        .execute(ContractInput::new_call(contract_address, Address::default(), get_dead_hash_amount_call))
        .await?;

    let state_sketch = host_executor.finalize().await?;

    let address_input = AddressInput {
        contract: contract_address,
        target: Address::from_slice(&dead_address),
        min_amount: amount,
    };

    let mut stdin = SP1Stdin::new();
    stdin.write(&secret);
    stdin.write(&nonce);
    stdin.write(&dead_address);
    stdin.write(&amount);
    stdin.write(&receiver);
    stdin.write(&block_hash);
    stdin.write(&wormAddress);
    stdin.write(&contract_address);
    stdin.write(&Vec::<u8>::new());
    stdin.write(&bincode::serialize(&state_sketch)?);
    stdin.write(&bincode::serialize(&address_input)?);

    let client = ProverClient::from_env();

    if !args.prove {
        let (output, report) = client
            .execute(ELF, &stdin)
            .run()
            .map_err(|e| eyre::eyre!("Execution failed: {}", e))?;
        println!("Program executed successfully with {} cycles", report.total_instruction_count());
        let decoded = <PublicValuesStruct as SolType>::abi_decode(output.as_slice(), true)?;
        println!("Amount: {}", decoded.amount);
        println!("Receiver: 0x{}", hex::encode(decoded.receiver));
        println!("Nullifier: 0x{}", hex::encode(decoded.nullifier));
        println!("Dead address hash: 0x{}", hex::encode(decoded.deadAddressHash));
        println!("Block hash: 0x{}", hex::encode(decoded.blockHash));
        println!("Contract address: 0x{}", hex::encode(decoded.contractAddress));
        println!("Worm address: 0x{}", hex::encode(decoded.contractAddress));
        println!("Data: 0x{}", hex::encode(decoded.data));
    } else {
        let (pk, vk) = client.setup(ELF);
        let proof = client
            .prove(&pk, &stdin)
            .groth16()
            .run()
            .map_err(|e| eyre::eyre!("Proof generation failed: {}", e))?;
        println!("Generated proof");

        let public_vals = <PublicValuesStruct as SolType>::abi_decode(proof.public_values.as_slice(), true)?;
        println!("Amount: {}", public_vals.amount);
        println!("Receiver: 0x{}", hex::encode(public_vals.receiver));
        println!("Block hash: 0x{}", hex::encode(public_vals.blockHash));
        println!("Contract address: 0x{}", hex::encode(public_vals.contractAddress));
        println!("Data: 0x{}", hex::encode(public_vals.data));

        save_fixture(vk.bytes32(), &proof);
        println!("Saved proof to plonk-fixture.json");

        client.verify(&proof, &vk).map_err(|e| eyre::eyre!("Verification failed: {}", e))?;
        println!("Successfully verified proof!");
    }

    Ok(())
}