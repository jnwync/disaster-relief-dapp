# ChainRelief

ChainRelief is a blockchain-based disaster relief fund where donations are pooled on-chain, disbursements require multi-validator approval, and every transaction is publicly auditable. It is designed to prevent silent fund movement by enforcing transparent, rule-based releases through a smart contract.

## Team

- Aaron - Smart contract + Sepolia deployment
- Allan - QA validation + error mapping
- Rhea - UI polish + responsive/a11y + footer
- Chito - Docs + demo script + about page
- Wayne - Frontend lead + env sync + deployment

## Tech Stack

- Solidity 0.8.20, Hardhat, OpenZeppelin
- TypeScript, Next.js 16, React 19
- wagmi + viem, TanStack Query
- Tailwind CSS v4

## Concepts Write-up

- Required course write-up (1-2 pages): [relief-chain.md](relief-chain.md)

## Setup

```bash
npm install
cd frontend
npm install
cd ..
```

## Environment Variables

Create a root .env (do not commit it):

```bash
cp .env.example .env
```

Edit .env with your values:

```bash
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
DEPLOYER_PRIVATE_KEY=0xYOUR_PRIVATE_KEY
VALIDATOR_1=0xYOUR_VALIDATOR_1
VALIDATOR_2=0xYOUR_VALIDATOR_2
VALIDATOR_3=0xYOUR_VALIDATOR_3
```

Create the frontend env file:

```bash
cp frontend/.env.example frontend/.env.local
```

Edit frontend/.env.local with your values:

```bash
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_VALIDATOR_1=0xYOUR_VALIDATOR_1
NEXT_PUBLIC_VALIDATOR_2=0xYOUR_VALIDATOR_2
NEXT_PUBLIC_VALIDATOR_3=0xYOUR_VALIDATOR_3
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
```

## Run Locally

(Optional) Start a local Hardhat node in one terminal:

```bash
npx hardhat node
```

Deploy locally in another terminal:

```bash
npx hardhat run scripts/deploy.ts --network localhost
```

Start the frontend:

```bash
cd frontend
npm run dev
```

## Run Hardhat Tests

```bash
npx hardhat test
```

## Deployment

- Sepolia contract address: TBD
- Etherscan link: TBD
- Live frontend URL: https://disaster-relief-dapp.vercel.app/

Deployment metadata is stored in [frontend/src/contracts/deployment.json](frontend/src/contracts/deployment.json).

## Screenshot

- TODO: Add a screenshot (e.g., docs/screenshots/home.png) and link it here.

## Credits and References

- Hardhat documentation: https://hardhat.org/docs
- OpenZeppelin Contracts documentation: https://docs.openzeppelin.com/contracts
- wagmi documentation: https://wagmi.sh
- viem documentation: https://viem.sh
- Next.js documentation: https://nextjs.org/docs
- Tailwind CSS documentation: https://tailwindcss.com/docs
- AI tools: GitHub Copilot
