// SPDX-License-Identifier: UNKNOWN
pragma solidity 0.8.28;

import {ERC20} from "openzeppelin-contracts/token/ERC20/ERC20.sol";
import {ISP1Verifier} from "sp1-contracts/ISP1Verifier.sol";
import {AccessControl} from "openzeppelin-contracts/access/AccessControl.sol";

contract WormholeERC20 is ERC20, AccessControl {
    error ProofIsAlreadyUsed();

    struct PublicValuesStruct {
        uint64 amount; // 8 bytes
        address receiver; // 20 bytes (maps to [u8; 20])
        bytes32 nullifier; // 32 bytes (maps to [u8; 32])
        bytes32 deadAddressHash; // 32 bytes (maps to [u8; 32])
        bytes32 blockHash; // 32 bytes (maps to [u8; 32])
        address contractAddress; // 20 bytes (maps to [u8; 20])
        bytes data; // Dynamic bytes (maps to Vec<u8>)
    }

    /// @notice The address of the SP1 verifier contract.
    address public s_verifier;
    bytes32 public s_programVKey;
    mapping(bytes32 => uint256) public s_deadHashToAmount;
    mapping(bytes32 => bool) public s_nullifiers;

    event WormholeERC20Minted();

    constructor(
        string memory _name,
        string memory _symbol,
        bytes32 _programVKey,
        address _verifier
    ) ERC20(_name, _symbol) {
        s_programVKey = _programVKey;
        s_verifier = _verifier;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function mintWithProof(
        bytes calldata _publicValues,
        bytes calldata _proofBytes
    ) public returns (uint256) {
        // Decode public values
        PublicValuesStruct memory values = abi.decode(
            _publicValues,
            (PublicValuesStruct)
        );

        if (s_nullifiers[values.nullifier]) {
            revert ProofIsAlreadyUsed();
        }

        // Verify the proof
        ISP1Verifier(s_verifier).verifyProof(
            s_programVKey,
            _publicValues,
            _proofBytes
        );

        s_nullifiers[values.nullifier] = true;
        s_deadHashToAmount[values.deadAddressHash] += values.amount;

        // Mint tokens
        _mint(values.receiver, uint256(values.amount));

        emit WormholeERC20Minted();
        return uint256(values.amount);
    }

    function getDeadHashAmount(bytes32 h) public view returns (uint256) {
        return s_deadHashToAmount[h];
    }

    function setVerifier(
        address _verifier
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        s_verifier = _verifier;
    }
    function setProgramVKey(
        bytes32 _programVKey
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        s_programVKey = _programVKey;
    }
}
