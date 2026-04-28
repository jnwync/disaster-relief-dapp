# ChainRelief — One-Week Sprint Plan

**Project:** ChainRelief — Transparent Disaster Relief DApp
**Sprint Duration:** 5 working days
**Goal:** Deliver a demo-ready DApp with smart contract on Sepolia, functional frontend, full test coverage, documentation, and rehearsed presentation.

---

## 1. Assumptions

1. Smart contract is **code-complete** (26/26 tests passing, deploy script exports ABI + deployment.json).
2. Frontend is **code-complete** (3 pages render, production build passes, lint clean).
3. Contract is deployed to **local Hardhat node only** — Sepolia deployment has not been done yet.
4. No automated E2E tests exist — only Hardhat unit tests for the contract.
5. No README, setup guide, demo script, or presentation materials exist yet.
6. The `.env.local` uses placeholder validator addresses (Hardhat defaults), not real Sepolia addresses.
7. The team has 5 members. Sprint work is **post-setup** — scaffolding and core implementation are done.
8. The final deliverable is a **live demo** showing the full donate-propose-approve-release-audit flow on Sepolia.
9. Vercel deployment is stretch scope — the demo can run on localhost against Sepolia if needed.

---

## 2. Clarifying Questions (Answered via Context)

| # | Question | Resolution |
|---|----------|------------|
| 1 | Is the contract deployed to Sepolia? | No. Deployment is remaining work. |
| 2 | What does "demo-ready" mean? | Full end-to-end flow on Sepolia: donate, register beneficiary, propose, approve x2, release, audit trail visible. |
| 3 | Are there rubric requirements? | Yes — see `idea.md` Section 16 for rubric mapping. Key areas: working DApp, smart contract, testing, documentation, presentation. |
| 4 | Is Vercel deployment required? | Stretch. Localhost against Sepolia is acceptable for demo. |
| 5 | What presentation format? | Live demo + slide deck or scripted walkthrough. |

---

## 3. Current State Assessment

### Done (Setup Phase — Aaron + Wayne)

| Layer | Status | Evidence |
|-------|--------|----------|
| Smart Contract | Code-complete | 26/26 tests, all functions implemented |
| Deploy Script | Code-complete | Exports ABI + deployment.json to frontend |
| Frontend Scaffold | Code-complete | Next.js 16, Tailwind v4, wagmi v2 configured |
| Donate Page | Code-complete | ContractStats, DonationForm, DonationFeed |
| Admin Page | Code-complete | AdminGate (3-tier), ProposalCard, fund toggle, beneficiary reg, proposals |
| Audit Page | Code-complete | AuditTimeline with color-coded events, 30s polling |
| UI Primitives | Code-complete | Button, Card, Input, Badge, Skeleton |
| Navbar | Code-complete | Wallet connect/disconnect, wrong-network banner |

### Remaining Work (Sprint Scope)

| # | Work Item | Owner Target | Priority |
|---|-----------|-------------|----------|
| W1 | Deploy contract to Sepolia testnet | Aaron | P0 |
| W2 | Update frontend .env with real Sepolia addresses | Wayne | P0 |
| W3 | End-to-end integration test on Sepolia (all 3 pages) | Aaron | P0 |
| W4 | Manual validation: F1-F8 (Donate page) | Allan | P0 |
| W5 | Manual validation: F9-F19 (Admin page) | Allan | P0 |
| W6 | Manual validation: F20-F28 (Audit + Cross-cutting) | Allan | P0 |
| W7 | Bug fixes from validation | Aaron + Wayne | P0 |
| W8 | Responsive/mobile pass (375px viewport) | Rhea | P0 |
| W9 | Visual polish: spacing, alignment, loading states | Rhea | P0 |
| W10 | Accessibility pass: contrast, focus states, aria labels | Rhea | P1 |
| W11 | README with project overview, setup, architecture | Chito | P0 |
| W12 | Troubleshooting doc + verify onboarding guide accuracy | Chito | P0 |
| W13 | Demo script + presentation walkthrough | Chito | P0 |
| W14 | Vercel deployment + live URL | Wayne | P1 |
| W15 | Error message mapping (contract reverts to friendly text) — `lib/errors.ts` + update DonationForm, AdminPage, ProposalCard | Allan | P1 |
| W16 | keccak256 description hash preview on admin | Wayne | P1 |
| W17 | Bug reporting and triage documentation | Allan | P0 |
| W18 | Final submission checklist | Chito | P0 |
| W19 | Demo rehearsal | All | P0 |
| W20 | Backup demo video recording | Chito | P1 |
| W21 | Build `components/Footer.tsx` — contract address display, Etherscan link, team credit, responsive layout | Rhea | P1 |
| W22 | Build `app/about/page.tsx` — project overview, how-it-works steps (donate→propose→approve→release), tech stack badges | Chito | P1 |

