import Link from "next/link";
import { ArrowRight, CircleCheck } from "lucide-react";

export function TransparencyCTA() {
  return (
    <section className="px-24 py-10">
      <div
        className="relative overflow-hidden rounded-[14px] px-16 py-16"
        style={{
          background: "#0B4F78",
          boxShadow: "0px 25px 50px rgba(0, 0, 0, 0.25)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            background:
              "radial-gradient(70.42% 70.42% at 50% 50%, #FFFFFF 0%, rgba(255, 255, 255, 0) 100%)",
          }}
        />

        <div className="relative flex items-center justify-between gap-8 xl:flex-row xl:items-center">
          <div className="max-w-[541px]">
            <div className="mb-4 flex items-center gap-2">
              <CircleCheck size={20} color="#F29E38" />
              <span className="text-sm font-medium uppercase tracking-[0.7px] text-[#F29E38]">
                100% On-Chain Verification
              </span>
            </div>

            <h2 className="text-[36px] font-bold leading-10 text-white">
              Every transaction is public and permanent.
            </h2>

            <p className="mt-6 text-[18px] leading-7 text-[rgba(255,255,255,0.8)]">
              Don&apos;t just take our word for it. Verify every single donation,
              validation, and disbursement on our public ledger.
            </p>
          </div>

          <Link
            href="/audit"
            className="inline-flex shrink-0 items-center gap-3 rounded-[14px] bg-white px-8 py-4 text-base font-bold leading-[26px] text-[#0B4F78] shadow-[0px_12px_24px_rgba(0,0,0,0.08)] transition-opacity hover:opacity-90"
          >
            View Transparency Audit
            <ArrowRight size={20} color="#0B4F78" />
          </Link>
        </div>
      </div>
    </section>
  );
}
