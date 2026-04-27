# ChainRelief Team Setup and Collaboration Guide

> **This is a reference guide for one-week sprint execution.** See `sprint-plan.md` for the full task breakdown. See `developer-onboarding.md` for individual developer setup.

---

## 1. Team Roles and Accounts

### Required Personal Accounts (Everyone)

| Resource | Purpose | Setup | Share? |
|---|---|---|---|
| **GitHub** | Code commits and PRs | Create personal account; ask Wayne to add you as collaborator | No—keeps audit trail |
| **MetaMask Wallet** | Sign transactions, approve proposals | Create via browser extension; never share seed phrase | No—personal wallet always |
| **Infura/Alchemy Account** | RPC provider for frontend (personal key) | Optional: create free account for your own API key | No—use personal key in `.env.local` |

### Shared Resources (Team Admin)

| Resource | Owner | Access | Use |
|---|---|---|---|
| **GitHub Repo** | Wayne | Write access to all 5 members | Code collaboration |
| **Deployer Wallet** | Aaron | Private key on Aaron's machine only (`.env` gitignored) | Deploy contract to Sepolia |
| **Deployed Contract** | Aaron | Address in `deployment.json` (public) | All tasks reference this |
| **Etherscan API Key** | Aaron | Shares in group chat (read-only, low risk) | Contract verification after deploy |
| **Vercel Project** | Wayne | Connected to GitHub repo | Frontend deployment (P1, optional) |

---

## 2. Environment Files and Secrets

### Root `.env` (Smart Contract Deployment)

**File location:** `disaster-relief-dapp/.env` (gitignored, never committed)

```bash
# Aaron fills this in before deployment
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
DEPLOYER_PRIVATE_KEY=0xYOUR_PRIVATE_KEY
VALIDATOR_1=0x412fEdaA6a0a47135b6178AAFf34C347D8D9a531
VALIDATOR_2=0x8ba1f109551bD432803012645Ac136ddd64DBA72
VALIDATOR_3=0x9d4409f4f5e9d8c7a5c3e1b0a9f4e1c4d7e5f3b2
```

**Security rule:** Never commit. Never share. Aaron's machine only.

### Frontend `.env.local` (Runtime Config)

**File location:** `frontend/.env.local` (gitignored, never committed)

```bash
# Wayne shares these exact values after deployment
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_VALIDATOR_1=0x412fEdaA6a0a47135b6178AAFf34C347D8D9a531
NEXT_PUBLIC_VALIDATOR_2=0x8ba1f109551bD432803012645Ac136ddd64DBA72
NEXT_PUBLIC_VALIDATOR_3=0x9d4409f4f5e9d8c7a5c3e1b0a9f4e1c4d7e5f3b2
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
```

**Process:**
1. Wayne shares `.env.local` content in group chat (after Aaron deploys)
2. Each person copies into their local `frontend/.env.local`
3. Restart frontend: `cd frontend && npm run dev`

### Secret Classification

| Variable | Risk Level | Handling |
|---|---|---|
| `DEPLOYER_PRIVATE_KEY` | **Critical** | Aaron only, never share, gitignore enforced |
| RPC API keys (Infura, Alchemy) | Sensitive | Personal keys recommended; team keys acceptable in `.env.local` |
| Validator addresses | **Public** | Safe to commit and share (these are XYZ00 account addresses) |
| Contract address | **Public** | Committed to `deployment.json`, share freely |
| Etherscan API key | Team-internal | Aaron shares in chat (read-only verification) |

---

## 3. Git Workflow and Collaboration

### Branch Naming

```
<type>/<description>

feat/footer-component
feat/about-page
fix/responsive-mobile
docs/update-readme
chore/env-update
```

### Commit Messages

```
feat: add Footer component with Etherscan link
fix: resolve hydration mismatch on navbar load
docs: update Sepolia contract address in README
```

### Pull Request Process

1. Create branch from `main`: `git checkout -b feat/your-feature`
2. Make changes + run local tests (`npm run build`, `npm run lint`, `npx tsc --noEmit`)
3. Push: `git push -u origin feat/your-feature`
4. Open PR on GitHub; tag reviewer (see table below)
5. Squash-merge to `main` after approval

### Required Reviewers

| Author | Reviewer | Domain |
|---|---|---|
| Aaron | Wayne | Backend/Contract changes |
| Allan | Wayne | QA/Frontend features |
| Wayne | Aaron | Frontend infrastructure |
| Rhea | Wayne | UI/Responsive |
| Chito | Wayne | Docs/Content |

---

## 4. MetaMask Setup

### For Local Dev (Hardhat)

1. Network: `Hardhat Local` (custom)
   - RPC: `http://127.0.0.1:8545`
   - Chain ID: `31337`
