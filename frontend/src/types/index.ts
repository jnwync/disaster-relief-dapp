export interface DonationEvent {
  donor: string;
  amount: bigint;
  timestamp: number;
  transactionHash: string;
  blockNumber: number;
}

export interface Proposal {
  id: number;
  descriptionHash: string;
  recipient: string;
  amount: bigint;
  approvalCount: number;
  executed: boolean;
  exists: boolean;
}

export interface AuditEvent {
  type:
    | "DonationReceived"
    | "BeneficiaryRegistered"
    | "ProposalCreated"
    | "ProposalApproved"
    | "FundsReleased"
    | "FundStatusChanged";
  blockNumber: number;
  logIndex: number;
  transactionHash: string;
  timestamp: number;
  data: Record<string, unknown>;
}

export const EVENT_COLORS: Record<AuditEvent["type"], string> = {
  DonationReceived: "bg-emerald-100 text-emerald-800 border-emerald-300",
  BeneficiaryRegistered: "bg-blue-100 text-blue-800 border-blue-300",
  ProposalCreated: "bg-yellow-100 text-yellow-800 border-yellow-300",
  ProposalApproved: "bg-orange-100 text-orange-800 border-orange-300",
  FundsReleased: "bg-purple-100 text-purple-800 border-purple-300",
  FundStatusChanged: "bg-gray-100 text-gray-800 border-gray-300",
};