---

## 4. Work Breakdown Structure

### Workstream 1: Smart Contract (Aaron — Backend)

#### Capability Module: Sepolia Deployment

**A) Agent Instruction Block**

- **Module Name:** Deploy-Contract-Sepolia
- **Role:** Backend lead deploying verified contract to Sepolia testnet
- **Trigger:** Sprint Day 1 start
- **Inputs:** Deployer private key (funded Sepolia ETH), Sepolia RPC URL, 3 validator wallet addresses
- **Execution Steps:**
  1. Fund deployer wallet with Sepolia ETH from faucet
  2. Set SEPOLIA_RPC_URL and DEPLOYER_PRIVATE_KEY in .env
  3. Set VALIDATOR_1, VALIDATOR_2, VALIDATOR_3 to team wallet addresses
  4. Run `npx hardhat run scripts/deploy.ts --network sepolia`
  5. Verify ABI exported to `frontend/src/contracts/DisasterRelief.json`
  6. Verify deployment metadata exported to `frontend/src/contracts/deployment.json`
  7. Record contract address and deployment block number
  8. Verify contract on Etherscan: `npx hardhat verify --network sepolia <address> <constructor-args>`
- **Output:** Deployed contract address, verified on Sepolia Etherscan, updated deployment.json
- **Constraints:** Must not use mainnet. Must not commit private keys.
- **Edge Cases:** If faucet is dry, use backup faucet. If verification fails, proceed without — demo still works.

**B) Human Review Block**

- **User Story:** As a project team, we want the contract deployed to Sepolia, so that we can demo with real testnet transactions.
- **Acceptance Criteria:**
  - Contract is deployed and callable on Sepolia
  - `deployment.json` contains correct Sepolia address and chainId 11155111
  - All 6 contract functions callable from Etherscan
- **Definition of Done:**
  - deployment.json committed with Sepolia address
  - At least one successful transaction visible on Sepolia Etherscan

---

#### Capability Module: Integration Verification

**A) Agent Instruction Block**

- **Module Name:** End-to-End-Integration
- **Role:** Integration tester validating full flow on Sepolia
- **Trigger:** After frontend .env updated with Sepolia addresses
- **Inputs:** Deployed contract, frontend running on localhost, 2+ MetaMask wallets
- **Execution Steps:**
  1. Start frontend: `cd frontend && npm run dev`
  2. Connect validator wallet 1 in MetaMask
  3. Navigate to /admin — verify gate shows dashboard
  4. Register a beneficiary address
  5. Create a proposal (0.01 ETH to beneficiary)
  6. Switch to validator wallet 2
  7. Approve the same proposal — verify funds release
  8. Navigate to / — donate 0.01 ETH, verify stats update
  9. Navigate to /audit — verify all events appear with correct colors
  10. Disconnect wallet — verify all pages show connect prompts
- **Output:** Pass/fail for each step, list of bugs found
- **Constraints:** Must test on Sepolia, not local Hardhat node.

**B) Human Review Block**

- **User Story:** As a team, we want to verify the full donate-propose-approve-release-audit flow works end-to-end on Sepolia, so that the demo will succeed.
- **Acceptance Criteria:**
  - Donation completes and stats update
  - Proposal created and visible in admin
  - Two-validator approval triggers fund release
  - All events appear on audit page with correct type badges
  - Wrong-network banner appears on non-Sepolia chains
- **Definition of Done:**
  - All P0 validation items pass
  - No blocking bugs in critical flow

---

### Workstream 2: Frontend (Wayne + Rhea + Allan + Chito)

#### Capability Module: Visual Polish and Responsive

**A) Agent Instruction Block**

