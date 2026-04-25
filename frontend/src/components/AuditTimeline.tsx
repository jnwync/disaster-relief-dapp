"use client";

import { useState, useEffect, useCallback } from "react";
import { usePublicClient } from "wagmi";
import { CONTRACT_ADDRESS } from "@/lib/contract";
import {
  truncateAddress,
  truncateTxHash,
  formatEth,
  getEtherscanUrl,
} from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { EVENT_COLORS, type AuditEvent } from "@/types";
import { parseAbiItem } from "viem";

const EVENT_ABIS = [
  parseAbiItem("event DonationReceived(address indexed donor, uint256 amount, uint256 timestamp)"),
  parseAbiItem("event BeneficiaryRegistered(address indexed beneficiary, address indexed registeredBy)"),
  parseAbiItem("event ProposalCreated(uint256 indexed proposalId, address indexed recipient, uint256 amount, bytes32 descriptionHash)"),
  parseAbiItem("event ProposalApproved(uint256 indexed proposalId, address indexed approver, uint256 approvalCount)"),
  parseAbiItem("event FundsReleased(uint256 indexed proposalId, address indexed recipient, uint256 amount)"),
  parseAbiItem("event FundStatusChanged(bool isActive, address indexed changedBy)"),
];

const EVENT_NAMES: AuditEvent["type"][] = [
  "DonationReceived",
  "BeneficiaryRegistered",
  "ProposalCreated",
  "ProposalApproved",
  "FundsReleased",
  "FundStatusChanged",
];

export function AuditTimeline() {
  const client = usePublicClient();
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(50);

  const fetchEvents = useCallback(async () => {
    if (!client) return;

    try {
      const allEvents: AuditEvent[] = [];

      for (let i = 0; i < EVENT_ABIS.length; i++) {
        const logs = await client.getLogs({
          address: CONTRACT_ADDRESS,
          event: EVENT_ABIS[i] as any,
          fromBlock: 0n,
          toBlock: "latest",
        });

        for (const log of logs) {
          allEvents.push({
            type: EVENT_NAMES[i],
            blockNumber: Number(log.blockNumber),
            logIndex: Number(log.logIndex),
            transactionHash: log.transactionHash,
            timestamp: 0,
            data: (log as any).args ?? {},
          });
        }
      }

      // Sort newest first
      allEvents.sort((a, b) =>
        b.blockNumber !== a.blockNumber
          ? b.blockNumber - a.blockNumber
          : b.logIndex - a.logIndex
      );

      // Fetch timestamps for unique blocks
      const blockNumbers = [...new Set(allEvents.map((e) => e.blockNumber))];
      const timestamps = new Map<number, number>();

      for (const bn of blockNumbers) {
        try {
          const block = await client.getBlock({ blockNumber: BigInt(bn) });
          timestamps.set(bn, Number(block.timestamp));
        } catch {
          timestamps.set(bn, 0);
        }
      }

      for (const event of allEvents) {
        event.timestamp = timestamps.get(event.blockNumber) ?? 0;
      }

      setEvents(allEvents);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 30000);
    return () => clearInterval(interval);
  }, [fetchEvents]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No activity yet — be the first to donate!
        </p>
        <a href="/" className="mt-2 inline-block text-primary hover:underline">
          Go to Donate page
        </a>
      </div>
    );
  }

  const visible = events.slice(0, visibleCount);

  return (
    <div className="space-y-3">
      {visible.map((event) => (
        <div
          key={`${event.transactionHash}-${event.logIndex}`}
          className="flex items-start gap-3 rounded-lg border border-border p-3 animate-fade-in"
        >
          <div
            className={`mt-0.5 w-1 self-stretch rounded-full ${
              EVENT_COLORS[event.type].split(" ")[0]
            }`}
          />
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${EVENT_COLORS[event.type]}`}
              >
                {event.type}
              </span>
              {event.timestamp > 0 && (
                <span className="text-xs text-muted-foreground">
                  {new Date(event.timestamp * 1000).toLocaleString()}
                </span>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              <EventData event={event} />
            </div>
            <a
              href={getEtherscanUrl(event.transactionHash, "tx")}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-primary hover:underline"
            >
              {truncateTxHash(event.transactionHash)}
            </a>
          </div>
        </div>
      ))}

      {events.length > visibleCount && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => setVisibleCount((c) => c + 50)}
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}

function EventData({ event }: { event: AuditEvent }) {
  const d = event.data;
  switch (event.type) {
    case "DonationReceived":
      return (
        <>
          {truncateAddress(d.donor as string)} donated{" "}
          {formatEth(d.amount as bigint)} ETH
        </>
      );
    case "BeneficiaryRegistered":
      return (
        <>
          {truncateAddress(d.beneficiary as string)} registered by{" "}
          {truncateAddress(d.registeredBy as string)}
        </>
      );
    case "ProposalCreated":
      return (
        <>
          Proposal #{Number(d.proposalId)} — {formatEth(d.amount as bigint)}{" "}
          ETH to {truncateAddress(d.recipient as string)}
        </>
      );
    case "ProposalApproved":
      return (
        <>
          Proposal #{Number(d.proposalId)} approved by{" "}
          {truncateAddress(d.approver as string)} ({Number(d.approvalCount)}
          /2)
        </>
      );
    case "FundsReleased":
      return (
        <>
          {formatEth(d.amount as bigint)} ETH released to{" "}
          {truncateAddress(d.recipient as string)} (Proposal #
          {Number(d.proposalId)})
        </>
      );
    case "FundStatusChanged":
      return (
        <>
          Fund {d.isActive ? "activated" : "deactivated"} by{" "}
          {truncateAddress(d.changedBy as string)}
        </>
      );
    default:
      return null;
  }
}
