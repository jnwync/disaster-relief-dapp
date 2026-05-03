import { Heart, ShieldCheck, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const STEPS: {
  description: string;
  icon: LucideIcon;
  step: string;
  title: string;
}[] = [
  {
    description:
      "Link your Web3 wallet securely. We support major providers for seamless transactions.",
    icon: Wallet,
    step: "Step 01",
    title: "Connect Wallet",
  },
  {
    description:
      "Select your donation amount in PHP (converted to stablecoins automatically).",
    icon: Heart,
    step: "Step 02",
    title: "Choose Amount",
  },
  {
    description:
      "Your transaction is recorded on the public ledger, visible to everyone forever.",
    icon: ShieldCheck,
    step: "Step 03",
    title: "Track Permanently",
  },
];

export function HowItWorks() {
  return (
    <section className="px-24 py-16">
      <div className="mb-12 text-center">
        <h2 className="text-[30px] font-bold leading-9 text-[#0B4F78]">
          How It Works
        </h2>
        <p className="mt-4 text-base leading-6 text-[#6B7280]">
          A seamless, transparent process from your wallet directly to those who need
          it.
        </p>
      </div>

      <div className="relative grid gap-8 xl:grid-cols-3">
        <div className="pointer-events-none absolute left-[30%] right-[30%] top-8 hidden border-t border-dashed border-[rgba(11,79,120,0.3)] xl:block" />

        {STEPS.map(({ description, icon: Icon, step, title }) => (
          <div
            key={step}
            className="flex flex-col items-center rounded-[14px] border px-10 py-8 text-center"
            style={{
              background: "rgba(255, 255, 255, 0.7)",
              borderColor: "rgba(255, 255, 255, 0.5)",
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.06)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0B4F78] shadow-[0px_8px_16px_rgba(11,79,120,0.2)]">
              <Icon size={32} color="#FFFFFF" />
            </div>
            <p className="mt-6 text-sm font-bold uppercase tracking-[1.4px] text-[rgba(11,79,120,0.5)]">
              {step}
            </p>
            <h3 className="mt-2 text-[20px] font-bold leading-7 text-[#0F1724]">
              {title}
            </h3>
            <p className="mt-3 text-base leading-[26px] text-[#6B7280]">
              {description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
