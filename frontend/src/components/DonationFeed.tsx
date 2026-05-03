"use client";

import { useState } from "react";
import Link from "next/link";
import { useWatchContractEvent } from "wagmi";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/contract";
import {
  ethToPhp,
  formatPhp,
  getEtherscanUrl,
  getTimeAgo,
  truncateAddress,
} from "@/lib/utils";
import { Activity, ChevronRight, Clock, ExternalLink } from "lucide-react";
import type { DonationEvent } from "@/types";

function GradientAvatar({ address }: { address: string }) {
  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl text-xs font-bold text-white"
      style={{
        background: "linear-gradient(45deg, #0B4F78 0%, #118C66 100%)",
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.06)",
      }}
    >
      {address.slice(2, 4).toUpperCase()}
    </div>
  );
}

export function DonationFeed() {
  const [donations, setDonations] = useState<DonationEvent[]>([]);

  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    eventName: "DonationReceived",
    onLogs(logs) {
      const newDonations = logs.map((log) => {
        const { args } = log as unknown as { args: Record<string, unknown> };
        return {
          donor: args.donor as string,
          amount: args.amount as bigint,
          timestamp: Number(args.timestamp),
          transactionHash: log.transactionHash as string,
          blockNumber: Number(log.blockNumber),
        };
      });
      setDonations((prev) => [...newDonations, ...prev].slice(0, 20));
    },
  });

  return (
    <div
      className="overflow-hidden rounded-[14px] border"
      style={{
        background: "rgba(255, 255, 255, 0.7)",
        borderColor: "rgba(255, 255, 255, 0.5)",
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.06)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <Activity size={24} color="#0B4F78" />
          <h2 className="text-2xl font-bold leading-8 text-[#0B4F78]">
            Live Donation Feed
          </h2>
        </div>

        <Link
          href="/audit"
          className="flex items-center gap-1 text-sm font-medium leading-[22px] text-[#0B4F78] hover:opacity-80"
        >
          View All on Audit Log
          <ChevronRight size={16} color="#0B4F78" />
        </Link>
      </div>

      <div className="border-y border-[rgba(226,232,240,0.5)] bg-[rgba(255,255,255,0.5)] px-6 py-4 backdrop-blur-[2px]">
        <div className="grid grid-cols-[minmax(0,1fr)_120px_120px] gap-4 text-xs font-medium uppercase tracking-[0.6px] text-[#6B7280]">
          <span>Donor</span>
          <span className="text-right">Amount</span>
          <span className="text-right">Time</span>
        </div>
      </div>

      {donations.length === 0 ? (
        <div className="px-6 py-12 text-sm text-[#6B7280]">
          No donations yet. Be the first!
        </div>
      ) : (
        <div className="max-h-[420px] overflow-y-auto">
          {donations.map((donation, index) => (
            <div
              key={`${donation.transactionHash}-${index}`}
              className="grid grid-cols-[minmax(0,1fr)_120px_120px] gap-4 border-b border-[rgba(226,232,240,0.4)] px-6 py-4 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <GradientAvatar address={donation.donor} />
                <div>
                  <p className="text-sm font-medium leading-5 text-[#0F1724]">
                    {truncateAddress(donation.donor)}
                  </p>
                  <a
                    href={getEtherscanUrl(donation.transactionHash, "tx")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 flex items-center gap-1 text-[10px] leading-4 text-[#0B4F78] opacity-70 hover:opacity-100"
                  >
                    Tx: {donation.transactionHash.slice(0, 6)}...{donation.transactionHash.slice(-4)}
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              <div className="text-right text-base font-medium leading-6 text-[#118C66]">
                {formatPhp(ethToPhp(donation.amount))}
              </div>

              <div className="flex items-center justify-end gap-1 text-right text-xs leading-4 text-[#6B7280]">
                <Clock size={12} color="#6B7280" />
                <span>{getTimeAgo(donation.timestamp)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
