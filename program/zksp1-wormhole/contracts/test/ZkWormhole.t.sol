// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {WormholeWrapper} from "../src/WormholeWrapper.sol";
import {ZkWormholeERC20} from "../src/ZkWormholeERC20.sol";
import {IERC20} from "openzeppelin-contracts/token/ERC20/IERC20.sol";
import {ISP1Verifier} from "sp1-contracts/ISP1Verifier.sol";

// Mock ERC20 for testing
contract MockERC20 is IERC20 {
    mapping(address => uint256) public override balanceOf;
    mapping(address => mapping(address => uint256)) public override allowance;
    uint256 public override totalSupply;

    function mint(address to, uint256 amount) external {
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool) {
        require(balanceOf[from] >= amount, "Insufficient balance");
        require(
            allowance[from][msg.sender] >= amount,
            "Insufficient allowance"
        );
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
        return true;
    }
}

// Mock SP1 Verifier
contract MockSP1Verifier is ISP1Verifier {
    bool public shouldPass;

    function setShouldPass(bool _shouldPass) external {
        shouldPass = _shouldPass;
    }

    function verifyProof(
        bytes32,
        bytes calldata,
        bytes calldata
    ) external view override {
        if (!shouldPass) revert("Proof verification failed");
    }
}

contract ZkWormhole is Test {
    WormholeWrapper wrapper;
    MockERC20 erc20;
    MockSP1Verifier verifier;
    bytes32 programVKey = keccak256("test-vkey");
    address user = address(0x123);

    // Provided public values for proof verification
    bytes publicValues =
        hex"0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000016345785d8a0000000000000000000000000000b80f75bb1a766bc6269d2eb205ed7c986513bc0b682a2a8023f67a6c48cefb1305fc705c8e06311d5942de0e3bcf6e4ac611b94fab4c32b3e0081dbd5ab453a3d05158ee04969c5d3b3861d07ba6a3b8ccaea62c2000000000000000cec39db61894fab319382bda86e822138273aedc8624b092000000000000000000000000de08a36b14bf476da888ccaf6efbcc02e6107c2800000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000000";
    bytes proofBytes = hex"abcd";

    function setUp() public {
        erc20 = new MockERC20();
        verifier = new MockSP1Verifier();
        wrapper = new WormholeWrapper(
            "WormholeWrapper",
            "WWRP",
            programVKey,
            address(verifier),
            address(erc20)
        );

        // Mint ERC20 tokens to the user and approve the wrapper
        vm.prank(user);
        erc20.mint(user, 1000000000000000000);
        vm.prank(user);
        erc20.approve(address(wrapper), 1000000000000000000);

        // Set verifier to pass proofs
        verifier.setShouldPass(true);
    }

    function test_Wrap_Success() public {
        uint256 amount = 1000;
        vm.prank(user);
        wrapper.wrap(amount);

        assertEq(
            wrapper.balanceOf(user),
            amount,
            "User should have wrapped tokens"
        );
        assertEq(
            erc20.balanceOf(address(wrapper)),
            amount,
            "Wrapper should hold ERC20 tokens"
        );
        assertEq(
            erc20.balanceOf(user),
            999999999999999000,
            "User should have less ERC20 tokens"
        );
    }

    function test_Unwrap_Success() public {
        uint256 amount = 1000000000000000000;
        vm.startPrank(user);
        wrapper.wrap(amount);
        wrapper.unwrap(amount);
        vm.stopPrank();

        assertEq(
            wrapper.balanceOf(user),
            0,
            "User should have no wrapped tokens"
        );
        assertEq(
            erc20.balanceOf(address(wrapper)),
            0,
            "Wrapper should have no ERC20 tokens"
        );
        assertEq(
            erc20.balanceOf(user),
            amount,
            "User should have original ERC20 tokens"
        );
    }

    function test_UnwrapWithProof_Success() public {
        uint256 wrapAmount = 1000000000000000000; // 10^18 to cover proof amount
        vm.prank(user);
        wrapper.wrap(wrapAmount); // Lock enough ERC20 tokens in the contract

        // Call checkProof to decode the public values
        ZkWormholeERC20.PublicValuesStruct memory values = wrapper.checkProof(
            publicValues,
            proofBytes,
            false
        );
        uint64 amount_proof = values.amount;
        address receiver_proof = values.receiver;
        bytes32 nullifier = values.nullifier;

        vm.prank(user);
        wrapper.unwrapWithProof(publicValues, proofBytes);

        assertEq(
            wrapper.balanceOf(user),
            wrapAmount,
            "User wrapped token balance should remain unchanged"
        );
        assertEq(
            erc20.balanceOf(receiver_proof),
            amount_proof,
            "Receiver should receive ERC20 tokens"
        );
        assertEq(
            erc20.balanceOf(address(wrapper)),
            wrapAmount - amount_proof,
            "Wrapper should have transferred ERC20 tokens"
        );
        assertTrue(
            wrapper.s_nullifiers(nullifier),
            "Nullifier should be marked used"
        );
    }
}
