"use client";

import { useState, useEffect } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
  useConnect,
} from "wagmi";
import { parseEther } from "viem";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/contract";
import {
  getEtherscanUrl,
  phpToEth,
  formatPhp,
  PHP_PER_ETH,
} from "@/lib/utils";
import { ShieldCheck, Wallet } from "lucide-react";
import { getUserFriendlyError } from "@/lib/contractErrorMapper";

const QUICK_AMOUNTS = [500, 1000, 5000];

export function DonationForm() {
  const [phpAmount, setPhpAmount] = useState<number | "">("");
  const [quickSelected, setQuickSelected] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const { isConnected } = useAccount();
  const { connect, connectors } = useConnect();

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
      setPhpAmount("");
      setQuickSelected(null);
      setError("");
    }
  }, [isSuccess]);

  function handleQuickSelect(amount: number) {
    setQuickSelected(amount);
    setPhpAmount(amount);
    setError("");
    reset();
  }

  function handleCustomInput(value: string) {
    setQuickSelected(null);
    setError("");
    reset();

    if (value === "") {
      setPhpAmount("");
      return;
    }

    const parsedValue = parseFloat(value);
    if (!isNaN(parsedValue)) {
      setPhpAmount(parsedValue);
    }
  }

  function handleDonate() {
    setError("");
    reset();

    if (!phpAmount || Number(phpAmount) <= 0) {
      setError("Please enter a valid amount greater than zero");
      return;
    }

    const ethValue = phpToEth(Number(phpAmount));

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "donate",
      value: parseEther(ethValue),
    } as any);
  }

  const isPending = isWritePending || isConfirming;
  const displayAmount = phpAmount ? Number(phpAmount) : 0;
  const networkFee = displayAmount > 0 ? 0.05 : 0;
  const totalImpact = displayAmount + networkFee;

  return (
    <div
      className="rounded-[14px] border-4 p-8"
      style={{
        background: "rgba(255, 255, 255, 0.7)",
        borderColor: "#0B4F78",
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.06)",
        backdropFilter: "blur(12px)",
      }}
    >
      <h2 className="text-2xl font-bold leading-8 text-[#0F1724]">
        Make a Contribution
      </h2>
      <p className="mt-2 text-sm leading-5 text-[#6B7280]">
        Secure, instant, and directly routed to validated beneficiary pools.
      </p>

      <p className="mt-8 text-sm font-medium leading-5 text-[#0F1724]">
        Quick Select
      </p>
      <div className="mt-3 grid grid-cols-3 gap-3">
        {QUICK_AMOUNTS.map((amount) => (
          <button
            key={amount}
            className="rounded-[14px] border px-4 py-3 text-sm font-medium leading-[22px] transition-colors"
            style={
              quickSelected === amount
                ? {
                    background: "#0B4F78",
                    borderColor: "#0B4F78",
                    color: "#FFFFFF",
                  }
                : {
                    background: "rgba(255, 255, 255, 0.5)",
                    borderColor: "#E2E8F0",
                    color: "#6B7280",
                  }
            }
            onClick={() => handleQuickSelect(amount)}
          >
            ₱ {amount.toLocaleString()}
          </button>
        ))}
      </div>

      <p className="mt-6 text-sm font-medium leading-5 text-[#0F1724]">
        Custom Amount (PHP)
      </p>
      <div className="mt-3 flex h-[61px] items-center rounded-[14px] border border-[#E2E8F0] bg-[rgba(255,255,255,0.8)] px-4">
        <span className="mr-2 text-lg font-medium leading-7 text-[#6B7280]">₱</span>
        <input
          type="number"
          min="0"
          value={phpAmount}
          onChange={(event) => handleCustomInput(event.target.value)}
          placeholder="0.00"
          disabled={isPending}
          className="w-full bg-transparent text-sm font-medium leading-[22px] text-[#0F1724] outline-none placeholder:text-[#94A3B8]"
        />
      </div>

      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

      <div className="mt-6 rounded-[14px] bg-[#F4F6F8] p-4">
        <div className="flex items-center justify-between text-sm leading-5">
          <span className="text-[#6B7280]">Network Fee (Est.)</span>
          <span className="font-medium text-[#0F1724]">~ ₱ {networkFee.toFixed(2)}</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm leading-5">
          <span className="font-medium text-[#0F1724]">Total Impact</span>
          <span className="font-medium text-[#118C66]">
            {displayAmount > 0 ? formatPhp(totalImpact) : "₱ 0.00"}
          </span>
        </div>
      </div>

      {!mounted || !isConnected ? (
        <button
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-[14px] bg-[#0F1724] px-6 py-4 text-base font-bold leading-[26px] text-white shadow-[0px_12px_24px_rgba(0,0,0,0.08)] transition-opacity hover:opacity-90"
          onClick={() => connect({ connector: connectors[0] })}
        >
          <Wallet size={20} color="#FFFFFF" />
          Connect Wallet to Donate
        </button>
      ) : (
        <button
          className="mt-6 flex w-full items-center justify-center rounded-[14px] bg-[#0B4F78] px-6 py-4 text-base font-bold leading-[26px] text-white shadow-[0px_12px_24px_rgba(0,0,0,0.08)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={handleDonate}
          disabled={isPending || !phpAmount}
        >
          {isWritePending
            ? "Waiting for wallet..."
            : isConfirming
              ? "Confirming..."
              : phpAmount
                ? `Donate ${formatPhp(Number(phpAmount))}`
                : "Donate"}
        </button>
      )}

      {writeError && (
        <p className="mt-3 text-sm text-destructive">
          {getUserFriendlyError(writeError)}
        </p>
      )}

      {isSuccess && txHash && (
        <p className="mt-3 text-sm text-success">
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

      <div className="mt-5 flex items-center justify-center gap-2">
        <ShieldCheck size={16} color="#118C66" />
        <span className="text-xs leading-4 text-[#6B7280]">
          Smart contract secured &amp; independently audited.
        </span>
      </div>

      {displayAmount > 0 && (
        <p className="mt-2 text-center text-xs text-[#94A3B8]">
          ≈ {phpToEth(displayAmount)} ETH (1 ETH = ₱{PHP_PER_ETH.toLocaleString()})
        </p>
      )}
    </div>
  );
}
