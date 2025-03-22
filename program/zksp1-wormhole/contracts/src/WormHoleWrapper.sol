// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {IERC20} from "openzeppelin-contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "openzeppelin-contracts/token/ERC20/utils/SafeERC20.sol";
import {ZkWormholeERC20} from "./ZkWormholeERC20.sol";

contract WormholeWrapper is ZkWormholeERC20 {
    using SafeERC20 for IERC20;

    // Errors
    error InvalidERC20TokenAddress();
    error InsufficientTokenBalance();

    // State variables
    address public s_erc20Token;

    // Events
    event TokenWrapped(address indexed user, uint256 amount);
    event TokenUnwrapped(address indexed user, uint256 amount);
    event TokenUnwrappedWithProof(address indexed user, uint256 amount);
    event ERC20TokenUpdated(address indexed newToken);

    // Constructor
    /// @notice Initializes the wrapper with token details, proof verification setup, and an ERC20 token to wrap.
    constructor(
        string memory _name,
        string memory _symbol,
        bytes32 _programVKey,
        address _verifier,
        address _erc20Token
    ) ZkWormholeERC20(_name, _symbol, _programVKey, _verifier) {
        if (_erc20Token == address(0)) {
            revert InvalidERC20TokenAddress();
        }
        s_erc20Token = _erc20Token;
    }

    // Public / External Functions
    /// @notice Locks ERC20 tokens and mints wrapped tokens.
    function wrap(uint256 amount) external {
        if (amount == 0) {
            revert InvalidAmount();
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

    /// @notice Burns wrapped tokens and releases the underlying ERC20 tokens.
    function unwrap(uint256 amount) external {
        if (amount == 0) {
            revert InvalidAmount();
        }

        _burn(msg.sender, amount);

        IERC20(s_erc20Token).safeTransfer(msg.sender, amount);
        emit TokenUnwrapped(msg.sender, amount);
    }

    /// @notice Releases ERC20 tokens based on a verified proof without burning wrapped tokens.
    function unwrapWithProof(
        bytes calldata _publicValues,
        bytes calldata _proofBytes
    ) external {
        (address receiver, uint256 amount) = _useProof(
            _publicValues,
            _proofBytes
        );

        IERC20(s_erc20Token).safeTransfer(receiver, amount);
        emit TokenUnwrappedWithProof(receiver, amount);
    }

    /// @notice Updates the underlying ERC20 token address (admin only).
    function setErc20Token(address _token) public onlyRole(DEFAULT_ADMIN_ROLE) {
        if (_token == address(0)) {
            revert InvalidERC20TokenAddress();
        }
        s_erc20Token = _token;
        emit ERC20TokenUpdated(_token);
    }
}
