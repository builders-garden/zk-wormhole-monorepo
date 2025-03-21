// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {ISP1Verifier} from "@sp1-contracts/ISP1Verifier.sol";

/// The public values returned by the contract call execution.
struct ContractPublicValues {
    bytes32 blockHash;
    address callerAddress;
    address contractAddress;
    bytes contractCalldata;
    bytes contractOutput;
}

/// @title SP1 ZkWormholeCall.
/// @notice This contract implements a simple example of verifying the proof of call to a smart 
///         contract.
contract ZkWormholeCall {
    /// @notice The address of the SP1 verifier contract.
    address public verifier;

    /// @notice The verification key for the zkWormholeCall program.
    bytes32 public zkWormholeCallProgramVKey;

    constructor(address _verifier, bytes32 _zkWormholeCallProgramVKey) {
        verifier = _verifier;
        zkWormholeCallProgramVKey = _zkWormholeCallProgramVKey;
    }

    /// @notice The entrypoint for verifying the proof of a zkWormholeCall number.
    /// @param _proofBytes The encoded proof.
    /// @param _publicValues The encoded public values.
    function verifyZkWormholeCallProof(bytes calldata _publicValues, bytes calldata _proofBytes)
        public
        view
        returns (uint160)
    {
        ISP1Verifier(verifier).verifyProof(zkWormholeCallProgramVKey, _publicValues, _proofBytes);
        ContractPublicValues memory publicValues = abi.decode(_publicValues, (ContractPublicValues));
        uint160 sqrtPriceX96 = abi.decode(publicValues.contractOutput, (uint160));
        return sqrtPriceX96;
    }
}