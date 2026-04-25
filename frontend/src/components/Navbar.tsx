"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { sepolia } from "wagmi/chains";
import { Button } from "@/components/ui/Button";
import { truncateAddress, cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Donate" },
  { href: "/admin", label: "Admin" },
  { href: "/audit", label: "Audit" },
];

export function Navbar() {
  const pathname = usePathname();
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  const isWrongNetwork = isConnected && chainId !== sepolia.id;

  return (
    <>
      <nav className="border-b border-border bg-surface px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-lg font-bold tracking-tight">
              ChainRelief
            </Link>
            <div className="flex gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                {isWrongNetwork && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => switchChain({ chainId: sepolia.id })}
                  >
                    Switch to Sepolia
                  </Button>
                )}
                <span className="font-mono text-sm text-muted-foreground">
                  {truncateAddress(address!)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => disconnect()}
                >
                  Disconnect
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={() => connect({ connector: connectors[0] })}
              >
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </nav>

      {isWrongNetwork && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-center text-sm text-yellow-800">
          You are connected to the wrong network. Please switch to Sepolia.
        </div>
      )}
    </>
  );
}
