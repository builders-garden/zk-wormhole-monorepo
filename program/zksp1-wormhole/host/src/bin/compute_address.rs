use alloy::hex;
use clap::Parser;
use sha2::{Digest, Sha256};

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
    //hasher.update(&amount.to_be_bytes());
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
    #[clap(long, default_value = "0x4242424242424242424242424242424242424242424242424242424242424242")]
    secret: String,

    #[clap(long, default_value = "0x9999999999999999999999999999999999999999999999999999999999999999")]
    nonce: String,

    #[clap(long, default_value = "1000")]
    amount: u64,
}

fn main() -> eyre::Result<()> {
    let args = Args::parse();

    // Parse CLI arguments
    let secret: [u8; 32] = hex::decode(&args.secret[2..])?.try_into().map_err(|_| eyre::eyre!("Invalid secret length"))?;
    let nonce: [u8; 32] = hex::decode(&args.nonce[2..])?.try_into().map_err(|_| eyre::eyre!("Invalid nonce length"))?;
    let amount = args.amount;

    // Compute dead address
    let dead_address = compute_dead_address(&secret, &nonce, amount);
    println!("Dead address: 0x{}", hex::encode(dead_address));

    Ok(())
} 