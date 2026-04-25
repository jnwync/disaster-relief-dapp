"use client";

import { useState, useEffect } from "react";
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther, keccak256, encodePacked } from "viem";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/contract";
import { AdminGate } from "@/components/AdminGate";
import { ProposalCard } from "@/components/ProposalCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

function AdminDashboard() {
  // --- Fund Status ---
  const { data: active } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "isActive",
    query: { refetchInterval: 10000 },
  });

  const {
    writeContract: toggleActive,
    data: toggleHash,
    isPending: togglePending,
  } = useWriteContract();

  const { isLoading: toggleConfirming } = useWaitForTransactionReceipt({
    hash: toggleHash,
  });

  // --- Register Beneficiary ---
  const [beneficiaryAddr, setBeneficiaryAddr] = useState("");
  const {
    writeContract: registerBeneficiary,
    data: regHash,
    isPending: regPending,
    error: regError,
    reset: regReset,
  } = useWriteContract();

  const { isLoading: regConfirming, isSuccess: regSuccess } =
    useWaitForTransactionReceipt({ hash: regHash });

  useEffect(() => {
    if (regSuccess) setBeneficiaryAddr("");
  }, [regSuccess]);

  // --- Propose Disbursement ---
  const [recipient, setRecipient] = useState("");
  const [propAmount, setPropAmount] = useState("");
  const [description, setDescription] = useState("");

  const descHash =
    description.length > 0
      ? keccak256(encodePacked(["string"], [description]))
      : "";

  const {
    writeContract: propose,
    data: propHash,
    isPending: propPending,
    error: propError,
    reset: propReset,
  } = useWriteContract();

  const { isLoading: propConfirming, isSuccess: propSuccess } =
    useWaitForTransactionReceipt({ hash: propHash });

  useEffect(() => {
    if (propSuccess) {
      setRecipient("");
      setPropAmount("");
      setDescription("");
    }
  }, [propSuccess]);

  // --- Proposal List ---
  const { data: proposalCount } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "proposalCount",
    query: { refetchInterval: 10000 },
  });

  const count = Number(proposalCount ?? 0);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">
        Validator Dashboard
      </h1>

      {/* Fund Status */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">Fund Status</h2>
            <Badge variant={active ? "success" : "destructive"}>
              {active ? "Active" : "Inactive"}
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={togglePending || toggleConfirming}
            onClick={() => {
              toggleActive({
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: "setActive",
                args: [!active],
              } as any);
            }}
          >
            {togglePending || toggleConfirming
              ? "Confirming..."
              : active
                ? "Deactivate"
                : "Activate"}
          </Button>
        </div>
      </Card>

      {/* Register Beneficiary */}
      <Card>
        <h2 className="mb-4 text-lg font-semibold">Register Beneficiary</h2>
        <div className="flex gap-2">
          <Input
            placeholder="Beneficiary address (0x...)"
            value={beneficiaryAddr}
            onChange={(e) => setBeneficiaryAddr(e.target.value)}
            disabled={regPending || regConfirming}
          />
          <Button
            disabled={regPending || regConfirming || !beneficiaryAddr}
            onClick={() => {
              regReset();
              registerBeneficiary({
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: "registerBeneficiary",
                args: [beneficiaryAddr as `0x${string}`],
              } as any);
            }}
          >
            {regPending || regConfirming ? "Confirming..." : "Register"}
          </Button>
        </div>
        {regError && (
          <p className="mt-2 text-sm text-destructive">
            {regError.message.includes("already registered")
              ? "This address is already registered."
              : "Registration failed."}
          </p>
        )}
        {regSuccess && (
          <p className="mt-2 text-sm text-success">
            Beneficiary registered successfully!
          </p>
        )}
      </Card>

      {/* Propose Disbursement */}
      <Card>
        <h2 className="mb-4 text-lg font-semibold">Create Proposal</h2>
        <div className="space-y-3">
          <Input
            placeholder="Recipient address (0x...)"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            disabled={propPending || propConfirming}
          />
          <Input
            placeholder="Amount in ETH"
            type="text"
            inputMode="decimal"
            value={propAmount}
            onChange={(e) => setPropAmount(e.target.value)}
            disabled={propPending || propConfirming}
          />
          <textarea
            className="flex w-full rounded-md border border-border bg-surface px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            placeholder="Description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={propPending || propConfirming}
          />
          {descHash && (
            <p className="font-mono text-xs text-muted-foreground break-all">
              Description hash: {descHash}
            </p>
          )}
          <Button
            disabled={
              propPending ||
              propConfirming ||
              !recipient ||
              !propAmount ||
              !description
            }
            onClick={() => {
              propReset();
              propose({
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: "proposeDisbursement",
                args: [
                  recipient as `0x${string}`,
                  parseEther(propAmount),
                  description,
                ],
              } as any);
            }}
          >
            {propPending || propConfirming ? "Confirming..." : "Submit Proposal"}
          </Button>
          {propError && (
            <p className="text-sm text-destructive">
              {propError.message.includes("not a registered beneficiary")
                ? "Recipient must be a registered beneficiary."
                : propError.message.includes("insufficient")
                  ? "Amount exceeds available balance."
                  : "Proposal failed."}
            </p>
          )}
          {propSuccess && (
            <p className="text-sm text-success">Proposal created!</p>
          )}
        </div>
      </Card>

      {/* Proposal List */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Proposals</h2>
        {count === 0 ? (
          <p className="text-muted-foreground">No proposals yet.</p>
        ) : (
          <div className="space-y-4">
            {Array.from({ length: count }, (_, i) => count - i).map((id) => (
              <ProposalCard key={id} proposalId={id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AdminGate>
      <AdminDashboard />
    </AdminGate>
  );
}
