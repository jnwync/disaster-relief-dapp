"use client";

import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import { CONTRACT_ADDRESS, CONTRACT_ABI, VALIDATORS } from "@/lib/contract";
import { formatEth, truncateAddress, getEtherscanUrl } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface ProposalCardProps {
  proposalId: number;
}

export function ProposalCard({ proposalId }: ProposalCardProps) {
  const { address } = useAccount();

  const { data: proposal } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getProposal",
    args: [BigInt(proposalId)],
    query: { refetchInterval: 10000 },
  });

  const approvalChecks = VALIDATORS.map((v) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useReadContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "hasApproved",
      args: [BigInt(proposalId), v as `0x${string}`],
      query: { refetchInterval: 10000 },
    })
  );

  const {
    writeContract,
    data: txHash,
    isPending: isWritePending,
    error: writeError,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash: txHash });

  if (!proposal) return null;

  const [, recipient, amount, approvalCount, executed, exists] =
    proposal as [string, string, bigint, bigint, boolean, boolean];

  if (!exists) return null;

  const hasCurrentValidatorApproved =
    address &&
    approvalChecks[
      VALIDATORS.findIndex(
        (v) => v.toLowerCase() === address!.toLowerCase()
      )
    ]?.data === true;

  const isPending = isWritePending || isConfirming;

  function handleApprove() {
    reset();
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "approveDisbursement",
      args: [BigInt(proposalId)],
    } as any);
  }

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-semibold">Proposal #{proposalId}</span>
        <Badge variant={executed ? "success" : "warning"}>
          {executed ? "Executed" : `${Number(approvalCount)}/2 Approvals`}
        </Badge>
      </div>

      <div className="space-y-1 text-sm">
        <p>
          <span className="text-muted-foreground">Recipient: </span>
          <span className="font-mono">{truncateAddress(recipient)}</span>
        </p>
        <p>
          <span className="text-muted-foreground">Amount: </span>
          <span className="font-semibold">{formatEth(amount)} ETH</span>
        </p>
      </div>

      <div className="flex gap-2 text-xs">
        {VALIDATORS.map((v, i) => (
          <span
            key={v}
            className={`rounded px-2 py-1 ${
              approvalChecks[i]?.data
                ? "bg-emerald-100 text-emerald-800"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            V{i + 1}: {approvalChecks[i]?.data ? "Approved" : "Pending"}
          </span>
        ))}
      </div>

      {!executed && (
        <div>
          {hasCurrentValidatorApproved ? (
            <Button variant="outline" size="sm" disabled>
              Already Approved
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleApprove}
              disabled={isPending}
            >
              {isWritePending
                ? "Waiting for wallet..."
                : isConfirming
                  ? "Confirming..."
                  : "Approve"}
            </Button>
          )}
        </div>
      )}

      {writeError && (
        <p className="text-sm text-destructive">
          {writeError.message.includes("User rejected")
            ? "Transaction cancelled."
            : "Approval failed. Please try again."}
        </p>
      )}

      {isSuccess && txHash && (
        <p className="text-sm text-success">
          Approved!{" "}
          <a
            href={getEtherscanUrl(txHash, "tx")}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            View on Etherscan
          </a>
        </p>
      )}
    </Card>
  );
}
