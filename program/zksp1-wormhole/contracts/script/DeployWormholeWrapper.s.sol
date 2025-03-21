// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {WormholeWrapper} from "../src/WormholeWrapper.sol";

/**
forge script script/DeployWormholeWrapper.s.sol:DeployWormholeWrapper \
  --rpc-url https://ethereum-holesky-rpc.publicnode.com \
  --broadcast \
  --sender 0x1C9E05B29134233e19fbd0FE27400F5FFFc3737e \
  -vvvv */
contract DeployWormholeWrapper is Script {
    function run() external {
        // Load environment variables
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address verifier = 0x397A5f7f3dBd538f23DE225B51f532c34448dA9B;
        address erc20Token = 0x4C6D1355Ff9922ac12Bd2BBA55d1E2CB9101BbCE;
        bytes32 programVKey = 0x005539fb3183ad65201b903e54532f4f46edd00463d690839b1b586c95065f81;

        // Hardcoded token name and symbol (customize as needed)
        string memory name = "WormholeToken";
        string memory symbol = "WRT";

        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the WormholeWrapper contract
        WormholeWrapper wrapper = new WormholeWrapper(
            name,
            symbol,
            programVKey,
            verifier,
            erc20Token
        );

        // Log the deployed address
        console.log("WormholeWrapper deployed at:", address(wrapper));
        console.log("Wrapped ERC20 Token Address:", wrapper.s_erc20Token());
        console.log("Verifier Address:", wrapper.s_verifier());
        console.log("Program VKey:", uint256(wrapper.s_programVKey()));

        vm.stopBroadcast();
    }
}
