"use client";

import { ContractStats } from "@/components/ContractStats";
import { DonationForm } from "@/components/DonationForm";
import { DonationFeed } from "@/components/DonationFeed";

export default function DonatePage() {
  return (
    <div className="space-y-8">
      <ContractStats />
      <DonationForm />
      <DonationFeed />
    </div>
  );
}
