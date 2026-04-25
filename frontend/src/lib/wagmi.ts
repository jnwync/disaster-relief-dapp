import { http, createConfig } from "wagmi";
import { sepolia, hardhat } from "wagmi/chains";
import { injected } from "wagmi/connectors";

const chains = process.env.NEXT_PUBLIC_CHAIN_ID === "31337"
  ? [hardhat] as const
  : [sepolia] as const;

export const config = createConfig({
  chains,
  connectors: [injected()],
  transports: {
    [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL),
    [hardhat.id]: http("http://127.0.0.1:8545"),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
