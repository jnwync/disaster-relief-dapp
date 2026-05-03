"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { hardhat, sepolia } from "wagmi/chains";
import { Activity, Wallet } from "lucide-react";
import { CHAIN_ID } from "@/lib/contract";
import { truncateAddress, cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Donate" },
  { href: "/audit", label: "Audit" },
  { href: "/admin", label: "Admin" },
];

const TARGET_CHAIN = CHAIN_ID === 31337 ? hardhat : sepolia;

export function Navbar() {
  const pathname = usePathname();
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  const isWrongNetwork = isConnected && chainId !== TARGET_CHAIN.id;
  const networkLabel = TARGET_CHAIN.id === hardhat.id ? "Hardhat" : "Mainnet";

  return (
    <>
      <nav
        className="sticky top-0 z-50 border-b border-[#e2e8f0]"
        style={{
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(6px)",
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.06)",
        }}
      >
        <div className="mx-auto flex h-[81px] w-full max-w-[1440px] items-center justify-between px-24">
          <div className="flex items-center gap-12">
            <Link href="/" className="flex items-center gap-2">
              <Activity size={24} color="#0B4F78" />
              <span className="text-[23px] font-bold leading-9 text-[#0B4F78]">
                ChainRelief
              </span>
            </Link>

            <div className="flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-base font-medium transition-colors",
                    pathname === link.href
                      ? "text-[#0B4F78]"
                      : "text-[#6B7280] hover:text-[#0B4F78]"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-full bg-[#f1f5f9] px-3 py-1.5">
              <Activity size={16} color="#6B7280" />
              <span className="text-sm font-medium text-[#6B7280]">
                {networkLabel}
              </span>
            </div>

            {isConnected ? (
              <>
                {isWrongNetwork && (
                  <button
                    className="rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                    onClick={() => switchChain({ chainId: TARGET_CHAIN.id })}
                  >
                    Switch Network
                  </button>
                )}

                <span className="font-mono text-sm text-muted-foreground">
                  {truncateAddress(address!)}
                </span>

                <button
                  className="rounded-xl border border-[#e2e8f0] bg-white px-4 py-2 text-sm font-medium text-[#0B4F78] hover:bg-slate-50"
                  onClick={() => disconnect()}
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                className="flex items-center gap-2 rounded-xl bg-[#0B4F78] px-5 py-2.5 text-base font-medium text-white shadow-[0px_4px_8px_rgba(0,0,0,0.06)] transition-opacity hover:opacity-90"
                onClick={() => connect({ connector: connectors[0] })}
              >
                <Wallet size={16} color="#FFFFFF" />
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </nav>

      {isWrongNetwork && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-center text-sm text-yellow-800">
          You are connected to the wrong network. Please switch to {networkLabel}.
        </div>
      )}
    </>
  );
}
