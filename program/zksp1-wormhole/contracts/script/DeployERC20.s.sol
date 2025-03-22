// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {ERC20} from "openzeppelin-contracts/token/ERC20/ERC20.sol";

/// @notice Simple ERC20 token contract for testing
contract SimpleERC20 is ERC20 {
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        _mint(msg.sender, initialSupply);
    }

    function faucetMint(address receiver) public {
        _mint(receiver, 100 ether);
    }
}

/// @notice Deploys a SimpleERC20 contract
/// @custom:command make deploy-erc20 ADDITIONAL_RECEIVER=
contract DeployERC20 is Script {
    function run(address additionalReceiver) external {
        // Configuration parameters
        string memory name = "Trifecta USDC";
        string memory symbol = "TrUSDC";
        uint256 initialSupply = 1_000_000 * 10 ** 18; // 1 bln tokens with 18 decimals

        // Start broadcasting transactions
        vm.startBroadcast();

        // Deploy the SimpleERC20 contract
        SimpleERC20 token = new SimpleERC20(name, symbol, initialSupply);
        token.faucetMint(additionalReceiver);

        // Log deployment details
        console.log("SimpleERC20 deployed at:", address(token));
        console.log("Token Name:", token.name());
        console.log("Token Symbol:", token.symbol());
        console.log("Deployer Balance:", token.balanceOf(msg.sender));
        console.log("Total Supply:", token.totalSupply());

        vm.stopBroadcast();
    }
}
