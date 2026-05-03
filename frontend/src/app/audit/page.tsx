"use client";

import { AuditTimeline } from "@/components/AuditTimeline";

export default function AuditPage() {
  return (
    <div className="bg-[#F9FAFB] pb-20">
      <div className="mx-auto w-full max-w-[1440px] px-24 pt-12">
        <div className="flex items-end justify-between gap-8">
          <div className="max-w-[671px]">
            <h1 className="text-[36px] font-bold leading-10 tracking-[-0.9px] text-[#161A1D]">
              Public Audit Ledger
            </h1>
            <p className="mt-2 text-[18px] leading-7 text-[#8C96A1]">
              Every peso accounted for. This public ledger provides a transparent,
              immutable record of all donations, proposals, approvals, and fund
              releases on the ChainRelief network.
            </p>
          </div>

          <div className="rounded-xl border border-[#F3F5F6] bg-[#F3F5F6] p-2">
            <div className="flex items-center gap-3">
              <span className="px-2 text-[12px] font-medium uppercase tracking-[0.6px] text-[#8C96A1]">
                Preview State:
              </span>
              <span className="rounded-[10px] bg-[#23A1F6] px-3 py-1 text-[12px] font-medium leading-5 text-white shadow-[0px_4px_8px_rgba(0,0,0,0.06)]">
                data
              </span>
              <span className="rounded-[10px] px-3 py-1 text-[12px] font-medium leading-5 text-[#8C96A1]">
                loading
              </span>
              <span className="rounded-[10px] px-3 py-1 text-[12px] font-medium leading-5 text-[#8C96A1]">
                empty
              </span>
              <span className="rounded-[10px] px-3 py-1 text-[12px] font-medium leading-5 text-[#8C96A1]">
                error
              </span>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <AuditTimeline />
        </div>
      </div>
    </div>
  );
}
