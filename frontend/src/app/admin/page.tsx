"use client";

import { useCallback, useEffect, useState } from "react";
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
import { parseEther, formatEther, parseAbiItem } from "viem";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/contract";
import { truncateAddress } from "@/lib/utils";

const BENEFICIARY_REGISTERED_EVENT = parseAbiItem(
  "event BeneficiaryRegistered(address indexed beneficiary, address indexed registeredBy)"
);
const BENEFICIARY_REMOVED_EVENT = parseAbiItem(
  "event BeneficiaryRemoved(address indexed beneficiary, address indexed removedBy)"
);

export default function AdminPage() {
  const publicClient = usePublicClient();
  const [registeredBeneficiaries, setRegisteredBeneficiaries] = useState<string[]>([]);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState("");
  const [isLoadingBeneficiaries, setIsLoadingBeneficiaries] = useState(false);
  const [beneficiaryError, setBeneficiaryError] = useState("");

  const fetchBeneficiaries = useCallback(async () => {
    if (!publicClient) return;

    setIsLoadingBeneficiaries(true);
    setBeneficiaryError("");

    try {
      const [registeredLogs, removedLogs] = await Promise.all([
        publicClient.getLogs({
          address: CONTRACT_ADDRESS,
          event: BENEFICIARY_REGISTERED_EVENT,
          fromBlock: 0n,
          toBlock: "latest",
        }),
        publicClient.getLogs({
          address: CONTRACT_ADDRESS,
          event: BENEFICIARY_REMOVED_EVENT,
          fromBlock: 0n,
          toBlock: "latest",
        }),
      ]);

      const activeBeneficiaries = new Set<string>();

      for (const log of registeredLogs) {
        const beneficiary = (log.args as { beneficiary?: string }).beneficiary;
        if (beneficiary) {
          activeBeneficiaries.add(beneficiary);
        }
      }

      for (const log of removedLogs) {
        const beneficiary = (log.args as { beneficiary?: string }).beneficiary;
        if (beneficiary) {
          activeBeneficiaries.delete(beneficiary);
        }
      }

      const list = Array.from(activeBeneficiaries).sort((a, b) =>
        a.localeCompare(b)
      );

      setRegisteredBeneficiaries(list);

      if (list.length === 0) {
        setSelectedBeneficiary("");
      } else if (!list.includes(selectedBeneficiary)) {
        setSelectedBeneficiary(list[0]);
      }
    } catch (error) {
      console.error("Failed to load beneficiaries:", error);
      setBeneficiaryError("Unable to load beneficiaries right now.");
    } finally {
      setIsLoadingBeneficiaries(false);
    }
  }, [publicClient, selectedBeneficiary]);

  useEffect(() => {
    fetchBeneficiaries();
  }, [fetchBeneficiaries]);

  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    eventName: "BeneficiaryRegistered",
    onLogs: () => fetchBeneficiaries(),
  });

  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    eventName: "BeneficiaryRemoved",
    onLogs: () => fetchBeneficiaries(),
  });

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
  const { writeContract: writeRemove, isPending: isPendingRemove } = useWriteContract();

  const handleRegisterBeneficiary = () => {
    if (!beneficiaryAddress) return;
    writeRegister({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "registerBeneficiary",
      args: [beneficiaryAddress],
    });
  };

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

  const handleRemoveBeneficiary = () => {
    if (!selectedBeneficiary) return;
    writeRemove({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "removeBeneficiary",
      args: [selectedBeneficiary],
    });
  };

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

          {/* Remove Beneficiary */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Remove Beneficiary</h2>
              <Badge variant="outline">
                {registeredBeneficiaries.length} active
              </Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Select a registered beneficiary to remove from the allowlist.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_200px]">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Registered Beneficiary
                </label>
                <select
                  className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedBeneficiary}
                  onChange={(event) => setSelectedBeneficiary(event.target.value)}
                  disabled={isLoadingBeneficiaries || registeredBeneficiaries.length === 0}
                >
                  <option value="" disabled>
                    {isLoadingBeneficiaries ? "Loading beneficiaries..." : "Select a beneficiary"}
                  </option>
                  {registeredBeneficiaries.map((beneficiary) => (
                    <option key={beneficiary} value={beneficiary}>
                      {truncateAddress(beneficiary)}
                    </option>
                  ))}
                </select>
                {selectedBeneficiary && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Selected: {selectedBeneficiary}
                  </p>
                )}
                {beneficiaryError && (
                  <p className="mt-2 text-sm text-destructive">
                    {beneficiaryError}
                  </p>
                )}
                {!isLoadingBeneficiaries &&
                  !beneficiaryError &&
                  registeredBeneficiaries.length === 0 && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      No registered beneficiaries found.
                    </p>
                  )}
              </div>
              <div className="flex items-end">
                <Button
                  className="w-full"
                  onClick={handleRemoveBeneficiary}
                  disabled={
                    isPendingRemove ||
                    !selectedBeneficiary ||
                    isLoadingBeneficiaries
                  }
                >
                  {isPendingRemove ? "Removing..." : "Remove Beneficiary"}
                </Button>
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
