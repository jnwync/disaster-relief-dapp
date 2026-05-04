"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { usePublicClient } from "wagmi";
import { CONTRACT_ADDRESS } from "@/lib/contract";
import {
  getTimeAgo,
  truncateAddress,
  truncateTxHash,
  formatEth,
  getEtherscanUrl,
} from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import type { AuditEvent } from "@/types";
import { decodeEventLog, parseAbiItem } from "viem";
import {
  ArrowUpRight,
  Banknote,
  ChevronDown,
  Clock3,
  FileText,
  RefreshCw,
  Search,
  ShieldCheck,
  UserPlus,
  ArrowRightLeft,
} from "lucide-react";

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

type PreviewState = "data" | "loading" | "empty" | "error";
type TimeFilter = "all" | "24h" | "7d" | "30d";

const PREVIEW_STATES: PreviewState[] = ["data", "loading", "empty", "error"];

const EVENT_FILTER_OPTIONS = [
  { label: "All Events", value: "all" },
  { label: "Donations", value: "DonationReceived" },
  { label: "Proposals", value: "ProposalCreated" },
  { label: "Approvals", value: "ProposalApproved" },
  { label: "Releases", value: "FundsReleased" },
  { label: "Registrations", value: "BeneficiaryRegistered" },
];

const TIME_FILTER_OPTIONS: { label: string; value: TimeFilter }[] = [
  { label: "All Time", value: "all" },
  { label: "Last 24h", value: "24h" },
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
];

function getEventMeta(type: AuditEvent["type"]) {
  switch (type) {
    case "FundsReleased":
      return {
        accent: "#23A1F6",
        avatarBg: "#DAFEEA",
        badgeBg: "rgba(35, 161, 246, 0.15)",
        badgeBorder: "rgba(35, 161, 246, 0.3)",
        icon: ArrowRightLeft,
        label: "Release",
        markerBg: "rgba(35, 161, 246, 0.15)",
      };
    case "ProposalApproved":
      return {
        accent: "#18CD91",
        avatarBg: "#F7E8F8",
        badgeBg: "rgba(24, 205, 145, 0.15)",
        badgeBorder: "rgba(24, 205, 145, 0.3)",
        icon: ShieldCheck,
        label: "Approval",
        markerBg: "rgba(24, 205, 145, 0.15)",
      };
    case "DonationReceived":
      return {
        accent: "#26D962",
        avatarBg: "#F2FBDE",
        badgeBg: "#FFFFFF",
        badgeBorder: "#F3F5F6",
        icon: Banknote,
        label: "Donation",
        markerBg: "rgba(38, 217, 98, 0.15)",
      };
    case "ProposalCreated":
      return {
        accent: "#F4C025",
        avatarBg: "#DAFEEA",
        badgeBg: "#FFFFFF",
        badgeBorder: "#F3F5F6",
        icon: FileText,
        label: "Proposal",
        markerBg: "rgba(244, 192, 37, 0.15)",
      };
    case "BeneficiaryRegistered":
      return {
        accent: "#54A6F8",
        avatarBg: "#F8E2FD",
        badgeBg: "#FFFFFF",
        badgeBorder: "#F3F5F6",
        icon: UserPlus,
        label: "Registration",
        markerBg: "rgba(84, 166, 248, 0.15)",
      };
    case "FundStatusChanged":
      return {
        accent: "#161A1D",
        avatarBg: "#F3F5F6",
        badgeBg: "#FFFFFF",
        badgeBorder: "#F3F5F6",
        icon: ShieldCheck,
        label: "Status",
        markerBg: "rgba(22, 26, 29, 0.12)",
      };
  }
}

