use alloy_sol_types::SolType;
use clap::{Parser, ValueEnum};
use serde::{Deserialize, Serialize};
use sp1_sdk::{
    include_elf, HashableKey, ProverClient, SP1ProofWithPublicValues, SP1Stdin, SP1VerifyingKey,
};
use std::path::PathBuf;

// Define the ELF for your circuit program.
pub const CIRCUIT_ELF: &[u8] = include_elf!("wormhole-program");

// Define the public values struct.
#[derive(Debug)]
struct PublicValuesStruct {
    amount: u64,
    receiver: [u8; 20],
    proof_hash: [u8; 32],
}

impl PublicValuesStruct {
    fn abi_decode(bytes: &[u8], _validate: bool) -> Result<Self, alloy_sol_types::Error> {
        let amount = u64::from_be_bytes(bytes[0..8].try_into().unwrap());
        let receiver = bytes[8..28].try_into().unwrap();
        let proof_hash = bytes[28..60].try_into().unwrap();
        Ok(Self {
            amount,
            receiver,
            proof_hash,
        })
    }
}

#[derive(Parser, Debug)]
struct EVMArgs {
    #[clap(long, default_value = "1000")]
    amount: u64,

    #[clap(long, default_value = "0xABABABABABABABABABABABABABABABABABABABAB")]
    receiver: String,

    #[clap(long, value_enum, default_value = "groth16")]
    system: ProofSystem,
}

#[derive(Copy, Clone, PartialEq, Eq, PartialOrd, Ord, ValueEnum, Debug)]
enum ProofSystem {
    Plonk,
    Groth16,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct SP1CircuitProofFixture {
    amount: u64,
    receiver: String,
    proof_hash: String,
    vkey: String,
    public_values: String,
    proof: String,
}

fn main() {
    sp1_sdk::utils::setup_logger();

    let args = EVMArgs::parse();
    let client = ProverClient::from_env();
    let (pk, vk) = client.setup(CIRCUIT_ELF);

    let mut stdin = SP1Stdin::new();
    let secret = [0x42; 32];
    let nonce = [0x99; 32];
    let dead_address = [0xFF; 20]; // Must match Create2 in real use
    let amount = args.amount;
    let receiver: [u8; 20] = hex::decode(&args.receiver[2..])
        .unwrap()
        .try_into()
        .unwrap();

    stdin.write(&secret);
    stdin.write(&nonce);
    stdin.write(&dead_address);
    stdin.write(&amount);
    stdin.write(&receiver);

    println!("amount: {}", amount);
    println!("receiver: {}", args.receiver);
    println!("Proof System: {:?}", args.system);

    let proof = match args.system {
        ProofSystem::Plonk => client.prove(&pk, &stdin).plonk().run(),
        ProofSystem::Groth16 => client.prove(&pk, &stdin).groth16().run(),
    }
    .expect("failed to generate proof");

    create_proof_fixture(&proof, &vk, args.system);
}

fn create_proof_fixture(
    proof: &SP1ProofWithPublicValues,
    vk: &SP1VerifyingKey,
    system: ProofSystem,
) {
    let bytes = proof.public_values.as_slice();
    let decoded = PublicValuesStruct::abi_decode(bytes, false).unwrap();

    let fixture = SP1CircuitProofFixture {
        amount: decoded.amount,
        receiver: format!("0x{}", hex::encode(decoded.receiver)),
        proof_hash: format!("0x{}", hex::encode(decoded.proof_hash)),
        vkey: vk.bytes32().to_string(),
        public_values: format!("0x{}", hex::encode(bytes)),
        proof: format!("0x{}", hex::encode(proof.bytes())),
    };

    println!("Verification Key: {}", fixture.vkey);
    println!("Public Values: {}", fixture.public_values);
    println!("Proof Bytes: {}", fixture.proof);

    let fixture_path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../contracts/src/fixtures");
    std::fs::create_dir_all(&fixture_path).expect("failed to create fixture path");
    std::fs::write(
        fixture_path.join(format!("{:?}-fixture.json", system).to_lowercase()),
        serde_json::to_string_pretty(&fixture).unwrap(),
    )
    .expect("failed to write fixture");
}