- **Module Name:** UI-Polish-Responsive
- **Role:** Frontend developer refining UI for demo quality
- **Trigger:** After integration verification begins
- **Inputs:** Running frontend on localhost
- **Execution Steps:**
  1. Test all 3 pages at 375px, 768px, 1024px, 1440px viewports
  2. Fix any horizontal scroll issues at 375px
  3. Ensure touch targets >= 44px on mobile
  4. Verify loading skeletons appear for all async data
  5. Check spacing consistency across all Card components
  6. Verify font hierarchy: h1 (3xl bold), h2 (xl semibold), body (sm)
  7. Test color contrast against WCAG AA for all text on background
  8. Add focus-visible rings on all interactive elements
  9. Test keyboard navigation through donate form and admin form
- **Output:** List of fixes applied, before/after screenshots
- **Constraints:** Must not change component APIs or data flow. Visual only.

**B) Human Review Block**

- **User Story:** As a demo viewer, I want the interface to look professional and work on any screen, so that the presentation is credible.
- **Acceptance Criteria:**
  - No horizontal scroll at 375px viewport
  - All buttons and inputs have visible focus states
  - Loading skeletons appear before data loads
  - Consistent spacing across all pages
- **Definition of Done:**
  - Tested at 375px, 768px, 1440px
  - No visual regressions in production build

---

#### Capability Module: Error Message Mapping

**A) Agent Instruction Block**

- **Module Name:** Error-Message-UX
- **Role:** Allan — frontend feature: error message mapping
- **Trigger:** After integration bugs identified
- **Inputs:** Contract revert strings from DisasterRelief.sol
- **Execution Steps:**
  1. Read all `require()` messages from `contracts/DisasterRelief.sol`
  2. Create mapping object in `frontend/src/lib/errors.ts`
  3. Map each contract revert to user-friendly message
  4. Update DonationForm, AdminPage, ProposalCard to use mapping
  5. Handle: "User rejected" (MetaMask cancel), "insufficient funds", all contract-specific reverts
- **Output:** `errors.ts` file, updated error displays in 3 components

**B) Human Review Block**

- **User Story:** As a donor or validator, I want to see clear error messages when something goes wrong, so that I know what to fix.
- **Acceptance Criteria:**
  - "Fund is not active" instead of raw revert hex
  - "Transaction cancelled" when MetaMask is rejected
  - "Amount exceeds available balance" for insufficient funds
- **Definition of Done:**
  - All known revert strings mapped
  - No raw hex or stack traces shown to users

---

#### Capability Module: Footer Component (Rhea)

**A) Agent Instruction Block**

- **Module Name:** Footer-Component
- **Role:** Rhea — frontend feature: site-wide footer
- **Trigger:** Day 2 (after responsive audit complete)
- **Inputs:** CONTRACT_ADDRESS from `lib/contract.ts`, getEtherscanUrl from `lib/utils.ts`
- **Execution Steps:**
  1. Create `frontend/src/components/Footer.tsx` as a client component
  2. Display deployed contract address (linked to Etherscan) using getEtherscanUrl(CONTRACT_ADDRESS, "address")
  3. Show "Built by Team ChainRelief" with team member names
  4. Add navigation links: Donate, Admin, Audit Trail
  5. Responsive: stack vertically on mobile (375px), horizontal on desktop
  6. Import and render Footer in `app/layout.tsx` below `{children}`
- **Output:** `Footer.tsx` rendered on all pages, responsive at all breakpoints

**B) Human Review Block**

- **User Story:** As a site visitor, I want a footer showing the contract address and team info, so that I can verify the contract and know who built it.
- **Acceptance Criteria:**
  - Contract address links to Etherscan
  - Footer visible on all 3 pages
  - Responsive at 375px (no overflow)
- **Definition of Done:**
  - Footer.tsx committed and rendered in layout.tsx
  - Visible on all pages at all breakpoints

---

#### Capability Module: About Page (Chito)

**A) Agent Instruction Block**

- **Module Name:** About-Page
- **Role:** Chito — frontend feature: project about/how-it-works page
- **Trigger:** Day 2 (after README draft complete)
- **Inputs:** Project context from README, Card/Badge UI primitives
- **Execution Steps:**
  1. Create `frontend/src/app/about/page.tsx` as a server component
  2. Add hero section: "How ChainRelief Works" heading + 1-paragraph summary
  3. Add 4-step visual flow using Card components: (1) Donate ETH, (2) Propose Disbursement, (3) Multi-sig Approve, (4) Funds Released
  4. Add tech stack section with Badge components: Solidity, Hardhat, Next.js, wagmi, Tailwind
  5. Add "View Audit Trail" link to /audit page
  6. Add route to Navbar: "About" linking to /about
