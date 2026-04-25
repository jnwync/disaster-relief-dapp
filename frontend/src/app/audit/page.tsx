"use client";

import { AuditTimeline } from "@/components/AuditTimeline";

export default function AuditPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Trail</h1>
        <p className="text-muted-foreground">
          All on-chain activity for this fund, verified and immutable.
        </p>
      </div>
      <AuditTimeline />
    </div>
  );
}
