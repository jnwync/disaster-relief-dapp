import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatEther } from "ethers";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatEth(value: bigint): string {
  const formatted = formatEther(value);
  const num = parseFloat(formatted);
  return num.toFixed(4);
}

export function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function truncateTxHash(hash: string): string {
  return `${hash.slice(0, 10)}...${hash.slice(-4)}`;
}

export function getEtherscanUrl(
  value: string,
  type: "tx" | "address"
): string {
  return `https://sepolia.etherscan.io/${type}/${value}`;
}