- **Output:** `/about` page with project explanation, step flow, tech stack

**B) Human Review Block**

- **User Story:** As a professor or evaluator, I want an About page explaining how ChainRelief works, so that I can understand the project architecture without reading code.
- **Acceptance Criteria:**
  - /about is navigable from Navbar
  - 4-step flow is visually clear
  - Tech stack badges render correctly
- **Definition of Done:**
  - about/page.tsx committed and linked in Navbar
  - Page renders with all sections at all breakpoints

---

### Workstream 3: Testing and QA (Allan)

#### Capability Module: Manual Validation Matrix

**A) Agent Instruction Block**

- **Module Name:** Manual-Test-Execution
- **Role:** QA tester executing structured validation checklist
- **Trigger:** After Sepolia deployment and frontend .env update
- **Inputs:** Running frontend connected to Sepolia, MetaMask with validator and non-validator wallets
- **Execution Steps:**
  1. Execute F1-F8 (Donate page): stats display, donation flow, zero amount, non-numeric, wallet reject, inactive fund
  2. Execute F9-F19 (Admin page): gate states, register, propose, approve, double-approve, fund toggle
  3. Execute F20-F28 (Audit + Cross-cutting): event display, color coding, Etherscan links, ordering, wrong network, disconnect, refresh
  4. For each test: record Pass/Fail, actual behavior, screenshot if fail
  5. File bug reports with: test ID, expected vs actual, steps to reproduce
  6. Re-test after fixes, update results
- **Output:** Completed validation matrix (markdown table), bug reports
- **Constraints:** Must test on Sepolia, not local node. Must test with both validator and non-validator wallets.

**B) Human Review Block**

- **User Story:** As a team, we want structured QA validation against all 28 test cases, so that we ship with confidence.
- **Acceptance Criteria:**
  - All P0 tests (F1-F6, F9-F12, F14-F18, F20-F22, F24, F26-F28) pass
  - Bug reports filed for any failures with reproduction steps
  - Re-test confirms fixes
- **Definition of Done:**
  - Validation matrix completed and committed
  - Zero P0 failures in final pass

---

### Workstream 4: Documentation and Demo (Chito)

#### Capability Module: Project Documentation

**A) Agent Instruction Block**

- **Module Name:** Documentation-Suite
- **Role:** Technical writer creating project documentation
- **Trigger:** Sprint Day 1
- **Inputs:** Codebase, contract address, architecture decisions
- **Execution Steps:**
  1. Create `README.md` with: project overview, problem statement, architecture diagram (text), tech stack, link to `docs/developer-onboarding.md`, team members
  2. Create `docs/troubleshooting.md` with common issues: MetaMask connection, wrong network, faucet, build errors
  3. Create `docs/demo-script.md` with timed walkthrough: intro (1min), donate flow (2min), admin flow (3min), audit page (1min), Q&A prep (3min)
  4. Map all rubric criteria to deliverables in `docs/rubric-mapping.md`
  5. Verify `docs/developer-onboarding.md` (written by Wayne) is accurate by following it yourself
- **Output:** 4 documentation files committed + onboarding guide verified
- **Constraints:** Must be accurate to current codebase. No aspirational features. Setup guide already exists at `docs/developer-onboarding.md` — do not duplicate, just link to it.

**B) Human Review Block**

- **User Story:** As a reviewer/professor, I want clear documentation showing the project is well-organized and reproducible, so that I can evaluate it fairly.
- **Acceptance Criteria:**
  - README explains what ChainRelief does in < 3 paragraphs
  - Setup guide gets a fresh clone running in < 10 minutes
  - Demo script is timed and rehearsable
- **Definition of Done:**
  - All docs committed
  - Setup guide tested by at least one non-author team member

---

### Workstream 5: Integration and Handoffs

| From | To | Handoff | Trigger |
|------|----|---------|---------|
| Aaron | Wayne | deployment.json with Sepolia address | After W1 |
| Aaron | Allan | "Ready for QA" signal + validator wallet keys | After W3 |
| Allan | Aaron + Wayne | Bug reports | During W4-W6 |
| Aaron + Wayne | Allan | Bug fixes committed | Within 4h of report |
| Rhea | Allan | "Polish complete" signal | After W9 |
| Chito | All | Demo script for rehearsal | Day 5 |

