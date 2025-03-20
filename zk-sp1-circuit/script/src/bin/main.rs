//! An end-to-end example of using the SP1 SDK to execute or prove your circuit program.

use alloy_sol_types::SolType;
use clap::Parser;
use sp1_sdk::{include_elf, ProverClient, SP1Stdin};
use sha2::{Digest, Sha256};

// Define the ELF for your circuit program.
pub const CIRCUIT_ELF: &[u8] = include_elf!("wormhole-program");

// Define the public values struct matching your circuit's output.
#[derive(Debug)]
struct PublicValuesStruct {
    amount: u64,
    receiver: [u8; 20],
    proof_hash: [u8; 32],
}

impl PublicValuesStruct {
    fn abi_decode(bytes: &[u8], validate: bool) -> Result<Self, alloy_sol_types::Error> {
        let amount = u64::from_be_bytes(bytes[0..8].try_into().unwrap());
        let receiver = bytes[8..28].try_into().unwrap();
        let proof_hash = bytes[28..60].try_into().unwrap();
        Ok(Self { amount, receiver, proof_hash })
    }
}

// Function to precompute dead_address using Create2-like logic
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

// CLI arguments.
#[derive(Parser, Debug)]
#[clap(author, version, about, long_about = None)]
struct Args {
    #[clap(long)]
    execute: bool,

    #[clap(long)]
    prove: bool,

    #[clap(long, default_value = "1000")]
    amount: u64,

    #[clap(long, default_value = "0xABABABABABABABABABABABABABABABABABABABAB")]
    receiver: String,

    #[clap(long, default_value = "0x4242424242424242424242424242424242424242424242424242424242424242")]
    secret: String,

    #[clap(long, default_value = "0x9999999999999999999999999999999999999999999999999999999999999999")]
    nonce: String,
}

fn main() {
    sp1_sdk::utils::setup_logger();
    dotenv::dotenv().ok();

    let args = Args::parse();

    if args.execute == args.prove {
        eprintln!("Error: You must specify either --execute or --prove");
        std::process::exit(1);
    }

    let client = ProverClient::from_env();

    let mut stdin = SP1Stdin::new();

    let secret: [u8; 32] = hex::decode(&args.secret[2..]).unwrap().try_into().unwrap();
    let nonce: [u8; 32] = hex::decode(&args.nonce[2..]).unwrap().try_into().unwrap();
    let amount = args.amount;
    let receiver: [u8; 20] = hex::decode(&args.receiver[2..]).unwrap().try_into().unwrap();

    // Precompute dead_address
    let dead_address = compute_dead_address(&secret, &nonce, amount);

    stdin.write(&secret);
    stdin.write(&nonce);
    stdin.write(&dead_address);
    stdin.write(&amount);
    stdin.write(&receiver);

    println!("amount: {}", amount);
    println!("receiver: {}", args.receiver);
    println!("secret: {}", args.secret);
    println!("nonce: {}", args.nonce);
    println!("dead_address: 0x{}", hex::encode(dead_address));

    if args.execute {
        let (output, report) = client.execute(CIRCUIT_ELF, &stdin).run().unwrap();
        println!("Program executed successfully.");
        let decoded = PublicValuesStruct::abi_decode(output.as_slice(), true).unwrap();
        println!("amount: {}", decoded.amount);
        println!("receiver: 0x{}", hex::encode(decoded.receiver));
        println!("proof_hash: 0x{}", hex::encode(decoded.proof_hash));
        println!("Number of cycles: {}", report.total_instruction_count());
    } else {
        let (pk, vk) = client.setup(CIRCUIT_ELF);
        let proof = client.prove(&pk, &stdin).run().expect("failed to generate proof");
        println!("Successfully generated proof!");
        client.verify(&proof, &vk).expect("failed to verify proof");
        println!("Successfully verified proof!");
    }
}