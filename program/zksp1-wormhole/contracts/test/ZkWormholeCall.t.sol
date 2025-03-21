// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import {Test, console} from "forge-std/Test.sol";
import {stdJson} from "forge-std/StdJson.sol";
import {SP1VerifierGateway} from "@sp1-contracts/SP1VerifierGateway.sol";
import {ZkWormholeCall} from "../src/ZkWormholeCall.sol";
import "forge-std/console.sol";

struct SP1ProofFixtureJson {
    bytes proof;
    bytes publicValues;
    bytes32 vkey;
}

contract ZkWormholeCallTest is Test {
    using stdJson for string;

    address verifier;
    ZkWormholeCall public zkWormholeCall;

    function loadFixture() public view returns (SP1ProofFixtureJson memory) {
        string memory root = vm.projectRoot();
        string memory path = string.concat(root, "/src/fixtures/plonk-fixture.json");
        string memory json = vm.readFile(path);
        bytes memory jsonBytes = json.parseRaw(".");
        return abi.decode(jsonBytes, (SP1ProofFixtureJson));
    }

    function setUp() public {
        SP1ProofFixtureJson memory fixture = loadFixture();
        verifier = address(new SP1VerifierGateway(address(1)));
        zkWormholeCall = new ZkWormholeCall(verifier, fixture.vkey);
    }

    function test_ValidZkWormholeCallProof() public {
        SP1ProofFixtureJson memory fixture = loadFixture();

        vm.mockCall(verifier, abi.encodeWithSelector(SP1VerifierGateway.verifyProof.selector), abi.encode(true));

        uint160 rate = zkWormholeCall.verifyZkWormholeCallProof(fixture.publicValues, fixture.proof);

        console.log(rate);
    }

    function test_Revert_InvalidZkWormholeCallProof() public {
        vm.expectRevert();
        
        SP1ProofFixtureJson memory fixture = loadFixture();

        // Create a fake proof.
        bytes memory fakeProof = new bytes(fixture.proof.length);

        zkWormholeCall.verifyZkWormholeCallProof(fixture.publicValues, fakeProof);
    }
}