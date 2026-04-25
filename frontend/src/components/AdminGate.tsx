"use client";

import { useAccount, useConnect } from "wagmi";
import { isValidator } from "@/lib/contract";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { truncateAddress } from "@/lib/utils";
import type { ReactNode } from "react";

export function AdminGate({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();

  if (!isConnected) {
    return (
      <Card className="mx-auto max-w-md text-center">
        <h2 className="mb-2 text-xl font-semibold">Validator Dashboard</h2>
        <p className="mb-4 text-muted-foreground">
          Connect your wallet to access the validator dashboard.
        </p>
        <Button onClick={() => connect({ connector: connectors[0] })}>
          Connect Wallet
        </Button>
      </Card>
    );
  }

  if (!isValidator(address)) {
    return (
      <Card className="mx-auto max-w-md text-center">
        <h2 className="mb-2 text-xl font-semibold">Not Authorized</h2>
        <p className="text-muted-foreground">
          Connected as{" "}
          <span className="font-mono">{truncateAddress(address!)}</span>
        </p>
        <p className="mt-2 text-muted-foreground">
          This wallet is not authorized as a validator for this fund.
        </p>
      </Card>
    );
  }

  return <>{children}</>;
}
