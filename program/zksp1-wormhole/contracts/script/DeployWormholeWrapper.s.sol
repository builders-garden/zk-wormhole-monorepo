// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {WormholeWrapper} from "../src/WormholeWrapper.sol";

///@custom:command make deploy-zk-wrm TOKEN=0xe8b3C7e5BD537159698656251A5F187BeBEa995D
contract DeployWormholeWrapper is Script {
    function run(address erc20Token) external {
        address verifier = 0x397A5f7f3dBd538f23DE225B51f532c34448dA9B;
        bytes32 programVKey = 0x00266f843e01e24a0ad12e3b730280e7108d736281465bdd2cf5711e6055dc94;

        string memory name = "zkWormholeUSDC";
        string memory symbol = "ZkWRMUSDC";

        // Start broadcasting transactions
        vm.startBroadcast();

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
        console.log("ERC20 Token Address:", wrapper.s_erc20Token());
        console.log("Verifier Address:", wrapper.s_verifier());
        console.log("Program VKey:", uint256(wrapper.s_programVKey()));

        vm.stopBroadcast();
    }
}
