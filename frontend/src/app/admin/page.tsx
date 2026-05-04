"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2 } from "lucide-react";
import {
  useReadContract,
  useWriteContract,
  useReadContracts,
  usePublicClient,
  useWatchContractEvent,
} from "wagmi";
import { parseEther, formatEther } from "viem";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/contract";
import { useEffect } from "react";

export default function AdminPage() {
  // ----- Global Fund Status -----
  const { data: isActive, refetch: refetchIsActive } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "isActive",
  });

  const { writeContract: writeActive, isPending: isPendingActive } = useWriteContract({
    mutation: {
      onSuccess: () => refetchIsActive()
    }
  });

  const handleToggleFund = () => {
    writeActive({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "setActive",
      args: [!isActive],
    });
  };

  // ----- Register Beneficiary -----
  const [orgName, setOrgName] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [activities, setActivities] = useState("");
  const [beneficiaryAddress, setBeneficiaryAddress] = useState("");

  const { writeContract: writeRegister, isPending: isPendingRegister } = useWriteContract();

  const handleRegisterBeneficiary = () => {
    if (!beneficiaryAddress) return;
    writeRegister({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "registerBeneficiary",
      args: [beneficiaryAddress],
    });
  };

  const publicClient = usePublicClient();
  const [beneficiariesList, setBeneficiariesList] = useState<string[]>([]);

  useEffect(() => {
    const fetchBeneficiaries = async () => {
      if (!publicClient) return;
      try {
        const logs = await publicClient.getContractEvents({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          eventName: "BeneficiaryRegistered",
          fromBlock: 0n,
          toBlock: "latest",
        });
        const addresses = logs.map(
          (log: any) => log.args.beneficiary as string
        );
        setBeneficiariesList([...new Set(addresses)]);
      } catch (err) {
        console.error("Failed to fetch beneficiaries:", err);
      }
    };
    fetchBeneficiaries();
  }, [publicClient]);

  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    eventName: "BeneficiaryRegistered",
    onLogs(logs) {
      const newAddresses = logs.map(
        (log: any) => log.args.beneficiary as string
      );
      setBeneficiariesList((prev) => [
        ...new Set([...prev, ...newAddresses]),
      ]);
    },
  });

  // ----- Create Funding Proposal -----
  const [proposalRecipient, setProposalRecipient] = useState("");
  const [proposalAmount, setProposalAmount] = useState("");
  const [proposalPurpose, setProposalPurpose] = useState("");

  const { writeContract: writeProposal, isPending: isPendingProposal } = useWriteContract();

  const handleSubmitProposal = () => {
    if (!proposalRecipient || !proposalAmount || !proposalPurpose) return;
    writeProposal({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "proposeDisbursement",
      args: [proposalRecipient, parseEther(proposalAmount), proposalPurpose],
    });
  };

  // ----- Pending Approvals -----
  const { data: proposalCount } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "proposalCount",
  });

  const count = Number(proposalCount || 0n);
  const proposalCalls = Array.from({ length: count }, (_, i) => ({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getProposal",
    args: [i + 1],
  }));

  const { data: proposalsData, refetch: refetchProposals } = useReadContracts({
    contracts: proposalCalls,
  });

  const { writeContract: writeApprove, isPending: isPendingApprove } = useWriteContract({
    mutation: {
      onSuccess: () => refetchProposals()
    }
  });

  const handleApprove = (id: number) => {
    writeApprove({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "approveDisbursement",
      args: [id],
    });
  };

  const pendingProposalsList = proposalsData
    ?.map((res, index) => {
      const data = res.result as [string, string, bigint, bigint, boolean, boolean] | undefined;
      if (!data) return null;
      return {
        id: index + 1,
        descriptionHash: data[0],
        recipient: data[1],
        amount: data[2],
        approvalCount: Number(data[3]),
        executed: data[4],
        exists: data[5],
      };
    })
    .filter((p) => p && p.exists && !p.executed) || [];

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Authorization Banner */}
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              <CheckCircle2 className="h-4 w-4 text-green-600 inline mr-2" />
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
                  <Badge variant={isActive ? "default" : "destructive"}>
                    {isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Current status of the relief fund operations. Toggle
                  activation to control fund operations.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleToggleFund}
                  disabled={isPendingActive || isActive === undefined}
                >
                  {isPendingActive ? "Processing..." : isActive ? "Deactivate Fund" : "Activate Fund"}
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
                <Input 
                  placeholder="e.g. Red Cross PH" 
                  className="mb-3"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                />
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Registration / IDN Number
                </label>
                <Input 
                  placeholder="e.g. RCP-2024-001" 
                  className="mb-3"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                />
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Primary Relief Activities
                </label>
                <Input 
                  placeholder="e.g. Medical Aid, Food Distribution" 
                  value={activities}
                  onChange={(e) => setActivities(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Beneficiary Address
                </label>
                <Input
                  placeholder="Beneficiary address (0x...)"
                  className="mb-6"
                  value={beneficiaryAddress}
                  onChange={(e) => setBeneficiaryAddress(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button 
                    className="flex-1"
                    onClick={handleRegisterBeneficiary}
                    disabled={isPendingRegister || !beneficiaryAddress}
                  >
                    {isPendingRegister ? "Registering..." : "Register Beneficiary"}
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Registered Beneficiaries List */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Registered Beneficiaries</h2>
              <Badge variant="outline">{beneficiariesList.length} total</Badge>
            </div>
            {beneficiariesList.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground border rounded-md border-dashed">
                No beneficiaries registered yet.
              </div>
            ) : (
              <div className="space-y-3">
                {beneficiariesList.map((addr) => (
                  <div
                    key={addr}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-md"
                  >
                    <span className="font-mono text-sm break-all">{addr}</span>
                    <Badge variant="outline" className="mt-2 sm:mt-0 w-fit">
                      Eligible
                    </Badge>
                  </div>
                ))}
              </div>
            )}
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
                  <Input 
                    placeholder="Recipient address (0x...)" 
                    value={proposalRecipient}
                    onChange={(e) => setProposalRecipient(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Requested Amount (ETH)
                  </label>
                  <Input 
                    placeholder="0.00" 
                    type="text" 
                    inputMode="decimal" 
                    value={proposalAmount}
                    onChange={(e) => setProposalAmount(e.target.value)}
                  />
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
                    value={proposalPurpose}
                    onChange={(e) => setProposalPurpose(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Button 
              className="w-full mt-6"
              onClick={handleSubmitProposal}
              disabled={isPendingProposal || !proposalRecipient || !proposalAmount || !proposalPurpose}
            >
              {isPendingProposal ? "Submitting..." : "Submit Proposal"}
            </Button>
          </Card>

          {/* Pending Approvals */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Pending Approvals</h2>
              <Badge variant="outline">{pendingProposalsList.length} proposals</Badge>
            </div>
            
            {pendingProposalsList.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">
                  No pending proposals. Create your first proposal above.
                </p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {pendingProposalsList.map((proposal) => (
                  <Card key={proposal!.id} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium">Proposal #{proposal!.id}</h3>
                        <p className="text-sm text-muted-foreground mt-1">Recipient: {proposal!.recipient}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{formatEther(proposal!.amount)} ETH</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Approvals: {proposal!.approvalCount} / 2
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleApprove(proposal!.id)}
                      disabled={isPendingApprove}
                    >
                      {isPendingApprove ? "Approving..." : "Approve Proposal"}
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
