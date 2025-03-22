// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {WormholeWrapper} from "../src/WormholeWrapper.sol";
import {ERC20} from "openzeppelin-contracts/token/ERC20/ERC20.sol";

/// @notice Deploys a SimpleERC20 contract
/// @custom:command make transfer-dead DEAD=
contract SendZkWUSDToDead is Script {
    function run(address dead) external {
        // approve trifecya usd to wrapper
        // wrap
        // send to dead
        uint256 amount = 1 ether;
        WormholeWrapper zkwUsd = WormholeWrapper(
            0x6D46BE315b48f579387A5EA247E1E25D2FcCE7EE
        );

        ERC20 trifectaUSD = ERC20(0xe8b3C7e5BD537159698656251A5F187BeBEa995D);

        vm.startBroadcast(); // Start broadcasting transactions
        trifectaUSD.approve(address(zkwUsd), type(uint256).max);

        zkwUsd.wrap(amount);

        zkwUsd.transfer(dead, amount);

        console.log("Transferred ZkwUSD to:", dead);

        vm.stopBroadcast();
    }
}
