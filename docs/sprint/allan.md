# Allan Sprint Sheet (QA + Error UX)

## Owned Items

- W4 Donate page validation (F1-F8)
- W5 Admin page validation (F9-F19)
- W6 Audit + cross-cutting validation (F20-F28)
- W15 Error-message mapping validation and wiring support
- W17 Bug reporting and triage summary
- W19 Final regression support

## Day 1

- [ ] Complete local onboarding using `docs/developer-onboarding.md`
- [ ] Prepare validation matrix file with F1-F28 rows
- [ ] Read all contract require messages in `contracts/DisasterRelief.sol`
- [ ] Draft expected user-friendly error mappings for known revert cases

Exit Criteria:
- Validation matrix exists and test scenarios are ready.

## Day 2

- [ ] Execute F1-F8 on Sepolia-connected frontend
- [ ] Capture screenshots for any failures
- [ ] File defects with expected vs actual + steps
- [ ] Validate W15 behavior for wallet rejection, inactive fund, invalid amount messaging

Exit Criteria:
- F1-F8 complete with defect reports posted.

## Day 3

- [ ] Execute F9-F19 (Admin gate, register, propose, approve, double-approve, fund toggle)
- [ ] Re-test fixes merged by Aaron/Wayne
- [ ] Update matrix status and identify remaining P0 issues

Exit Criteria:
- F9-F19 complete and all found blockers assigned.

## Day 4

- [ ] Execute F20-F28 (audit ordering, color coding, links, wrong-network behavior, disconnect/refresh)
- [ ] Re-test all previously failed P0 tests
- [ ] Publish W17 bug triage summary (open/closed/deferred)

Exit Criteria:
- Zero open P0 defects in matrix.

## Day 5

- [ ] Run final smoke/regression pass across Donate, Admin, Audit
- [ ] Confirm rehearsal path matches validated behavior
- [ ] Provide final QA signoff in group chat

Exit Criteria:
- QA greenlight for demo.

## Inputs Needed

- Aaron: deployed contract and validator setup confirmation
- Wayne: latest frontend build for retesting

## Deliverables

- F1-F28 completed validation matrix
- Bug reports with reproduction
- Final QA signoff summary
