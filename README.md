# ZK Wormhole - Native ERC20 with Private Transfer
The **ZK Wormhole ERC20 token standard** enhances transaction privacy by breaking the on-chain link between sender and receiver.

ZKWormhole Tokens are sent to a precomputed unspendable address (which looks like a standard 0x address). Users can later re-mint the tokens, even partially, by providing a zk-SNARK proof using the [succinct.xyz SP1 zkvm](https://docs.succinct.xyz/docs/sp1/introduction).

## Index

1. [About The Proof](#about-the-proof)
2. [Using Sp1](#using-sp1)
3. [Contracts](#contracts)

![photo_2025-03-22 18 14 41](https://github.com/user-attachments/assets/477b707f-f6c6-4740-99ef-db4ba312bd4d)

## About The Proof

Users need to create locally that they know the dead address anothter user sent `ZKWormholeERC20` to.
The proof validates the following:

- The sender knows the precomputed dead address.
- The sender can compute the dead address using CREATE2 based on the SP1 program, where:
- The sender and bytecode are fixed.
- The salt is calculated from the depositor's secret.
- The sender has sent enough funds to the dead address.

## Using Sp1

1. 

```bash
RUST_LOG=info cargo run --release -- --prove \
  --amount 1000 \
  --receiver 0xABABABABABABABABABABABABABABABABABABABAB \
  --secret 0x4242424242424242424242424242424242424242424242424242424242424242 \
  --nonce 0x9999999999999999999999999999999999999999999999999999999999999999
```

## Contracts

### Addresses:

- **WormholeWrapper deployed at**: [0x6D46BE315b48f579387A5EA247E1E25D2FcCE7EE](https://holesky.etherscan.io/address/0x6D46BE315b48f579387A5EA247E1E25D2FcCE7EE#readContract)
- **Trifecta USDC (for testing) deployed at**: [0xe8b3C7e5BD537159698656251A5F187BeBEa995D](https://holesky.etherscan.io/token/0xe8b3c7e5bd537159698656251a5f187bebea995d?a=0xb80f75bb1a766bc6269d2eb205ed7c986513bc0b#readContract)

### ZKWormholeERC20

This is the standard contract implementing the logic for the zk-wormhole protocol.

Users can mint `ZKWormholeERC20` tokens using a [succint zkSp1 proof](https://docs.succinct.xyz/docs/sp1/introduction) by calling `mintWithProof(bytes calldata _publicValues,bytes calldata _proofBytes)`

### ZKWormholeWrapper

The `ZKWormholeWrapper` contract is used to `wrap`/`unwrap` common ERC20 tokens and optionally use
`ZKWormholeERC20` standard to verify the proof and claim the underlying ERC20 leveraging privacy capabilities of the protocol.

### Test & Deploy

To run tests:

```bash
make test
```

To Deploy a Wrapper:

```bash
make deploy-zk-wrm TOKEN=0xe8b3C7e5BD537159698656251A5F187BeBEa995D
```