function getEventSummary(event: AuditEvent) {
  const { data } = event;

  switch (event.type) {
    case "FundsReleased":
      return {
        amount: `${formatEth(data.amount as bigint)} ETH`,
        description: `Funds released to ${truncateAddress(data.recipient as string)} for approved proposal #${Number(data.proposalId)}.`,
        source: truncateAddress(data.recipient as string),
      };
    case "ProposalApproved":
      return {
        description: `Validator approved proposal #${Number(data.proposalId)} with ${Number(data.approvalCount)}/2 confirmations.`,
        source: truncateAddress(data.approver as string),
      };
    case "DonationReceived":
      return {
        amount: `${formatEth(data.amount as bigint)} ETH`,
        description: "Public donation received and recorded on the ChainRelief ledger.",
        source: truncateAddress(data.donor as string),
      };
    case "ProposalCreated":
      return {
        description: `New proposal created for ${formatEth(data.amount as bigint)} ETH to ${truncateAddress(data.recipient as string)}.`,
        source: truncateAddress(data.recipient as string),
      };
    case "BeneficiaryRegistered":
      return {
        description: `New beneficiary registered and approved for receiving relief support.`,
        source: truncateAddress(data.registeredBy as string),
      };
    case "FundStatusChanged":
      return {
        description: `Fund status changed to ${data.isActive ? "active" : "inactive"} by authorized administrator.`,
        source: truncateAddress(data.changedBy as string),
      };
  }
}

function matchesTimeFilter(event: AuditEvent, filter: TimeFilter) {
  if (filter === "all" || event.timestamp === 0) {
    return true;
  }

  const now = Math.floor(Date.now() / 1000);
  const delta = now - event.timestamp;

  if (filter === "24h") {
    return delta <= 24 * 60 * 60;
  }

  if (filter === "7d") {
    return delta <= 7 * 24 * 60 * 60;
  }

  return delta <= 30 * 24 * 60 * 60;
}

function LoadingCard({ alignRight }: { alignRight: boolean }) {
  return (
    <div className={`flex ${alignRight ? "justify-end" : "justify-start"}`}>
      <div className="w-full max-w-[416px] rounded-[14px] border border-[#F3F5F6] bg-white p-6 shadow-[0px_4px_8px_rgba(0,0,0,0.06)]">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="mt-4 h-5 w-24" />
        <Skeleton className="mt-4 h-12 w-full" />
        <Skeleton className="mt-4 h-10 w-40" />
        <Skeleton className="mt-5 h-12 w-full" />
      </div>
    </div>
  );
}