---

## 5. Day-by-Day Sprint Plan

### Day 1 — Deploy and Stabilize

| Person | Tasks | Deliverable | Hours |
|--------|-------|-------------|-------|
| **Aaron** | W1: Deploy contract to Sepolia. Fund deployer. Verify on Etherscan. | Deployed contract, updated deployment.json | 4h |
| **Allan** | Onboard via `docs/developer-onboarding.md`. W4: Prepare validation matrix. W15: Start `lib/errors.ts`. | Local env running, errors.ts started | 2h |
| **Wayne** | W2: Update all env files with Sepolia values, share with team. W14: Set up Vercel. Add collaborators. | Env values shared, Vercel config | 3h |
| **Rhea** | Onboard via `docs/developer-onboarding.md`. W8: Audit 3 pages at 375px. Start fixes. | Local env running, responsive issue list | 3h |
| **Chito** | Onboard via `docs/developer-onboarding.md`. W11: Write README.md. | Local env running, README first draft | 3h |

**Day 1 Gate:** Contract deployed to Sepolia. Frontend .env updated. `npm run dev` connects to Sepolia contract.

---

### Day 2 — Integration and First QA Pass

| Person | Tasks | Deliverable | Hours |
|--------|-------|-------------|-------|
| **Aaron** | W3: Full end-to-end integration test on Sepolia. File issues. W7: Fix any contract-interaction bugs. | Integration test results, bug fixes | 5h |
| **Allan** | W4: Execute F1-F8 (Donate page validation). W15: Complete `errors.ts` + wire into DonationForm, AdminPage, ProposalCard. | F1-F8 results, errors.ts complete | 3h |
| **Wayne** | W16: Add keccak256 hash preview to admin. W7: Frontend bug fixes from QA. | Hash preview working, bug fixes | 3h |
| **Rhea** | W8: Complete responsive fixes. W21: Build `Footer.tsx` and add to layout. | Responsive fixes + Footer committed | 3h |
| **Chito** | W12: Write troubleshooting doc. W22: Build `app/about/page.tsx` with how-it-works flow. | Troubleshooting doc, About page committed | 3h |

**Day 2 Gate:** Integration test passes full flow. F1-F8 validation complete. Responsive fixes applied.

---

### Day 3 — Deep QA and Polish

| Person | Tasks | Deliverable | Hours |
|--------|-------|-------------|-------|
| **Aaron** | W7: Fix bugs from F1-F8. Re-test fixes. Support Allan's admin testing. | Bug fixes committed and verified | 4h |
| **Allan** | W5: Execute F9-F19 (Admin page validation). File bugs. | F9-F19 results documented | 4h |
| **Wayne** | W7: Fix frontend bugs from QA. W14: Deploy to Vercel if stable. | Bug fixes, Vercel deployment attempt | 3h |
| **Rhea** | W9: Complete visual polish. W10: Accessibility pass — contrast, focus, aria. | Polish committed, a11y fixes | 3h |
| **Chito** | W13: Complete demo script with timing. Start troubleshooting doc. | Demo script complete | 3h |

**Day 3 Gate:** F1-F19 validated. All P0 bugs fixed. Visual polish applied.

---

### Day 4 — Final QA and Documentation

| Person | Tasks | Deliverable | Hours |
|--------|-------|-------------|-------|
| **Aaron** | W7: Fix any remaining bugs. Verify contract state is clean for demo. | All bugs resolved | 3h |
| **Allan** | W6: Execute F20-F28 (Audit + Cross-cutting). W17: Complete bug report doc. | F20-F28 results, bug report summary | 4h |
| **Wayne** | W7: Fix remaining frontend bugs. W14: Verify Vercel deployment. | Final fixes, Vercel live | 3h |
| **Rhea** | W10: Complete accessibility fixes. Final visual consistency check. | A11y complete, visual sign-off | 2h |
| **Chito** | W11: Finalize README. W18: Create submission checklist. Troubleshooting doc done. | Final docs committed | 3h |

**Day 4 Gate:** All F1-F28 P0 tests pass. Documentation complete. Vercel deployed (or localhost fallback confirmed).

---

### Day 5 — Demo Prep and Rehearsal

