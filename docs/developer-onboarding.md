# ChainRelief Developer Onboarding

**For: Allan, Rhea, Chito, Aaron**
**Setup by: Wayne (all environment config is already done)**

You are joining a repo where the smart contract and frontend are already built and configured. This guide gets you from `git clone` to a running app in under 10 minutes.

---

## Prerequisites

Install these before you start:

| Tool | How to install | Verify |
|---|---|---|
| **Node.js v22 LTS** | macOS: `brew install node@22` / Windows: [nodejs.org](https://nodejs.org) | `node --version` (must show v22.x or higher) |
| **Git** | macOS: `brew install git` / Windows: [git-scm.com](https://git-scm.com) | `git --version` |
| **MetaMask** | Install browser extension from [metamask.io](https://metamask.io) | Click the fox icon in your browser toolbar |

---

## Step 1: Clone the Repo

```bash
git clone https://github.com/jnwync/disaster-relief-dapp.git
cd disaster-relief-dapp
```

If you get `Permission denied`: message Wayne with your GitHub username so he can add you as a collaborator.

---

## Step 2: Install Dependencies

Run these two commands (they install smart contract tooling and frontend tooling separately):

```bash
npm install
```

```bash
cd frontend
npm install
cd ..
```

You should now have two `node_modules/` folders — one in the root and one in `frontend/`.

If you see `npm ERR! code ERESOLVE`, run: `npm install --legacy-peer-deps`

---

## Step 3: Create Your Environment Files

### 3A: Root `.env` (for smart contract commands)

```bash
cp .env.example .env
```

Open `.env` in any editor and fill in the validator addresses. Wayne will share these in the group chat. It looks like this:

```
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
DEPLOYER_PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
VALIDATOR_1=0x...
VALIDATOR_2=0x...
VALIDATOR_3=0x...
```

**For local development only**, you can use Hardhat's built-in test accounts:

```
SEPOLIA_RPC_URL=
DEPLOYER_PRIVATE_KEY=
VALIDATOR_1=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
VALIDATOR_2=0x70997970C51812dc3A010C7d01b50e0d17dc79C8
VALIDATOR_3=0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
```

### 3B: Frontend `.env.local` (for the Next.js app)

```bash
cp frontend/.env.example frontend/.env.local
```

Open `frontend/.env.local` and fill in the values. Wayne will share the exact values to paste.

**For local Hardhat development:**

```
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_VALIDATOR_1=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
NEXT_PUBLIC_VALIDATOR_2=0x70997970C51812dc3A010C7d01b50e0d17dc79C8
NEXT_PUBLIC_VALIDATOR_3=0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
```

**For Sepolia (live testnet):**

Wayne will share the exact `.env.local` content in the group chat. It will look like:

```
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_VALIDATOR_1=0x412fEdaA6a0a47135b6178AAFf34C347D8D9a531
NEXT_PUBLIC_VALIDATOR_2=0x8ba1f109551bD432803012645Ac136ddd64DBA72
NEXT_PUBLIC_VALIDATOR_3=0x9d4409f4f5e9d8c7a5c3e1b0a9f4e1c4d7e5f3b2
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
```

Just paste it in and restart the frontend.

---

## Step 4: Verify Smart Contract Tests Pass

```bash
npx hardhat test
```

You should see:

```
  DisasterRelief
    Deployment
      ✔ T1: Should set correct deployment state
    Donations
      ✔ T2: Should accept donation and emit event
    ... (more tests)

  26 passing
```

All 26 tests must pass. If they don't, run `npm install` again from the root.

---

## Step 6: Start the Local Blockchain (Optional — Skip if Already on Sepolia)

```bash
npx hardhat node
```

This starts a local Ethereum node at `http://127.0.0.1:8545`. You will see 20 test accounts printed with their private keys and 10000 ETH each.

**Leave this terminal open.** Open a new terminal for the next steps.

**Note:** If Wayne has shared Sepolia `.env.local` values, you can skip this and the next steps—the backend is already deployed to Sepolia testnet. Jump to Step 10.

---

## Step 6: Deploy the Contract Locally

In your new terminal:

```bash
npx hardhat run scripts/deploy.ts --network localhost
```

You should see:

```
Deploying DisasterRelief...
Disaster: Hurricane Relief
Validators: [0xf39..., 0x709..., 0x3C4...]
DisasterRelief deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
ABI exported to: .../frontend/src/contracts/DisasterRelief.json
Deployment metadata exported to: .../frontend/src/contracts/deployment.json
```

If you see `Missing VALIDATOR_1`: go back to Step 3A and make sure your `.env` file exists with validator addresses.

---

## Step 7: Start the Frontend

```bash
cd frontend
npm run dev
```

**Important:** This uses `--webpack` mode (not Turbopack) for stability. The dev script is configured in `package.json` as `next dev --webpack`.

You should see:

```
  ▲ Next.js 16.2.4 (webpack)
  - Local:    http://localhost:3000
  ✓ Ready in 285ms
```

Open http://localhost:3000 in your browser. You should see the ChainRelief donate page with "Connect your wallet" message.

**If you see "Hydration mismatch" errors:** These go away after the page fully loads (wallet state is client-only). Safe to ignore on first page load.

---

## Step 8: Connect MetaMask

### Add Hardhat Network to MetaMask

1. Open MetaMask
2. Click the network dropdown (top-left) > **Add Network** > **Add a network manually**
3. Enter:
   - **Network Name:** `Hardhat Local`
   - **RPC URL:** `http://127.0.0.1:8545`
   - **Chain ID:** `31337`
   - **Currency Symbol:** `ETH`
4. Click **Save**

### Import a Test Account

1. In MetaMask, click the account icon > **Import Account**
2. Select "Private Key"
3. Paste this private key (Hardhat Account #0 — this is a publicly known test key, not real money):
   ```
   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
4. Click **Import**

You should see ~10000 ETH. This is fake test ETH on your local blockchain.

### Import a Second Account (for multi-sig testing)

Repeat the import with Hardhat Account #1:
```
0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
```

---

## Step 9: Test the Full Flow

1. Go to http://localhost:3000
2. Click **Connect Wallet** > approve in MetaMask
3. Type `0.1` in the donation field > click **Donate** > approve in MetaMask
4. Wait for confirmation — you should see "Donation successful!"
5. The stats at the top should update (Total Donated, Donor Count)
6. Go to http://localhost:3000/admin — you should see the validator dashboard
7. Go to http://localhost:3000/audit — you should see your donation event

If the donation reverts: go to `/admin` first and make sure the fund is active (click "Activate Fund").

---

## You're Done!

Your local development environment is ready. Here's a quick reference for daily use:

| What | Command | Where | Notes |
|---|---|---|---|
| Start local blockchain | `npx hardhat node` | Root (leave running) | For local dev only |
| Deploy to Sepolia | `npx hardhat run scripts/deploy.ts --network sepolia` | Root | Aaron only; requires funded deployer wallet |
| Start frontend | `cd frontend && npm run dev` | Frontend | Uses webpack, not Turbopack |
| Run contract tests | `npx hardhat test` | Root | Always run before deploying |
| Build frontend | `cd frontend && npm run build` | Frontend | Check for TypeScript/lint errors |
| Lint frontend | `cd frontend && npm run lint` | Frontend | Run before committing |
| Type-check frontend | `cd frontend && npx tsc --noEmit` | Frontend | Catches TypeScript issues |
| Verify contract type-gen | `npx typechain --target ethers-v6 ./artifacts --out-dir ./typechain-types` | Root | Auto-runs on compile |

---

## Working on Your Tasks

### Before you start coding

```bash
git pull origin main
```

### Create a branch for your work

```bash
git checkout -b feat/your-feature-name
# Examples:
# git checkout -b feat/error-mapping       (Allan)
# git checkout -b feat/footer-component    (Rhea)
# git checkout -b feat/about-page          (Chito)
# git checkout -b fix/responsive-mobile    (Rhea)
```

### When you're done

```bash
# Make sure everything still works
cd frontend && npm run build && npm run lint && npx tsc --noEmit
cd ..

# Commit your changes
git add <your-files>
git commit -m "feat: description of what you did"

# Push and create a PR
git push -u origin feat/your-feature-name
```

Then go to GitHub and create a Pull Request to `main`. Tag Wayne as reviewer.

---

## Switching to Sepolia (After Aaron Deploys)

Once Aaron deploys to Sepolia, Wayne will share updated `.env.local` values. To switch:

1. Replace the contents of `frontend/.env.local` with the Sepolia values Wayne shares
2. Restart the frontend: stop the dev server (Ctrl+C), then `cd frontend && npm run dev`
3. In MetaMask, switch to **Sepolia** network (built-in — top left dropdown > Sepolia)
4. You will need Sepolia test ETH:
   - Get from https://sepoliafaucet.com (free, no signup)
   - Or ask Aaron for test ETH if the faucet is dry
   - Validator wallets need gas for approving proposals (~0.01-0.1 ETH)
   - Non-validator wallets need ~0.1 ETH for donation testing

**You do NOT need to:**
- Re-run `npx hardhat node`
- Deploy anything
- Create new MetaMask accounts

The contract is already deployed and live. Just update the URL and switch networks.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `npm install` fails | Try `npm install --legacy-peer-deps` |
| Tests fail | Run `npm install` from root, then retry |
| `npx hardhat node` says port in use | `lsof -i :8545` then `kill <PID>` shown |
| Deploy says "Missing VALIDATOR" | Create `.env` file — see Step 3A |
| Frontend shows blank page | Check terminal for errors. Try `npm run build` to see compile errors |
| MetaMask shows 0 ETH | Make sure you're on "Hardhat Local" network (chain ID 31337) |
| MetaMask says "Nonce too high" | MetaMask > Settings > Advanced > **Clear Activity Tab Data** |
| Transaction reverts | Go to `/admin` and activate the fund first |
| "Wrong network" banner | Switch MetaMask to the correct network (Hardhat or Sepolia) |
| `npm run dev` says port 3000 in use | `lsof -i :3000` then `kill <PID>`, or use `npm run dev -- -p 3001` |
| Can't push to GitHub | Ask Wayne to add you as collaborator |
| Build fails with BigInt error | Should not happen — `tsconfig.json` already targets ES2020. Don't change it. |

---

## Project Structure (What's Where)

```
disaster-relief-dapp/
├── contracts/
│   └── DisasterRelief.sol          # The smart contract (DO NOT MODIFY unless Aaron says to)
├── test/
│   └── DisasterRelief.test.ts      # Contract tests (23 tests)
├── scripts/
│   └── deploy.ts                   # Deploy script
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx            # Donate page (/)
│   │   │   ├── admin/page.tsx      # Admin dashboard (/admin)
│   │   │   ├── audit/page.tsx      # Audit trail (/audit)
│   │   │   ├── layout.tsx          # Root layout (navbar, fonts, providers)
│   │   │   ├── providers.tsx       # Wagmi + React Query setup
│   │   │   └── globals.css         # Tailwind v4 theme (colors, animations)
│   │   ├── components/
│   │   │   ├── Navbar.tsx          # Navigation + wallet connect
│   │   │   ├── ContractStats.tsx   # Stats display on donate page
│   │   │   ├── DonationForm.tsx    # Donation input + submit
│   │   │   ├── DonationFeed.tsx    # Real-time donation list
│   │   │   ├── AdminGate.tsx       # Validator access control
│   │   │   ├── ProposalCard.tsx    # Proposal display + approve button
│   │   │   ├── AuditTimeline.tsx   # Event timeline with colors
│   │   │   └── ui/                 # Reusable UI primitives
│   │   │       ├── Button.tsx
│   │   │       ├── Card.tsx
│   │   │       ├── Input.tsx
│   │   │       ├── Badge.tsx
│   │   │       └── Skeleton.tsx
│   │   ├── lib/
│   │   │   ├── contract.ts         # ABI, contract address, validators
│   │   │   ├── wagmi.ts            # Blockchain connection config
│   │   │   └── utils.ts            # Helper functions (formatting, etc.)
│   │   ├── types/
│   │   │   └── index.ts            # TypeScript interfaces
│   │   └── contracts/
│   │       ├── DisasterRelief.json # ABI (auto-generated by deploy script)
│   │       └── deployment.json     # Contract address (auto-generated)
│   ├── .env.example                # Environment template
│   └── package.json
├── .env.example                    # Root environment template
├── hardhat.config.ts               # Hardhat configuration
└── package.json                    # Root dependencies
```

---

## Important Rules

1. **Never commit `.env` or `.env.local` files.** They are gitignored for a reason.
2. **Never share your MetaMask seed phrase** with anyone, ever.
3. **Always `git pull origin main` before starting new work** to avoid conflicts.
4. **Always create a feature branch** — never commit directly to `main`.
5. **Run `npm run build` before pushing** to make sure you didn't break anything.
6. **Don't modify `contracts/DisasterRelief.sol`** unless Aaron explicitly asks you to.
7. **Don't modify `hardhat.config.ts`, `wagmi.ts`, `contract.ts`, or `providers.tsx`** — these are core infrastructure files.
