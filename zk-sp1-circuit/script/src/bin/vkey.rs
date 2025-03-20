use sp1_sdk::{include_elf, HashableKey, Prover, ProverClient};

// Define the ELF for your circuit program.
pub const CIRCUIT_ELF: &[u8] = include_elf!("wormhole-program");

fn main() {
    let prover = ProverClient::builder().cpu().build();
    let (_, vk) = prover.setup(CIRCUIT_ELF);
    println!("{}", vk.bytes32());
}