| Person | Tasks | Deliverable | Hours |
|--------|-------|-------------|-------|
| **Aaron** | W19: Participate in demo rehearsal. Fix any last-minute issues. | Demo-ready contract state | 2h |
| **Allan** | W19: Final regression pass. Verify all P0 tests still pass after fixes. | Final test report | 2h |
| **Wayne** | W19: Participate in demo rehearsal. Verify live URL or localhost. | Demo-ready frontend | 2h |
| **Rhea** | W19: Visual spot-check during rehearsal. Fix any last cosmetic issues. | Visual sign-off | 1h |
| **Chito** | W19: Lead demo rehearsal. Time each section. W20: Record backup demo video. | Rehearsal complete, backup video | 3h |

**Day 5 Gate:** Full demo rehearsed. Timing confirmed. Backup video recorded.

---

### Day 5 Closeout (No Extra Buffer Days)

- Final submission packaging is completed on Day 5.
- Any non-blocking stretch work not finished by Day 5 is explicitly deferred.
- Demo fallback assets (backup video + script) must be finalized before end of Day 5.

---

## 6. Ownership and Reviewer Matrix

| Work Item | Owner | Reviewer | Domain |
|-----------|-------|----------|--------|
| W1: Sepolia deployment | Aaron | Wayne | Backend |
| W2: Frontend .env update + share with team | Wayne | Aaron | Frontend |
| W3: Integration test | Aaron | Allan | Backend |
| W4: F1-F8 validation | Allan | Aaron | QA |
| W5: F9-F19 validation | Allan | Aaron | QA |
| W6: F20-F28 validation | Allan | Wayne | QA |
| W7: Bug fixes (contract) | Aaron | Allan | Backend |
| W7: Bug fixes (frontend) | Wayne | Allan | Frontend |
| W8: Responsive fixes | Rhea | Wayne | Frontend |
| W9: Visual polish | Rhea | Wayne | Frontend |
| W10: Accessibility | Rhea | Wayne | Frontend |
| W11: README | Chito | Wayne | Docs |
| W12: Troubleshooting doc + verify onboarding | Chito | Wayne | Docs |
| W13: Demo script | Chito | All | Docs |
| W14: Vercel deployment | Wayne | Aaron | Frontend |
| W15: Error message mapping (`errors.ts` + component updates) | Allan | Wayne | Frontend |
| W16: keccak256 preview | Wayne | Aaron | Frontend |
| W17: Bug report doc | Allan | Aaron | QA |
| W18: Submission checklist | Chito | Wayne | Docs |
| W19: Demo rehearsal | Chito (lead) | All | Demo |
| W20: Backup video | Chito | Wayne | Demo |
| W21: Footer component (`Footer.tsx` + layout integration) | Rhea | Wayne | Frontend |
| W22: About page (`app/about/page.tsx` + Navbar link) | Chito | Wayne | Frontend |

---

## 7. Capacity and Ownership Review

### Ownership Balance

| Person | Primary Focus | Work Items | Relative Load |
|--------|---------------|------------|---------------|
| **Aaron** | Contract deployment and integration | W1, W3, contract-side W7, W19 | Heavy |
| **Allan** | QA execution and error handling | W4, W5, W6, W15, W17, W19 | Medium |
| **Wayne** | Frontend coordination and environment sync | W2, frontend-side W7, W14, W16, W19 | Medium |
| **Rhea** | UI polish, responsive behavior, accessibility | W8, W9, W10, W21, W19 | Medium |
| **Chito** | Docs, demo prep, and About page content | W11, W12, W13, W18, W20, W22 | Medium |

### Distribution Check

- The split is feature-based, not setup-based, and each person owns a distinct part of the demo path.
- Aaron carries the highest-risk work because deployment and on-chain integration are the critical path.
- The remaining ownership is intentionally even across QA, frontend, UI, and docs so no one is overloaded with side work.
- If scope slips, cut stretch items first: W14, W16, W20, W21, and W22.

---

## 8. Definition of Done by Workstream

### Smart Contract
- [ ] Deployed to Sepolia with verified source
- [ ] deployment.json contains correct Sepolia address and chainId 11155111
- [ ] 26/26 unit tests pass
- [ ] At least one successful transaction on Sepolia Etherscan

### Frontend
- [ ] `npm run build` passes with zero errors
- [ ] `npm run lint` passes with zero errors
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] All 3 pages render on localhost connected to Sepolia
- [ ] Responsive at 375px, 768px, 1440px (no horizontal scroll)

