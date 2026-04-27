"use client";

import { useState, useEffect } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import { parseEther } from "viem";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/contract";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { getEtherscanUrl } from "@/lib/utils";

export function DonationForm() {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const { isConnected } = useAccount();

  const {
    writeContract,
    data: txHash,
    isPending: isWritePending,
    error: writeError,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isSuccess) {
      setAmount("");
      setError("");
    }
  }, [isSuccess]);

  function handleDonate() {
    setError("");
    reset();

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Please enter a valid amount greater than zero");
      return;
    }

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "donate",
      value: parseEther(amount),
    } as any);
  }

  const isPending = isWritePending || isConfirming;
  const buttonLabel = isWritePending
    ? "Waiting for wallet..."
    : isConfirming
      ? "Confirming..."
      : "Donate";

  return (
    <Card>
      <h2 className="mb-4 text-xl font-semibold">Make a Donation</h2>

      {!mounted || !isConnected ? (
        <p className="text-muted-foreground">
          Connect your wallet to donate.
        </p>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              type="text"
              inputMode="decimal"
              placeholder="Amount in ETH"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isPending}
              error={error}
            />
            <Button onClick={handleDonate} disabled={isPending || !amount}>
              {buttonLabel}
            </Button>
          </div>

          {writeError && (
            <p className="text-sm text-destructive">
              {writeError.message.includes("User rejected")
                ? "Transaction cancelled."
                : writeError.message.includes("DisasterRelief:")
                  ? writeError.message.split("DisasterRelief: ")[1]
                  : "Something went wrong. Please try again."}
            </p>
          )}

          {isSuccess && txHash && (
            <p className="text-sm text-success">
              Donation successful!{" "}
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
        </div>
      )}
    </Card>
  );
}
