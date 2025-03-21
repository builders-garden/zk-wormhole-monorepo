// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {WormholeWrapper} from "../src/WormholeWrapper.sol";
import {WormholeERC20} from "../src/WormholeERC20.sol";
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

contract WormholeWrapperTest is Test {
    WormholeWrapper wrapper;
    MockERC20 erc20;
    MockSP1Verifier verifier;
    bytes32 programVKey = keccak256("test-vkey");
    address user = address(0x123);

    function encodePublicValues(
        uint64 amount,
        address receiver,
        bytes32 nullifier,
        bytes32 deadAddressHash,
        bytes32 blockHash,
        address contractAddress,
        bytes memory data
    ) internal pure returns (bytes memory) {
        return
            abi.encode(
                WormholeERC20.PublicValuesStruct({
                    amount: amount,
                    receiver: receiver,
                    nullifier: nullifier,
                    deadAddressHash: deadAddressHash,
                    blockHash: blockHash,
                    contractAddress: contractAddress,
                    data: data
                })
            );
    }

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

        // Mint some ERC20 tokens to the user
        vm.prank(user);
        erc20.mint(user, 10000);
        vm.prank(user);
        erc20.approve(address(wrapper), 10000);
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
            9000,
            "User should have less ERC20 tokens"
        );
    }

    function test_Wrap_ZeroAmount() public {
        vm.prank(user);
        vm.expectRevert(WormholeWrapper.ZeroAmountNotAllowed.selector);
        wrapper.wrap(0);
    }

    function test_Unwrap_Success() public {
        uint256 amount = 1000;
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
            10000,
            "User should have original ERC20 tokens"
        );
    }

    function test_Unwrap_ZeroAmount() public {
        vm.prank(user);
        vm.expectRevert(WormholeWrapper.ZeroAmountNotAllowed.selector);
        wrapper.unwrap(0);
    }

    function test_UnwrapWithProof_Success() public {
        // Arrange
        uint256 amount = 1000;
        vm.prank(user);
        wrapper.wrap(amount);

        vm.prank(user);
        wrapper.transfer(address(0x000dead), amount);

        verifier.setShouldPass(true);
        bytes memory publicValues = encodePublicValues(
            uint64(amount), // amount
            user, // receiver (minted to user)
            keccak256("nullifier1"), // nullifier
            keccak256("deadHash1"), // deadAddressHash
            keccak256("block1"), // blockHash
            address(wrapper), // contractAddress
            new bytes(0) // data
        );
        bytes memory proofBytes = hex"abcd";

        // Act
        vm.prank(user);
        wrapper.unwrapWithProof(publicValues, proofBytes);

        // Assert
        assertEq(
            wrapper.balanceOf(user),
            0,
            "User should have no wrapped tokens after unwrap"
        );
        assertEq(
            erc20.balanceOf(user),
            10000,
            "User should receive ERC20 tokens"
        );
        assertEq(
            wrapper.getDeadHashAmount(keccak256("deadHash1")),
            amount,
            "Dead hash amount should update"
        );
        assertTrue(
            wrapper.s_nullifiers(keccak256("nullifier1")),
            "Nullifier should be marked used"
        );
    }

    function test_UnwrapWithProof_InvalidProof() public {
        verifier.setShouldPass(false);
        bytes memory publicValues = encodePublicValues(
            1000,
            user,
            keccak256("nullifier2"),
            keccak256("deadHash2"),
            keccak256("block2"),
            address(wrapper),
            new bytes(0)
        );
        bytes memory proofBytes = hex"abcd";

        vm.prank(user);
        vm.expectRevert("Proof verification failed");
        wrapper.unwrapWithProof(publicValues, proofBytes);
    }
}