function TimelineCard({
  alignRight,
  event,
}: {
  alignRight: boolean;
  event: AuditEvent;
}) {
  const meta = getEventMeta(event.type);
  const summary = getEventSummary(event);
  const Icon = meta.icon;

  return (
    <div className={`flex ${alignRight ? "justify-end" : "justify-start"}`}>
      <div className="w-full max-w-[416px] rounded-[14px] border border-[#F3F5F6] bg-white p-6 shadow-[0px_4px_8px_rgba(0,0,0,0.06)]">
        <div className="flex items-start justify-between gap-4">
          <div
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1"
            style={{
              background: meta.badgeBg,
              borderColor: meta.badgeBorder,
            }}
          >
            <Icon size={14} color={meta.accent} />
            <span className="text-[12px] font-medium leading-4" style={{ color: meta.accent }}>
              {meta.label}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[12px] font-medium leading-4 text-[#8C96A1]">
            <Clock3 size={12} color="#8C96A1" />
            <span>{event.timestamp > 0 ? getTimeAgo(event.timestamp) : `Block ${event.blockNumber}`}</span>
          </div>
        </div>

        <p className="mt-4 text-[14px] font-medium leading-[23px] text-[#161A1D]">
          {summary.description}
        </p>

        {summary.amount && (
          <div className="mt-4 inline-flex rounded-xl border border-[#F3F5F6] px-3 py-2">
            <span className="text-[18px] font-bold leading-7 text-[#161A1D]">
              {summary.amount}
            </span>
          </div>
        )}

        <div className="mt-5 border-t border-[#F3F5F6] pt-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div
                className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-[#161A1D] shadow-[0px_4px_8px_rgba(0,0,0,0.06)]"
                style={{ background: meta.avatarBg }}
              >
                {summary.source.slice(2, 4).toUpperCase()}
              </div>
              <span className="text-[14px] font-medium leading-5 text-[#8C96A1]">
                {summary.source}
              </span>
            </div>

            <a
              href={getEtherscanUrl(event.transactionHash, "tx")}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F3F5F6] text-[#8C96A1] transition-colors hover:bg-[#e9edf0]"
              aria-label={`View ${truncateTxHash(event.transactionHash)} on explorer`}
            >
              <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuditTimeline() {
  const client = usePublicClient();
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewState, setPreviewState] = useState<PreviewState>("data");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEventType, setSelectedEventType] = useState("all");
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<TimeFilter>("all");
  const [fetchError, setFetchError] = useState("");

  const fetchEvents = useCallback(async () => {
    if (!client) return;

    try {
      setFetchError("");
      const allEvents: AuditEvent[] = [];

      const currentBlock = await client.getBlockNumber();
      const fromBlock = currentBlock > 5000n ? currentBlock - 5000n : 0n;

      const logs = await client.getLogs({
        address: CONTRACT_ADDRESS,
        fromBlock,
        toBlock: "latest",
      });

      for (const log of logs) {
        for (let i = 0; i < EVENT_ABIS.length; i++) {
          try {
            const decoded = decodeEventLog({
              abi: [EVENT_ABIS[i]],
              data: log.data,
              topics: log.topics,
              strict: false,
            });

            allEvents.push({
              type: EVENT_NAMES[i],
              blockNumber: Number(log.blockNumber),
              logIndex: Number(log.logIndex),
              transactionHash: log.transactionHash,
              timestamp: 0,
              data: decoded.args as Record<string, unknown>,
            });
            break;
          } catch {
            continue;
          }
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
      setFetchError("Unable to load on-chain audit data right now.");
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesType =
        selectedEventType === "all" || event.type === selectedEventType;
      const matchesTime = matchesTimeFilter(event, selectedTimeFilter);
      const haystack = `${event.type} ${JSON.stringify(event.data, (_, v) => typeof v === 'bigint' ? v.toString() : v)} ${event.transactionHash}`.toLowerCase();
      const matchesSearch = searchQuery.trim() === "" || haystack.includes(searchQuery.toLowerCase());

      return matchesType && matchesTime && matchesSearch;
    });
  }, [events, searchQuery, selectedEventType, selectedTimeFilter]);

  const timelineEvents =
    previewState === "error"
      ? []
      : previewState === "empty"
        ? []
        : filteredEvents;

  return (
    <div>
      <div
        className="rounded-[14px] border border-[#F3F5F6] bg-[rgba(255,255,255,0.8)] p-4 shadow-[0px_4px_8px_rgba(0,0,0,0.06)]"
        style={{ backdropFilter: "blur(12px)" }}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-[42px] w-[299px] items-center rounded-xl border border-[#DCE0E5] bg-[#F9FAFB] px-3">
            <Search size={16} color="#8C96A1" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search transactions or wallets..."
              className="w-full bg-transparent px-2 text-[14px] leading-[22px] text-[#161A1D] outline-none placeholder:text-[rgba(140,150,161,0.6)]"
            />
          </div>

          <div className="relative flex h-[42px] w-[200px] items-center rounded-xl border border-[#DCE0E5] bg-[#F9FAFB] px-4">
            <FileText size={16} color="#8C96A1" />
            <select
              value={selectedEventType}
              onChange={(event) => setSelectedEventType(event.target.value)}
              className="w-full appearance-none bg-transparent px-2 text-[14px] font-medium leading-5 text-[#161A1D] outline-none"
            >
              {EVENT_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown size={16} color="#8C96A1" />
          </div>

          <div className="relative flex h-[42px] w-[200px] items-center rounded-xl border border-[#DCE0E5] bg-[#F9FAFB] px-4">
            <Clock3 size={16} color="#8C96A1" />
            <select
              value={selectedTimeFilter}
              onChange={(event) => setSelectedTimeFilter(event.target.value as TimeFilter)}
              className="w-full appearance-none bg-transparent px-2 text-[14px] font-medium leading-5 text-[#161A1D] outline-none"
            >
              {TIME_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown size={16} color="#8C96A1" />
          </div>

          <div className="ml-auto flex items-center gap-4">
            <button
              className="inline-flex items-center gap-2 rounded-xl border border-[#DCE0E5] bg-white px-4 py-2 text-sm font-medium text-[#161A1D] transition-colors hover:bg-slate-50"
              onClick={fetchEvents}
            >
              <RefreshCw size={16} />
              Refresh
            </button>

            <div className="flex items-center gap-2 text-[14px] font-medium text-[#8C96A1]">
              <span className="h-2 w-2 rounded-full bg-[#26D962] opacity-75" />
              Live Syncing
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          {PREVIEW_STATES.map((state) => (
            <button
              key={state}
              className="rounded-[10px] px-3 py-1 text-[12px] font-medium leading-5 transition-colors"
              style={
                previewState === state
                  ? {
                      background: "#23A1F6",
                      color: "#FFFFFF",
                      boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.06)",
                    }
                  : {
                      color: "#8C96A1",
                    }
              }
              onClick={() => setPreviewState(state)}
            >
              {state}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mt-10">
        <div className="pointer-events-none absolute bottom-0 left-1/2 top-0 hidden -translate-x-1/2 border-l border-[rgba(243,245,246,0.8)] xl:block" />

        {previewState === "loading" || loading ? (
          <div className="space-y-10 py-10">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="relative grid items-center xl:grid-cols-[1fr_32px_1fr] xl:gap-8">
                <LoadingCard alignRight={index % 2 === 1} />
                <div className="mx-auto hidden h-4 w-4 rounded-full border-[3px] bg-[#F9FAFB] shadow-[0px_4px_8px_rgba(0,0,0,0.06)] xl:block" style={{ borderColor: index % 2 === 0 ? "#23A1F6" : "#18CD91" }} />
                <div className="hidden xl:block" />
              </div>
            ))}
          </div>
        ) : previewState === "error" || fetchError ? (
          <div className="mt-10 rounded-[14px] border border-[#F3F5F6] bg-white p-10 text-center shadow-[0px_4px_8px_rgba(0,0,0,0.06)]">
            <h3 className="text-xl font-semibold text-[#161A1D]">Audit feed unavailable</h3>
            <p className="mt-2 text-sm text-[#8C96A1]">
              {fetchError || "Something went wrong while loading the public ledger."}
            </p>
            <button
              className="mt-6 rounded-xl bg-[#0B4F78] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
              onClick={fetchEvents}
            >
              Retry
            </button>
          </div>
        ) : previewState === "empty" || timelineEvents.length === 0 ? (
          <div className="mt-10 rounded-[14px] border border-[#F3F5F6] bg-white p-10 text-center shadow-[0px_4px_8px_rgba(0,0,0,0.06)]">
            <h3 className="text-xl font-semibold text-[#161A1D]">No matching audit events</h3>
            <p className="mt-2 text-sm text-[#8C96A1]">
              Try adjusting your filters, or head back to the donate page to generate the first on-chain event.
            </p>
            <Link href="/" className="mt-6 inline-flex rounded-xl bg-[#0B4F78] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90">
              Go to Donate page
            </Link>
          </div>
        ) : (
          <div className="space-y-10 py-10">
            {timelineEvents.map((event, index) => {
              const meta = getEventMeta(event.type);

              return (
                <div
                  key={`${event.transactionHash}-${event.logIndex}`}
                  className="relative grid items-center gap-6 xl:grid-cols-[1fr_32px_1fr] xl:gap-8"
                >
                  {index % 2 === 0 ? (
                    <>
                      <TimelineCard alignRight event={event} />
                      <div className="mx-auto hidden h-4 w-4 rounded-full border-[3px] bg-[#F9FAFB] shadow-[0px_4px_8px_rgba(0,0,0,0.06)] xl:block" style={{ borderColor: meta.accent }}>
                        <div className="m-[3px] h-[6px] w-[6px] rounded-full" style={{ background: meta.markerBg }} />
                      </div>
                      <div className="hidden xl:block" />
                    </>
                  ) : (
                    <>
                      <div className="hidden xl:block" />
                      <div className="mx-auto hidden h-4 w-4 rounded-full border-[3px] bg-[#F9FAFB] shadow-[0px_4px_8px_rgba(0,0,0,0.06)] xl:block" style={{ borderColor: meta.accent }}>
                        <div className="m-[3px] h-[6px] w-[6px] rounded-full" style={{ background: meta.markerBg }} />
                      </div>
                      <TimelineCard alignRight={false} event={event} />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
