"use client";

import { useReadContract } from "wagmi";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/contract";
import { formatEth } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";

export function ContractStats() {
  const { data: disasterName, isLoading: nameLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "disasterName",
  });

  const { data: active, isLoading: activeLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "isActive",
  });

  const { data: totalDonated, isLoading: donatedLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "totalDonated",
    query: { refetchInterval: 12000 },
  });

  const { data: totalDisbursed } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "totalDisbursed",
    query: { refetchInterval: 12000 },
  });

  const { data: balance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getContractBalance",
    query: { refetchInterval: 12000 },
  });

  const { data: donorCount } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getDonorCount",
    query: { refetchInterval: 12000 },
  });

  if (nameLoading || activeLoading || donatedLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Total Donated", value: formatEth(totalDonated as bigint ?? 0n) + " ETH" },
    { label: "Total Disbursed", value: formatEth(totalDisbursed as bigint ?? 0n) + " ETH" },
    { label: "Balance", value: formatEth(balance as bigint ?? 0n) + " ETH" },
    { label: "Donors", value: (donorCount as bigint ?? 0n).toString() },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold tracking-tight">
          {disasterName as string}
        </h1>
        <Badge variant={active ? "success" : "destructive"}>
          {active ? "Active" : "Inactive"}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
