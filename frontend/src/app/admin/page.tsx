"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, InfoIcon } from "lucide-react";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Authorization Banner */}
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
              <strong>Authorized Validator Access</strong> - You have full
              permissions to manage fund operations and approve proposals.
            </AlertDescription>
          </Alert>

          {/* Two Column Layout: Fund Status & Recent Activity */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Global Fund Status */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Global Fund Status</h2>
                  <Badge variant="default">Active</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Current status of the relief fund operations. Toggle
                  activation to control fund operations.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Deactivate Fund
                </Button>
              </div>
            </Card>

            {/* Recent On-Chain Activity */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">
                    Recent On-Chain Activity
                  </h2>
                  <a href="#" className="text-sm text-primary hover:underline">
                    View Full Audit →
                  </a>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-muted-foreground">
                      Protocol Agreement
                    </span>
                    <span className="text-sm font-medium">2024-01-15</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-muted-foreground">
                      Beneficiary Audit
                    </span>
                    <span className="text-sm font-medium">2024-01-10</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Register Beneficiary */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-6">Register Beneficiary</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Organization Name
                </label>
                <Input placeholder="e.g. Red Cross PH" className="mb-3" />
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Registration / IDN Number
                </label>
                <Input placeholder="e.g. RCP-2024-001" className="mb-3" />
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Primary Relief Activities
                </label>
                <Input placeholder="e.g. Medical Aid, Food Distribution" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Beneficiary Address
                </label>
                <Input
                  placeholder="Beneficiary address (0x...)"
                  className="mb-6"
                />
                <div className="flex gap-2">
                  <Button className="flex-1">Register Beneficiary</Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Create Funding Proposal */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-6">
              Create Funding Proposal
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Select Beneficiary
                  </label>
                  <Input placeholder="Recipient address (0x...)" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Requested Amount (USD)
                  </label>
                  <Input placeholder="0.00" type="text" inputMode="decimal" />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Purpose & Justification
                  </label>
                  <Textarea
                    placeholder="Describe the purpose of this funding request..."
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <Button className="w-full mt-6">Submit Proposal</Button>
          </Card>

          {/* Pending Approvals */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Pending Approvals</h2>
              <Badge variant="outline">0 proposals</Badge>
            </div>
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">
                No proposals yet. Create your first proposal above.
              </p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