### Testing and QA
- [ ] F1-F28 validation matrix completed
- [ ] All P0 tests pass (F1-F6, F9-F12, F14-F18, F20-F22, F24, F26-F28)
- [ ] Bug reports filed with reproduction steps
- [ ] Re-test confirms all fixes

### Documentation
- [ ] README.md with overview, setup, architecture, team
- [ ] Setup guide tested by non-author
- [ ] Demo script with timing (< 10 min total)
- [ ] Submission checklist complete

### Demo
- [ ] Full flow rehearsed: donate -> register -> propose -> approve x2 -> release -> audit
- [ ] Backup video recorded
- [ ] All team members can explain their contribution

---

## 9. Risks and Mitigations

| # | Risk | Probability | Impact | Owner | Mitigation | Fallback |
|---|------|-------------|--------|-------|------------|----------|
| R1 | Sepolia faucet dry — can't fund deployer | Medium | High | Aaron | Try multiple faucets (Alchemy, Infura, PoW). Request from teammates. | Deploy to Hardhat local node for demo. |
| R2 | MetaMask connection issues in demo | Medium | High | Wayne | Test on multiple browsers. Have pre-connected wallet state. | Use backup demo video. |
| R3 | Vercel deployment fails | Low | Low | Wayne | Debug env vars, check build logs. | Demo on localhost — equally valid. |
| R4 | Contract bug discovered during QA | Medium | High | Aaron | Day 2-3 buffer exists for fixes. Aaron available for quick patches. | Scope-reduce: skip the broken feature in demo. |
| R5 | Team member unavailable | Low | Medium | All | Cross-training: Wayne can do Aaron's frontend fixes, Chito can assist Allan. | Redistribute tasks, cut stretch items first. |
| R6 | Gas estimation errors on Sepolia | Low | Medium | Aaron | Test with explicit gas limits. Check Sepolia gas prices. | Increase gas limit in wagmi config. |
| R7 | Demo runs over time | Medium | Low | Chito | Timed rehearsal on Day 5. Hard cutoffs per section. | Cut Q&A or audit page walkthrough. |

---

## 10. Final Action Checklist for Immediate Execution

**Aaron — Do These Today:**

- [ ] Get Sepolia ETH from faucet for deployer wallet
- [ ] Get Sepolia ETH for 2-3 validator wallets
- [ ] Set real validator addresses in `.env`
- [ ] Run `npx hardhat run scripts/deploy.ts --network sepolia`
- [ ] Verify deployment.json updated with Sepolia address
- [ ] Share contract address with team in group chat

**Allan — Do These Today:**

- [ ] Follow `docs/developer-onboarding.md` to clone, install, and run locally
- [ ] Install MetaMask, import 2 Hardhat test accounts (one validator, one non-validator)
- [ ] Verify you can complete a test donation on localhost
- [ ] Create validation matrix template (markdown table with F1-F28)
- [ ] Read all `require()` messages in `contracts/DisasterRelief.sol`
- [ ] Start `frontend/src/lib/errors.ts` with revert-to-friendly-message mapping

**Wayne — Do These Today:**

- [ ] Commit `docs/developer-onboarding.md` and share link with team
- [ ] Share `.env.local` values in group chat for teammates
- [ ] Add all 4 teammates as GitHub collaborators
- [ ] Create Vercel project linked to GitHub repo
- [ ] Wait for Aaron's deployment.json, then update `.env.local` with Sepolia values and share with team

**Rhea — Do These Today:**

- [ ] Follow `docs/developer-onboarding.md` to clone, install, and run locally
- [ ] Verify you can see all 3 pages on localhost
- [ ] Open all 3 pages at 375px in Chrome DevTools
- [ ] Document every responsive issue (screenshots + line numbers)
- [ ] Start fixing the most visible issues first
- [ ] Plan `Footer.tsx` layout (contract address, team names, nav links)

**Chito — Do These Today:**

- [ ] Follow `docs/developer-onboarding.md` to clone, install, and run locally
- [ ] Verify you can see all 3 pages on localhost
- [ ] Start README.md with project overview section
- [ ] Create docs/ folder structure: demo-script.md, troubleshooting.md
- [ ] Draft content for `app/about/page.tsx` (how-it-works steps, tech stack list)
