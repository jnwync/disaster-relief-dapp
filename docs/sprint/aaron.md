# Aaron Sprint Sheet (Backend Lead)

## Owned Items

- W1 Deploy contract to Sepolia
- W3 End-to-end integration verification
- W7 Contract-side bug fixes
- W19 Demo rehearsal participation

## Day 1

- [ ] Fund deployer wallet and validator wallets with Sepolia ETH
- [ ] Set `.env` values: SEPOLIA_RPC_URL, DEPLOYER_PRIVATE_KEY, VALIDATOR_1..3
- [ ] Run `npx hardhat test` and confirm 26/26 passing
- [ ] Run `npx hardhat run scripts/deploy.ts --network sepolia`
- [ ] Verify `frontend/src/contracts/deployment.json` updated with chainId 11155111
- [ ] Share contract address + deployment tx link in group chat

Exit Criteria:
- Contract deployed and team can pull latest deployment metadata.

## Day 2

- [ ] Execute full integration flow on Sepolia (donate -> propose -> approve x2 -> release -> audit)
- [ ] Log pass/fail notes for each step in group chat
- [ ] Open issues for defects with reproduction steps
- [ ] Start contract-side bug fixes (W7) for blockers

Exit Criteria:
- Integration report posted and blockers assigned.

## Day 3

- [ ] Fix contract-level bugs from Allan's F1-F19 findings
- [ ] Re-test fixed scenarios with Allan
- [ ] Confirm no regression in deployment and proposal lifecycle

Exit Criteria:
- Contract-side blockers resolved for Admin and Donate flows.

## Day 4

- [ ] Fix remaining contract bugs from F20-F28 findings
- [ ] Validate contract state is demo-safe (active state, beneficiary and proposal paths stable)
- [ ] Confirm no P0 contract defects remain

Exit Criteria:
- Contract path signed off for final rehearsal.

## Day 5

- [ ] Join rehearsal and run backend portion live
- [ ] Stand by for emergency patch if needed
- [ ] Sign off final deployment metadata and network settings

Exit Criteria:
- Demo-ready chain state and successful rehearsal run.

## Inputs Needed

- Wayne: final frontend env sync confirmation
- Allan: QA bug reports with reproducible steps

## Deliverables

- Deployment tx hash and contract address
- Integration verification notes
- Contract bug fix commits/PRs
