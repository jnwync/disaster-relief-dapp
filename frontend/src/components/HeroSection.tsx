"use client";

import Image from "next/image";

export function HeroSection() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        minHeight: 600,
        background:
          "linear-gradient(180deg, rgba(11, 79, 120, 0.05) 0%, rgba(11, 79, 120, 0) 100%)",
      }}
    >
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="/photos/International help_.jpg"
          alt="International disaster relief support"
          fill
          priority
          className="object-cover opacity-20"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(11, 79, 120, 0.25) 0%, rgba(11, 79, 120, 0.12) 55%, rgba(11, 79, 120, 0.05) 100%)",
          }}
        />
      </div>

      <div
        className="pointer-events-none absolute rounded-full"
        style={{
          width: 800,
          height: 800,
          right: -144,
          top: -534,
          background: "rgba(17, 140, 102, 0.05)",
          filter: "blur(64px)",
        }}
      />

      <div className="relative mx-auto flex max-w-[1440px] flex-col items-center px-24 pb-16 pt-28 text-center">
        <div
          className="mb-10 flex items-center gap-3 rounded-full border px-4 py-2"
          style={{
            background: "rgba(17, 140, 102, 0.1)",
            borderColor: "rgba(17, 140, 102, 0.2)",
          }}
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#118C66] opacity-50" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#118C66]" />
          </span>
          <span className="text-sm font-medium leading-5 text-[#118C66]">
            Fund Status: Active &amp; Accepting Donations
          </span>
        </div>

        <h1 className="max-w-[771px] text-[60px] font-bold leading-[78px] tracking-[-1.5px] text-[#0B4F78]">
          Transparent Disaster Relief.
          <br />
          Every Peso Accounted For.
        </h1>

        <p className="mt-6 max-w-[643px] text-[20px] leading-7 text-[#6B7280]">
          Rebuilding the Philippines with unshakeable trust. Our blockchain-powered
          platform ensures your donations go exactly where they&apos;re needed,
          publicly verifiable by anyone.
        </p>
      </div>
    </section>
  );
}
