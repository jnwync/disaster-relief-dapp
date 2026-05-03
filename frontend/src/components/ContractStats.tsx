"use client";

import { Activity, Heart, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const STATS: {
  icon: LucideIcon;
  label: string;
  value: string;
  delta: string;
}[] = [
  {
    icon: Heart,
    label: "Total Funds Raised",
    value: "₱ 12,450,000",
    delta: "+1.2M this week",
  },
  {
    icon: Activity,
    label: "Total Disbursed",
    value: "₱ 10,200,000",
    delta: "82% utilization",
  },
  {
    icon: Wallet,
    label: "Number of Donors",
    value: "4,521",
    delta: "+34 today",
  },
];

export function ContractStats() {
  return (
    <div className="grid gap-6 xl:grid-cols-3">
      {STATS.map(({ icon: Icon, label, value, delta }) => (
        <div
          key={label}
          className="flex items-center gap-4 rounded-[14px] border p-6"
          style={{
            background: "rgba(255, 255, 255, 0.7)",
            borderColor: "rgba(255, 255, 255, 0.5)",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.06)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[rgba(11,79,120,0.1)]">
            <Icon size={24} color="#0B4F78" />
          </div>

          <div>
            <p className="text-sm font-medium text-[#6B7280]">{label}</p>
            <p className="text-2xl font-bold leading-8 text-[#0F1724]">{value}</p>
            <p className="text-xs font-medium text-[#118C66]">{delta}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
