// SPDX-License-Identifier: UNKNOWN
pragma solidity 0.8.28;

import {ERC20} from "openzeppelin-contracts/token/ERC20/ERC20.sol";
import {ISP1Verifier} from "sp1-contracts/ISP1Verifier.sol";
import {AccessControl} from "openzeppelin-contracts/access/AccessControl.sol";

/**
@notice token standard for zk-wormhole protocol
welcome to native EVM private transactions
 */
contract ZkWormholeERC20 is ERC20, AccessControl {
    // Errors
    error ProofIsAlreadyUsed();
    error InvalidAmount();
    error DataTooLarge();

    // Storage Variables
    address public s_verifier;
    bytes32 public s_programVKey;
    uint256 public constant MAX_DATA_SIZE = 1024;

    // Mappings and Arrays
    mapping(bytes32 => uint256) public s_deadHashToAmount;
    mapping(bytes32 => bool) public s_nullifiers;

    // Events
    event WormholeERC20Minted(address indexed receiver, uint256 amount);
    event VerifierUpdated(address indexed newVerifier);
    event ProgramVKeyUpdated(bytes32 indexed newProgramVKey);

    // Structs
    struct PublicValuesStruct {
        uint64 amount;
        address receiver;
        bytes32 nullifier;
        bytes32 deadAddressHash;
        bytes32 blockHash;
        address contractAddress;
        bytes data;
    }

    // Constructor
    /// @notice Initializes the contract with token details and proof verification setup.
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

    // Public / External Functions
    /// @notice Mints tokens based on a verified proof.
    function mintWithProof(
        bytes calldata _publicValues,
        bytes calldata _proofBytes
    ) public returns (uint256) {
        (address receiver, uint256 amount) = _useProof(
            _publicValues,
            _proofBytes
        );

        _mint(receiver, amount);

        emit WormholeERC20Minted(receiver, amount);
        return amount;
    }

    /// @notice Verifies a proof and returns its decoded public values.
    function checkProof(
        bytes calldata _publicValues,
        bytes calldata _proofBytes,
        bool checkRevertConditions
    ) public view returns (PublicValuesStruct memory values) {
        ISP1Verifier(s_verifier).verifyProof(
            s_programVKey,
            _publicValues,
            _proofBytes
        );

        values = abi.decode(_publicValues, (PublicValuesStruct));

        if (checkRevertConditions) {
            if (values.amount == 0) {
                revert InvalidAmount();
            }
            if (values.data.length > MAX_DATA_SIZE) {
                revert DataTooLarge();
            }
            if (s_nullifiers[values.nullifier]) {
                revert ProofIsAlreadyUsed();
            }
        }
    }

    /// @notice Returns the total amount tied to a dead address hash.
    function getDeadHashAmount(bytes32 h) public view returns (uint256) {
        return s_deadHashToAmount[h];
    }

    /// @notice Updates the SP1 verifier contract address (admin only).
    function setVerifier(
        address _verifier
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        s_verifier = _verifier;
        emit VerifierUpdated(_verifier);
    }

    /// @notice Updates the program verification key (admin only).
    function setProgramVKey(
        bytes32 _programVKey
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        s_programVKey = _programVKey;
        emit ProgramVKeyUpdated(_programVKey);
    }

    /// @notice Checks if the contract supports a given interface (ERC-165).
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    // Private / Internal Functions
    /// @notice Verifies and processes a proof, updating state if valid.
    function _useProof(
        bytes calldata _publicValues,
        bytes calldata _proofBytes
    ) internal returns (address, uint256) {
        ISP1Verifier(s_verifier).verifyProof(
            s_programVKey,
            _publicValues,
            _proofBytes
        );

        PublicValuesStruct memory values = abi.decode(
            _publicValues,
            (PublicValuesStruct)
        );

        if (values.amount == 0) {
            revert InvalidAmount();
        }
        if (values.data.length > MAX_DATA_SIZE) {
            revert DataTooLarge();
        }
        if (s_nullifiers[values.nullifier]) {
            revert ProofIsAlreadyUsed();
        }

        s_nullifiers[values.nullifier] = true;
        s_deadHashToAmount[values.deadAddressHash] += values.amount;

        return (values.receiver, uint256(values.amount));
    }
}