2. Import test accounts (use private keys from `npx hardhat node` output):
   - Account #0: Validator #1
   - Account #1: Validator #2
3. Label them clearly: "Test Validator #1", "Test Validator #2"

### For Sepolia Testnet

1. Add built-in Sepolia network
2. Create or import your personal validator wallet
3. Get Sepolia ETH:
   - https://sepoliafaucet.com (recommended)
   - Or ask Aaron if faucet is dry

---

## 5. Deployment and Release Access

### Who Can Deploy Where

| Environment | Who | Method |
|---|---|---|
| **Local Hardhat** | Anyone | `npx hardhat run scripts/deploy.ts --network localhost` |
| **Sepolia** | Aaron only | `npx hardhat run scripts/deploy.ts --network sepolia` |
| **Vercel (frontend)** | Wayne only | Vercel dashboard or `vercel --prod` |

### Pre-Deploy Checklist (Aaron)

- [ ] `npx hardhat test` — all 26 pass
- [ ] `.env` has Sepolia RPC URL and funded deployer key
- [ ] Validator addresses set correctly

### Post-Deploy Checklist (Wayne)

- [ ] Update `frontend/.env.local` with Sepolia values
- [ ] Share in group chat
- [ ] Test: frontend connects, shows contract stats

---

## 6. One-Week Team Bring-Up Plan

### Day 0 — Pre-Sprint

| Person | Task | Verification |
|---|---|---|
| Wayne | Add all 4 teammates to GitHub as collaborators | All can `git push` ✓ |
| All | Read `developer-onboarding.md` | No blockers ✓ |
| All | Install Node v22, Git, MetaMask | `node --version` shows v22.x ✓ |

### Day 1 — Local Setup

| Person | Task | Gate |
|---|---|---|
| Aaron | Clone, install, compile, run tests (26 pass) | All tests pass ✓ |
| Allan | Clone, install, set up 2 MetaMask wallets | Both wallets ready ✓ |
| Wayne | Clone, install, deploy locally, start frontend | Donate flow works ✓ |
| Rhea | Clone, install, test all 3 pages at 375px | Screenshots captured ✓ |
| Chito | Clone, install, verify all pages render | No console errors ✓ |

### Day 2 — Sepolia Deployment

| Person | Task | Gate |
|---|---|---|
| Aaron | Deploy to Sepolia, push `deployment.json` | Contract on Etherscan ✓ |
| All | Pull latest, update `frontend/.env.local` | Frontend connects to Sepolia ✓ |
| Allan | Import Sepolia wallets, get test ETH | 2 wallets funded ✓ |

### Days 3-5 — QA, Polish, Demo Prep

See `sprint-plan.md` for detailed tasks. Key gates:
- All P0 tests pass ✓
- Demo rehearsal complete ✓

---

## 7. Troubleshooting

### Private Key Accidentally Committed

```bash
git reset HEAD~1
git add -A && git commit -m "fix: remove sensitive files"
git push --force
# Then rotate the key: create new wallet, transfer funds, update .env
```

### RPC Rate Limit (429 Error)

- Check Infura/Alchemy dashboard
- Regenerate the API key
- Update `.env` and `frontend/.env.local`
- Restart frontend

### Team Member Offboarding

- Remove from GitHub collaborators
- Their validator address stays in contract (immutable)
- Ask them to delete local `.env` files

---

## 8. Quick Reference — Commands

```bash
# Development
npm install                                       # Install root deps
cd frontend && npm install                       # Install frontend deps
npx hardhat test                                 # Run all 26 tests
cd frontend && npm run dev                       # Start frontend (localhost:3000)

# Deployment (Aaron only)
npx hardhat run scripts/deploy.ts --network sepolia

# Debugging
npx hardhat node                                 # Local blockchain
npx hardhat compile                              # Compile contracts
cd frontend && npx tsc --noEmit                  # TypeScript check
cd frontend && npm run lint                      # Lint check
```

---

## 9. Sprint Milestones

| Date | Milestone | Owner |
|---|---|---|
| Day 1 | All developers local setup complete | All |
| Day 2 | Contract deployed to Sepolia | Aaron |
| Day 3 | F1-F8 validation complete | Allan |
| Day 4 | All P0 tests pass | Allan |
| Day 5 | Demo rehearsal complete | Chito |

---

## 10. Communication Norms

- **Blockers:** Tag owner immediately (< 30 min response)
- **High Priority:** < 4 hours response
- **Normal:** Next day response
- **Information Sharing:** Post `.env.local` values in group chat after deployment

---

**Questions?** See `developer-onboarding.md` for setup help or `sprint-plan.md` for task details.
