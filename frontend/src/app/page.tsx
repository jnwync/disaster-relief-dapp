"use client";

import { ContractStats } from "@/components/ContractStats";
import { DonationForm } from "@/components/DonationForm";
import { DonationFeed } from "@/components/DonationFeed";
import { HeroSection } from "@/components/HeroSection";
import { HowItWorks } from "@/components/HowItWorks";
import { TransparencyCTA } from "@/components/TransparencyCTA";

export default function DonatePage() {
  return (
    <div className="bg-[#f4f6f8] pb-16">
      <HeroSection />

      <div className="mx-auto w-full max-w-[1440px] px-24">
        <section className="py-8">
          <ContractStats />
        </section>

        <section className="pb-8">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_492px]">
            <DonationFeed />
            <DonationForm />
          </div>
        </section>
      </div>

      <div className="mx-auto w-full max-w-[1440px]">
        <HowItWorks />
        <TransparencyCTA />
      </div>
    </div>
  );
}
