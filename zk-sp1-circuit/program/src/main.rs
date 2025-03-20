#![no_main]
sp1_zkvm::entrypoint!(main);

// use alloy_sol_types::SolType;
use sha2::{Digest, Sha256};

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

pub fn main() {
    let secret: [u8; 32] = sp1_zkvm::io::read();
    let nonce: [u8; 32] = sp1_zkvm::io::read();
    let dead_address: [u8; 20] = sp1_zkvm::io::read();
    let amount: u64 = sp1_zkvm::io::read();
    let receiver: [u8; 20] = sp1_zkvm::io::read();

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

    let mut hasher = Sha256::new();
    hasher.update(&dead_address);
    hasher.update(&receiver);
    hasher.update(&amount.to_be_bytes());
    let proof_hash = hasher.finalize();

    let public_values = PublicValuesStruct {
        amount,
        receiver,
        proof_hash: proof_hash.into(),
    };
    let bytes = public_values.abi_encode();
    sp1_zkvm::io::commit_slice(&bytes);
}
