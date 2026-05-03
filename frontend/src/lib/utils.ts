import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatEther } from "ethers";

export const PHP_PER_ETH = 100_000;

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

export function phpToEth(php: number): string {
  return (php / PHP_PER_ETH).toFixed(8);
}

export function ethToPhp(eth: bigint): number {
  return parseFloat(formatEther(eth)) * PHP_PER_ETH;
}

export function formatPhp(value: number): string {
  return `\u20b1 ${value.toLocaleString("en-PH")}`;
}

export function getTimeAgo(timestamp: number): string {
  const seconds = Math.max(0, Math.floor(Date.now() / 1000) - timestamp);

  if (seconds < 60) {
    return `${seconds}s ago`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export function getEtherscanUrl(
  value: string,
  type: "tx" | "address"
): string {
  return `https://sepolia.etherscan.io/${type}/${value}`;
}
