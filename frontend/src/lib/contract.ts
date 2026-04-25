import deploymentData from "../contracts/deployment.json";
import abiData from "../contracts/DisasterRelief.json";

export const CONTRACT_ADDRESS = deploymentData.contractAddress as `0x${string}`;
export const CONTRACT_ABI = abiData as readonly unknown[];
export const CHAIN_ID = deploymentData.chainId;

export const VALIDATORS = [
  process.env.NEXT_PUBLIC_VALIDATOR_1,
  process.env.NEXT_PUBLIC_VALIDATOR_2,
  process.env.NEXT_PUBLIC_VALIDATOR_3,
].filter(Boolean) as string[];

export function isValidator(address: string | undefined): boolean {
  if (!address) return false;
  return VALIDATORS.some(
    (v) => v.toLowerCase() === address.toLowerCase()
  );
}
