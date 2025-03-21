// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {WormholeERC20} from "../src/WormholeERC20.sol";
import {ISP1Verifier} from "sp1-contracts/ISP1Verifier.sol";

contract TestBytes is Test {
    WormholeERC20 token;
    bytes32 programVKey = keccak256("test-vkey");

    // Example ABI-encoded public values (simplified for testing)
    function encodePublicValues(
        uint64 amount,
        address receiverAddr,
        bytes32 nullifier,
        bytes32 deadAddressHash,
        bytes32 blockHash,
        address contractAddr,
        bytes memory data
    ) internal pure returns (bytes memory) {
        return
            abi.encode(
                WormholeERC20.PublicValuesStruct({
                    amount: amount,
                    receiver: receiverAddr,
                    nullifier: nullifier,
                    deadAddressHash: deadAddressHash,
                    blockHash: blockHash,
                    contractAddress: contractAddr,
                    data: data
                })
            );
    }

    function setUp() public {
        token = new WormholeERC20(
            "WormholeERC20",
            "WHS",
            programVKey,
            address(0)
        );
    }

    function test_pubInput() public {
        uint64 amount = 1e17;
        address receiver = 0xB80f75Bb1a766BC6269D2eB205ed7C986513BC0b;
        bytes32 nullifier = 0x4f13cffeca2fae397dfb7e2bef692043e9b21a96c9f6b32b20df85c44d008fae;
        bytes32 deadAddressHash = 0xab4c32b3e0081dbd5ab453a3d05158ee04969c5d3b3861d07ba6a3b8ccaea62c;
        bytes32 blockHash = 0x200000000000000013cd57d6ba8ecdd872201861798068f371f2fd155a16bfb6;
        address contract_address = 0xDE08A36B14Bf476da888cCAf6EFBCc02E6107c28;

        bytes memory shouldBe = encodePublicValues(
            amount,
            receiver,
            nullifier,
            deadAddressHash,
            blockHash,
            contract_address,
            "0x"
        );

        console.logBytes(shouldBe);
        bytes
            memory pubInput = hex"0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000016345785d8a0000000000000000000000000000b80f75bb1a766bc6269d2eb205ed7c986513bc0b682a2a8023f67a6c48cefb1305fc705c8e06311d5942de0e3bcf6e4ac611b94fab4c32b3e0081dbd5ab453a3d05158ee04969c5d3b3861d07ba6a3b8ccaea62c2000000000000000cec39db61894fab319382bda86e822138273aedc8624b092000000000000000000000000de08a36b14bf476da888ccaf6efbcc02e6107c2800000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000000";
        uint256 amountRetrieved = token.deserializePubVals(shouldBe);
        assertEq(amountRetrieved, 100000000000000000, "Amount should be 100"); // 0x016345785d8a0000 = 100 ETH in wei
    }
}

// corretto:
// 0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000016345785d8a0000000000000000000000000000b80f75bb1a766bc6269d2eb205ed7c986513bc0b4f13cffeca2fae397dfb7e2bef692043e9b21a96c9f6b32b20df85c44d008faeab4c32b3e0081dbd5ab453a3d05158ee04969c5d3b3861d07ba6a3b8ccaea62c200000000000000013cd57d6ba8ecdd872201861798068f371f2fd155a16bfb6000000000000000000000000de08a36b14bf476da888ccaf6efbcc02e6107c2800000000000000000000000000000000000000000000000000000000000000e000000000000000000000000000000000000000000000000000000000000000023078000000000000000000000000000000000000000000000000000000000000

// 0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000016345785d8a0000000000000000000000000000b80f75bb1a766bc6269d2eb205ed7c986513bc0b682a2a8023f67a6c48cefb1305fc705c8e06311d5942de0e3bcf6e4ac611b94fab4c32b3e0081dbd5ab453a3d05158ee04969c5d3b3861d07ba6a3b8ccaea62c2000000000000000cec39db61894fab319382bda86e822138273aedc8624b092000000000000000000000000de08a36b14bf476da888ccaf6efbcc02e6107c2800000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000000
