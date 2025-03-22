# ZkWormhole Contracts

This folder contains the contracts for zk-wormhole protocol, inspired by the [EIP-7503: ZK Wormhole EIP](https://eips.ethereum.org/EIPS/eip-7503).

## Addresses:

- WormholeWrapper deployed at: [0x6D46BE315b48f579387A5EA247E1E25D2FcCE7EE](https://holesky.etherscan.io/address/0x6D46BE315b48f579387A5EA247E1E25D2FcCE7EE#readContract)
- Trifecta USDC (for testing) deployed at: [0xe8b3C7e5BD537159698656251A5F187BeBEa995D](https://holesky.etherscan.io/token/0xe8b3c7e5bd537159698656251a5f187bebea995d?a=0xb80f75bb1a766bc6269d2eb205ed7c986513bc0b#readContract)

## ZKWormholeERC20

This is the standard contract implementing the logic for the zk-wormhole protocol.

Users can mint `ZKWormholeERC20` tokens using a [succint zkSp1 proof](https://docs.succinct.xyz/docs/sp1/introduction) by calling `mintWithProof(bytes calldata _publicValues,bytes calldata _proofBytes)`

### The Proof

Users need to create locally that they know the dead address anothter user sent `ZKWormholeERC20` to.
The proof validates the following:

- The sender knows the precomputed dead address.
- The sender can compute the dead address using CREATE2 based on the SP1 program, where:
- The sender and bytecode are fixed.
- The salt is calculated from the depositor's secret.
- The sender has sent enough funds to the dead address.

## ZKWormholeWrapper

The `ZKWormholeWrapper` contract is used to `wrap`/`unwrap` common ERC20 tokens and optionally use
`ZKWormholeERC20` standard to verify the proof and claim the underlying ERC20 leveraging privacy capabilities of the protocol.

## Test & Deploy

To run tests:

```bash
make test
```

To Deploy a Wrapper:

```bash
make deploy-zk-wrm TOKEN=0xe8b3C7e5BD537159698656251A5F187BeBEa995D
```
