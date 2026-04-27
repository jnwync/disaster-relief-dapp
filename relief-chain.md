# ChainRelief — Why This Project, Why It Matters, Why It Fits

---

## What We Built

ChainRelief is a disaster relief fund that lives on the blockchain.

Anyone can donate to it. A small group of trusted organizations must
collectively agree before any money gets released to victims. And every
single peso — every donation, every decision, every transfer — is
permanently recorded in public, forever, where anyone can read it.

No one person controls the money. No one can move it silently.
No one can change the history.

---

## The Problem We're Solving

After every major typhoon in the Philippines, the same thing happens.

Billions of pesos in aid get pledged. Some of it reaches the people
who need it. A lot of it doesn't. The Commission on Audit publishes
findings every few years showing missing goods, unaccounted funds,
and disbursements with no documentation. Nobody goes to jail.
The next typhoon comes and the cycle repeats.

This isn't just a Filipino problem. It happens in disaster response
all over the world. The reason it keeps happening isn't that the
people involved are unusually corrupt. It's that the system makes
corruption easy:

- One treasurer controls where the money goes
- Donors have no way to check what happened after they gave
- Records can be altered, lost, or backdated
- Oversight only happens months later, after the damage is done

ChainRelief attacks that system directly.

---

## Why the Blockchain Fixes This Specifically

Most problems don't need a blockchain. A regular app or spreadsheet
works fine for most things. Blockchain only makes sense when the
core problem is that you can't trust any single person or institution
to be honest — and you need a system that's honest by design,
not by choice.

Disaster relief is exactly that problem.

When donation money sits in a bank account controlled by an
organization, you are trusting that organization. ChainRelief removes
that requirement entirely. The money sits in a piece of code. The code
has rules. The rules run automatically. Nobody can override them.

The transparency isn't something we added as a feature.
It's just how the blockchain works. Every transaction is public.
Every record is permanent. There is no "off" switch for accountability.

---

## Why This Is a Strong Project for This Course

### It solves a real problem

Most student blockchain projects are solutions looking for problems.
"Let's put a to-do list on the blockchain." "Let's make a voting app
for things that already have voting apps." ChainRelief solves a
documented, measurable, emotionally real problem that affects millions
of people — and it solves it in a way that only blockchain can.
That's rare.

### It uses the technology honestly

The project doesn't pretend blockchain fixes everything. We know the
money still has to reach people physically. We know bad actors could
theoretically collude. We know there are limits. We say so clearly.
What we claim is specific: the accountability layer — who approved
what, when, and how much moved — is now mathematically impossible
to fake. That claim is true and we can prove it with a live demo.

### The demo tells a complete story

In five minutes, we can show a donation coming in, a group decision
being made, funds releasing automatically, and the entire history
appearing permanently on a public ledger. Every step of that demo
is a different concept from the course working in practice. The
audience doesn't need a computer science background to understand
why it matters.

### It's culturally specific and personally resonant

Every Filipino in that room has lived through a typhoon or knows
someone who has. The corruption problem in disaster relief isn't
abstract for this audience — it's personal. A project that addresses
something your audience has personally experienced lands differently
than one that doesn't.

---

## How It Fits the Professor's Criteria

The project requirements ask for something that demonstrates
cryptography, blockchain fundamentals, consensus, smart contracts,
and decentralized application development — not just on the surface,
but with genuine depth.

ChainRelief was designed with that rubric in mind from the start.

**The multi-signature approval system** demonstrates that no single
party can act alone — the same principle that secures major crypto
wallets and institutional funds worldwide. Understanding why that
matters requires understanding how digital signatures work.

**The permanent public event log** demonstrates what makes blockchain
different from a regular database. Anyone, at any time, can read the
complete history of every decision this fund ever made. No
administrator can delete it. No official can alter it. That property
comes directly from how the blockchain stores data.

**The automatic fund release** demonstrates what a smart contract
actually is — not just code on a server, but an agreement written in
math that executes itself when conditions are met, with no human
needed to press a button or honor a promise.

**The access control system** demonstrates how cryptographic identity
works on Ethereum. The validators don't log in with a password.
They prove who they are through a mathematical signature that would
take longer than the age of the universe to forge.

**The hash stored on every proposal** demonstrates data integrity
verification — the same principle used in every secure system on
the internet. If the document behind a proposal is ever altered,
the hash won't match. Proof of tampering, automatically, forever.

Each of these is a concept from the course applied to a real problem.
None of them are there just to check a box. They're there because
the problem requires them.

---

## The One-Paragraph Version

ChainRelief is a blockchain-based disaster relief fund where donations
are pooled on-chain, disbursements require approval from multiple
independent organizations, and every transaction is permanently
visible to the public. It was built to address a real and documented
problem — the disappearance of relief funds after typhoons in the
Philippines — using the specific properties of blockchain that make
it impossible to move money silently or alter the historical record.
The technical concepts it demonstrates — digital signatures, multi-party
authorization, cryptographic hashing, immutable audit trails, and
trustless code execution — are not surface-level inclusions. They are
the reason the system works.

---

## ChainRelief — Feature List

### Smart Contract Features

1. 2-of-3 Validator Multi-Signature Release
The contract is deployed with exactly three validator addresses and a fixed
2-approval threshold. Funds are only released after at least two independent
validators approve the same proposal, eliminating single-actor control.

2. Public Donation Entry Points
Donors can send ETH through `donate()` or directly via `receive()`. Both paths
route through the same validation logic, reject zero-value transfers, and emit
identical donation logs for clean auditability.

