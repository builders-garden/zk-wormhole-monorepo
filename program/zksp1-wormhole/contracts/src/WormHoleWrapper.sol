// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {IERC20} from "openzeppelin-contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "openzeppelin-contracts/token/ERC20/utils/SafeERC20.sol";
import {WormholeERC20} from "./WormholeERC20.sol";

// wrap: mint WORMERC20 and LOCK ERC20
// unwrap: burn WORMERC20 and transfer ERC20 to user
// unwrap: burn WORMERC20 and transfer ERC20 to user

contract WormholeWrapper is WormholeERC20 {
    using SafeERC20 for IERC20;

    // Errors
    error ZeroAmountNotAllowed();
    error InvalidERC20TokenAddress();
    error MintWithProofFailed();

    // State variables
    address public s_erc20Token;

    // Events
    event TokenWrapped(address indexed user, uint256 amount);
    event TokenUnwrapped(address indexed user, uint256 amount);
    event TokenUnwrappedWithProof(address indexed user, uint256 amount);

    constructor(
        string memory _name,
        string memory _symbol,
        bytes32 _programVKey,
        address _verifier,
        address _erc20Token
    ) WormholeERC20(_name, _symbol, _programVKey, _verifier) {
        if (_erc20Token == address(0)) {
            revert InvalidERC20TokenAddress();
        }
        s_erc20Token = _erc20Token;
    }

    function wrap(uint256 amount) external {
        if (amount == 0) {
            revert ZeroAmountNotAllowed();
        }

        // Transfer ERC20 tokens to this contract
        IERC20(s_erc20Token).safeTransferFrom(
            msg.sender,
            address(this),
            amount
        );

        // Mint wrapped tokens
        _mint(msg.sender, amount);
        emit TokenWrapped(msg.sender, amount);
    }

    function unwrap(uint256 amount) external {
        if (amount == 0) {
            revert ZeroAmountNotAllowed();
        }

        // Burn wrapped tokens
        _burn(msg.sender, amount);

        // Transfer ERC20 tokens back to user
        IERC20(s_erc20Token).safeTransfer(msg.sender, amount);
        emit TokenUnwrapped(msg.sender, amount);
    }

    function unwrapWithProof(
        bytes calldata _publicValues,
        bytes calldata _proofBytes
    ) external {
        // Mint wrapped tokens based on proof and get the amount
        uint256 amount = mintWithProof(_publicValues, _proofBytes);
        if (amount == 0) {
            revert ZeroAmountNotAllowed();
        }

        // Burn wrapped tokens
        _burn(msg.sender, amount);

        // Transfer ERC20 tokens back to user
        IERC20(s_erc20Token).safeTransfer(msg.sender, amount);
        emit TokenUnwrappedWithProof(msg.sender, amount);
    }
}
