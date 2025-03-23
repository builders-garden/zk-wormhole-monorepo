# ZK Wormhole - Native ERC20 with Private Transfer
The **ZK Wormhole ERC20 token standard**  improves transaction privacy on public EVM chains by leveraging zero-knowledge proofs enabling the minting of secretly burnt ZKW-ERC20. 
The project is inspired by [EIP-7503: Zero-Knowledge Wormholes](https://eips.ethereum.org/EIPS/eip-7503).

ZK Wormhole allows the following:
1) Address A pre-computes an unspendable address that looks like a common 0x address using CREATE2. The CREATE2 calculates the address as H(sender, bytecode,salt). The sender and bytecode are fixed while the salt is calculated from a secret and nonce from the user.
2) Address A makes a standard transfer of ZKW-ERC20 tokens to the pre-computed unspendable address of amount X.
3)  Address A generates a proof using our SP1 zkvm program. The proof proves that:
   - The sender knows the precomputed unspendable address.
   - The sender can compute the unspendable address using CREATE2 providing the secret and nonce
- The sender and bytecode are fixed according to the program => the unspendable address is actually unspendable
- The sender has sent enough funds to the unspendable address than the ones he is asking for. This is made by proving the Ethereum state in the zkvm and proving the balanceOf call execution checking the unspendable balance
4) Any address (so not only Address A) can submit the ZK SNARK proof and the proof public values onchain and reminting the tokens. The proof public values contain the amount to remint and the address recipient. This way the mint transaction can be relayed by any address for maximum privacy. The smart contract validates the nullified preventing the tokens double spending, however, the smart contract allows partial minting too.


## Index

1. [About The Proof](#about-the-proof)
2. [Using Sp1](#using-sp1)
3. [Contracts](#contracts)

![photo_2025-03-22 18 14 41](https://github.com/user-attachments/assets/477b707f-f6c6-4740-99ef-db4ba312bd4d)

## About The Proof

Users need to create locally a zk-proof proving that they know a pre-computed `unspendable address` where anothter user sent `ZKWormholeERC20` to.
The proof validates the following:

- The sender knows the precomputed unspendable address.
- The sender can compute the unspendable address using CREATE2 based on the SP1 program, where:
- The sender and bytecode are fixed.
- The salt is calculated from the depositor's secret.
- The sender has sent enough funds to the unspendable address.

## Using Sp1
In order to generate the proof, you need to run a succint Sp1 prover locally. here's the steps:

1. Download Executable
```bash
curl -L https://github.com/builders-garden/zk-wormhole-monorepo/archive/refs/heads/main.tar.gz | tar xz --strip-components=1 "main/executables"
```

2. Precompute an Unspendable Address
```
./executables/zk-wormhole-host --dead --secret <secret string> --nonce 
<secret nonce>
```

3. Generate proof
```
./executables/zk-wormhole-host --prove --dead --secret <secret string> --nonce 
<secret nonce>
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

