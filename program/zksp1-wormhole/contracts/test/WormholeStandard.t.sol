// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {WormholeERC20} from "../src/WormholeERC20.sol";
import {ISP1Verifier} from "sp1-contracts/ISP1Verifier.sol";

// Mock SP1 Verifier contract for testing
contract MockSP1Verifier is ISP1Verifier {
    bool public shouldPass;

    function setShouldPass(bool _shouldPass) external {
        shouldPass = _shouldPass;
    }

    function verifyProof(
        bytes32 /**vkey */,
        bytes calldata /**publicValues */,
        bytes calldata /**proofBytes */
    ) external view override {
        if (!shouldPass) {
            revert("Proof verification failed");
        }
        // Simulate successful verification
    }

    function test() public {}
}

contract WormholeERC20Test is Test {
    WormholeERC20 token;
    MockSP1Verifier verifier;
    bytes32 programVKey = keccak256("test-vkey");
    address receiver = address(0x123);

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
        verifier = new MockSP1Verifier();
        token = new WormholeERC20(
            "WormholeERC20",
            "WHS",
            programVKey,
            address(verifier)
        );
    }

    function test_MintWithProof_Success() public {
        // Arrange
        verifier.setShouldPass(true);
        bytes memory publicValues = encodePublicValues(
            1000, // amount
            receiver, // receiver
            keccak256("nullifier1"), // nullifier
            keccak256("deadHash1"), // deadAddressHash
            keccak256("block1"), // blockHash
            address(token), // contractAddress
            new bytes(0) // empty data
        );
        bytes memory proofBytes = hex"abcd"; // Dummy proof

        // Act
        token.mintWithProof(publicValues, proofBytes);

        // Assert
        assertEq(
            token.balanceOf(receiver),
            1000,
            "Receiver should have 1000 tokens"
        );
        assertEq(
            token.getDeadHashAmount(keccak256("deadHash1")),
            1000,
            "Dead hash amount should be 1000"
        );
        assertTrue(
            token.s_nullifiers(keccak256("nullifier1")),
            "Nullifier should be marked used"
        );
    }

    function test_MintWithProof_ProofAlreadyUsed() public {
        // Arrange
        verifier.setShouldPass(true);
        bytes memory publicValues = encodePublicValues(
            1000,
            receiver,
            keccak256("nullifier1"),
            keccak256("deadHash1"),
            keccak256("block1"),
            address(token),
            new bytes(0)
        );
        bytes memory proofBytes = hex"abcd";

        // First mint (should succeed)
        token.mintWithProof(publicValues, proofBytes);

        // Act & Assert
        vm.expectRevert(WormholeERC20.ProofIsAlreadyUsed.selector);
        token.mintWithProof(publicValues, proofBytes); // Second mint with same nullifier should revert
    }

    function test_MintWithProof_InvalidProof() public {
        // Arrange
        verifier.setShouldPass(false); // Simulate proof verification failure
        bytes memory publicValues = encodePublicValues(
            1000,
            receiver,
            keccak256("nullifier2"),
            keccak256("deadHash2"),
            keccak256("block2"),
            address(token),
            new bytes(0)
        );
        bytes memory proofBytes = hex"abcd";

        // Act & Assert
        vm.expectRevert("Proof verification failed");
        token.mintWithProof(publicValues, proofBytes);
    }

    function test_MintWithProof_MultipleMintsDifferentNullifiers() public {
        // Arrange
        verifier.setShouldPass(true);
        bytes memory publicValues1 = encodePublicValues(
            1000,
            receiver,
            keccak256("nullifier1"),
            keccak256("deadHash1"),
            keccak256("block1"),
            address(token),
            new bytes(0)
        );
        bytes memory publicValues2 = encodePublicValues(
            2000,
            receiver,
            keccak256("nullifier2"),
            keccak256("deadHash1"), // Same dead hash, different nullifier
            keccak256("block2"),
            address(token),
            new bytes(0)
        );
        bytes memory proofBytes = hex"abcd";

        // Act
        token.mintWithProof(publicValues1, proofBytes);
        token.mintWithProof(publicValues2, proofBytes);

        // Assert
        assertEq(
            token.balanceOf(receiver),
            3000,
            "Receiver should have 3000 tokens"
        );
        assertEq(
            token.getDeadHashAmount(keccak256("deadHash1")),
            3000,
            "Dead hash amount should accumulate to 3000"
        );
        assertTrue(
            token.s_nullifiers(keccak256("nullifier1")),
            "Nullifier1 should be used"
        );
        assertTrue(
            token.s_nullifiers(keccak256("nullifier2")),
            "Nullifier2 should be used"
        );
    }
}
