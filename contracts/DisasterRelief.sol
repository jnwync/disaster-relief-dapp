// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title DisasterRelief
/// @notice Transparent disaster-relief escrow with 2-of-3 multi-sig validator approval
/// @dev Inherits ReentrancyGuard for reentrancy protection on fund release
contract DisasterRelief is ReentrancyGuard {
    // --- State Variables ---

    /// @notice Fixed set of 3 validator addresses
    address[3] public validators;

    /// @notice Number of approvals required to release funds
    uint256 public constant REQUIRED_APPROVALS = 2;

    /// @notice Name of the disaster this fund serves
    string public disasterName;

    /// @notice Whether the fund is currently accepting donations and proposals
    bool public isActive;

    /// @notice Cumulative ETH donated to this fund
    uint256 public totalDonated;

    /// @notice Cumulative ETH disbursed from this fund
    uint256 public totalDisbursed;

    /// @notice Sequential proposal ID counter
    uint256 public proposalCount;

    // --- Structs ---

    /// @notice Represents a disbursement proposal
    struct Proposal {
        bytes32 descriptionHash;
        address payable recipient;
        uint256 amount;
        uint256 approvalCount;
        bool executed;
        bool exists;
    }

    // --- Mappings ---

    /// @notice Registered beneficiaries eligible for disbursements
    mapping(address => bool) public beneficiaries;

    /// @notice Proposals by ID
    mapping(uint256 => Proposal) public proposals;

    /// @notice Tracks which validator approved which proposal
    mapping(uint256 => mapping(address => bool)) public hasApproved;

    /// @notice Cumulative donation amount per donor
    mapping(address => uint256) public donorAmounts;

    /// @notice Ordered list of unique donor addresses
    address[] public donorList;

    /// @notice Tracks whether an address has donated before (for donorList uniqueness)
    mapping(address => bool) private isDonor;

    // --- Events ---

    /// @notice Emitted when a donation is received
    event DonationReceived(address indexed donor, uint256 amount, uint256 timestamp);

    /// @notice Emitted when a beneficiary is registered
    event BeneficiaryRegistered(address indexed beneficiary, address indexed registeredBy);

    /// @notice Emitted when a disbursement proposal is created
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed recipient,
        uint256 amount,
        bytes32 descriptionHash
    );

    /// @notice Emitted when a validator approves a proposal
    event ProposalApproved(
        uint256 indexed proposalId,
        address indexed approver,
        uint256 approvalCount
    );

    /// @notice Emitted when funds are released to a beneficiary
    event FundsReleased(uint256 indexed proposalId, address indexed recipient, uint256 amount);

    /// @notice Emitted when the fund active status changes
    event FundStatusChanged(bool isActive, address indexed changedBy);

    // --- Modifiers ---

    /// @dev Restricts access to validators only
    modifier onlyValidator() {
        bool isVal = false;
        for (uint256 i = 0; i < 3; i++) {
            if (msg.sender == validators[i]) {
                isVal = true;
                break;
            }
        }
        require(isVal, "DisasterRelief: caller is not a validator");
        _;
    }

    /// @dev Restricts to when the fund is active
    modifier whenActive() {
        require(isActive, "DisasterRelief: fund is not active");
        _;
    }

    // --- Constructor ---

    /// @notice Deploy a new disaster relief fund
    /// @param _disasterName Name of the disaster
    /// @param _validators Array of 3 validator addresses
    constructor(string memory _disasterName, address[3] memory _validators) {
        for (uint256 i = 0; i < 3; i++) {
            require(_validators[i] != address(0), "DisasterRelief: invalid validator address");
            for (uint256 j = 0; j < i; j++) {
                require(_validators[i] != _validators[j], "DisasterRelief: duplicate validator");
            }
        }

        disasterName = _disasterName;
        validators = _validators;
        isActive = true;
    }

    // --- View Functions ---

    /// @notice Get the list of validators
    /// @return Array of 3 validator addresses
    function getValidators() external view returns (address[3] memory) {
        return validators;
    }

    /// @notice Get the number of unique donors
    /// @return Count of unique donors
    function getDonorCount() external view returns (uint256) {
        return donorList.length;
    }

    /// @notice Get all unique donor addresses
    /// @return Array of donor addresses
    function getDonorList() external view returns (address[] memory) {
        return donorList;
    }

    /// @notice Get the current contract balance
    /// @return Contract ETH balance in wei
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /// @notice Check if an address is a validator
    /// @param _addr Address to check
    /// @return True if the address is a validator
    function isValidator(address _addr) external view returns (bool) {
        for (uint256 i = 0; i < 3; i++) {
            if (_addr == validators[i]) return true;
        }
        return false;
    }

    /// @notice Get proposal details
    /// @param _proposalId ID of the proposal
    /// @return descriptionHash recipient amount approvalCount executed exists
    function getProposal(uint256 _proposalId)
        external
        view
        returns (
            bytes32 descriptionHash,
            address recipient,
            uint256 amount,
            uint256 approvalCount,
            bool executed,
            bool exists
        )
    {
        Proposal storage p = proposals[_proposalId];
        return (p.descriptionHash, p.recipient, p.amount, p.approvalCount, p.executed, p.exists);
    }

    // --- Mutating Functions ---

    /// @notice Donate ETH to the disaster relief fund
    /// @dev Requires non-zero value and active fund
    function donate() external payable whenActive {
        _processDonation();
    }

    /// @notice Accept direct ETH transfers
    receive() external payable {
        _processDonation();
    }

    /// @notice Toggle the fund active status
    /// @param _isActive New active status
    function setActive(bool _isActive) external onlyValidator {
        isActive = _isActive;
        emit FundStatusChanged(_isActive, msg.sender);
    }

    /// @notice Register an address as an eligible beneficiary
    /// @param _beneficiary Address to register
    function registerBeneficiary(address _beneficiary) external onlyValidator whenActive {
        require(_beneficiary != address(0), "DisasterRelief: invalid beneficiary address");
        require(!beneficiaries[_beneficiary], "DisasterRelief: beneficiary already registered");

        beneficiaries[_beneficiary] = true;
        emit BeneficiaryRegistered(_beneficiary, msg.sender);
    }

    /// @notice Create a proposal to disburse funds to a registered beneficiary
    /// @param _recipient Address of the beneficiary to receive funds
    /// @param _amount Amount of ETH in wei to disburse
    /// @param _description Human-readable description (hashed and stored on-chain)
    function proposeDisbursement(
        address payable _recipient,
        uint256 _amount,
        string calldata _description
    ) external onlyValidator whenActive {
        require(beneficiaries[_recipient], "DisasterRelief: recipient is not a registered beneficiary");
        require(_amount > 0, "DisasterRelief: amount must be greater than zero");
        require(_amount <= address(this).balance, "DisasterRelief: insufficient contract balance");

        proposalCount++;

        proposals[proposalCount] = Proposal({
            descriptionHash: keccak256(abi.encodePacked(_description)),
            recipient: _recipient,
            amount: _amount,
            approvalCount: 0,
            executed: false,
            exists: true
        });

        emit ProposalCreated(proposalCount, _recipient, _amount, proposals[proposalCount].descriptionHash);
    }

    // --- Internal Functions ---

    /// @dev Process a donation: validate, update accounting, track donor, emit event
    function _processDonation() internal {
        require(isActive, "DisasterRelief: fund is not active");
        require(msg.value > 0, "DisasterRelief: donation must be greater than zero");

        totalDonated += msg.value;
        donorAmounts[msg.sender] += msg.value;

        if (!isDonor[msg.sender]) {
            isDonor[msg.sender] = true;
            donorList.push(msg.sender);
        }

        emit DonationReceived(msg.sender, msg.value, block.timestamp);
    }
}