3. Fund Active/Inactive Circuit Breaker
Validators can toggle fund status through `setActive(bool)`. When inactive,
donations, beneficiary registration, proposal creation, and approvals are
blocked to prevent state changes during emergency pause periods.

4. Beneficiary Whitelisting
Only validators can register beneficiaries through `registerBeneficiary()`.
Disbursements are restricted to this on-chain allowlist to reduce accidental
or malicious transfers to unauthorized addresses.

5. Structured Disbursement Proposals
Validators create proposals through `proposeDisbursement(recipient, amount, description)`.
Each proposal stores recipient, amount, execution state, approval count, and a
`keccak256` hash of the proposal description for tamper-evident documentation.

6. Approval Tracking per Validator
The contract tracks approvals per proposal and per validator using `hasApproved`.
Duplicate approvals are prevented, so one validator cannot inflate consensus.

7. Automatic Release on Threshold
When a proposal reaches required approvals, release executes atomically inside
`approveDisbursement()`: the proposal is marked executed, accounting is updated,
and ETH is transferred to the beneficiary.

8. Reentrancy and CEI Protections
Fund release uses `ReentrancyGuard` and follows Checks-Effects-Interactions.
This hardens the core payout path against reentrancy exploits and state-sync
bugs during external calls.

9. On-Chain Transparency and Queryability
The contract exposes operational views (`getProposal`, `getValidators`,
`getDonorList`, `getContractBalance`) so the frontend and evaluators can read
fund status, governance state, and donor activity without off-chain trust.

10. Full Event Log for Every Critical Action
The contract emits `DonationReceived`, `BeneficiaryRegistered`, `ProposalCreated`,
`ProposalApproved`, `FundsReleased`, and `FundStatusChanged`. These events are
the canonical audit trail used by the UI.

### Frontend Features

11. Wallet Connection and Session-Aware Navigation
The app includes wallet connect/disconnect flows and address-aware UI so users
can move between Donate, Admin, and Audit contexts with their active signer.

12. Network Guard for Correct Chain Usage
The navbar detects wrong-network states and prompts users to switch to the
target network before allowing contract interaction, preventing failed demos
and wasted gas.

13. Donate Page with Live Contract Stats
The home page shows real-time contract reads (fund status, totals, metadata),
a donation form, and loading skeletons for smooth UX during RPC fetches.

14. Transaction-State Feedback for Donations
Donation actions present pending, success, and error states with user-friendly
messages and explorer links, so users can verify transaction outcomes clearly.

15. Real-Time Donation Feed
The app listens to `DonationReceived` logs and updates the donation list in
real time, enabling a live demonstration without manual page refresh.

16. Three-Tier Admin Gate
The admin page enforces progressive access states: wallet not connected,
connected but non-validator, and validator-authorized dashboard access.

17. Validator Operations Dashboard
Authorized validators can toggle fund status, register beneficiaries, create
disbursement proposals (including hashed descriptions), and approve proposals
from one integrated interface.

18. Proposal Cards with Approval Context
Each proposal card surfaces recipient, amount, execution state, and approval
progress, plus action buttons for eligible validators to approve when allowed.

19. Audit Timeline Page
A dedicated audit page aggregates and color-codes all core contract events,
showing chronological governance and fund movement history from on-chain logs.

20. Frontend Contract Source of Truth
The frontend reads ABI and deployment metadata from exported JSON artifacts,
ensuring UI contract calls stay synchronized with deployed contract state.

### Testing Features

21. End-to-End Happy Path Coverage
Hardhat tests validate the full intended flow: deployment, donations,
beneficiary setup, proposal lifecycle, approvals, and automatic fund release.

22. Access Control and Permission Rejection Tests
Negative tests verify non-validators cannot perform validator actions and only
authorized actors can mutate privileged state.

23. Safety and Validation Edge Case Tests
Tests cover zero-value donations, zero-address inputs, duplicate validators,
duplicate approvals, non-existent proposals, inactive-fund operations, and
insufficient balance scenarios.

24. Accounting and Event Assertion Tests
Tests assert event emission correctness and state/accounting integrity for
`totalDonated`, `totalDisbursed`, donor tracking, and proposal execution flags.

25. Regression-Oriented Security Tests
Critical disbursement tests ensure proposals cannot execute twice, approval
rules remain enforced, and payout behavior remains stable across refactors.

### Deployment Features

26. Hardhat Deploy Script with Environment Validation
The deploy script requires validator environment variables, deploys the
contract, prints network/address output, and fails fast on missing config.

27. ABI and Metadata Auto-Export
After deployment, script automation exports contract ABI and deployment metadata
directly into frontend contract files to eliminate manual copy-paste steps.

28. Build and Run Verification Checklist
The project includes repeatable compile/test/build checks so contract logic,
frontend integration, and deployment artifacts can be validated before demo.

### Nice-to-Have (If Time Allows)

29. Proposal Notes or CID Attachment Flow
Extend proposal metadata to include off-chain document pointers (e.g., CID/URL)
while preserving on-chain integrity checks through hashed references.

30. Multi-Network Support Mode
Add explicit environment switching for local Hardhat and Sepolia in one UI,
including clearer chain badges and per-network deployment metadata loading.

31. Donor Impact Dashboard
Add aggregated donor analytics (unique donors, average donation, recent release
impact summaries) while keeping financial truth sourced from on-chain events.
