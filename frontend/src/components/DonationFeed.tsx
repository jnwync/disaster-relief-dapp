"use client";

import { useState } from "react";
import { useWatchContractEvent } from "wagmi";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/contract";
import { formatEth, truncateAddress, getEtherscanUrl } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import type { DonationEvent } from "@/types";

export function DonationFeed() {
  const [donations, setDonations] = useState<DonationEvent[]>([]);

  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    eventName: "DonationReceived",
    onLogs(logs) {
      const newDonations = logs.map((log) => {
        const args = (log as unknown as { args: Record<string, unknown> }).args;
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
    <Card>
      <h2 className="mb-4 text-xl font-semibold">Recent Donations</h2>
      {donations.length === 0 ? (
        <p className="text-muted-foreground">
          No donations yet. Be the first!
        </p>
      ) : (
        <div className="space-y-2">
          {donations.map((d, i) => (
            <div
              key={`${d.transactionHash}-${i}`}
              className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm animate-fade-in"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-muted-foreground">
                  {truncateAddress(d.donor)}
                </span>
                <span className="font-semibold">
                  {formatEth(d.amount)} ETH
                </span>
              </div>
              <a
                href={getEtherscanUrl(d.transactionHash, "tx")}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                View tx
              </a>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
