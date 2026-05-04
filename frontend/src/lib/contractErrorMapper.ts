type ErrorCategory = "validation" | "permission" | "state" | "system";

type ErrorPattern = {
  pattern: RegExp;
  message: string;
  category: ErrorCategory;
};

const ERROR_PATTERNS: ErrorPattern[] = [
  {
    pattern: /user rejected|user denied|rejected request/i,
    message: "Transaction cancelled.",
    category: "validation",
  },
  {
    pattern: /fundnotactive|fund is not active/i,
    message: "Fund is not active.",
    category: "state",
  },
  {
    pattern: /insufficientbalance|insufficient funds|insufficient balance/i,
    message: "You do not have enough balance.",
    category: "validation",
  },
  {
    pattern: /ownable: caller is not the owner/i,
    message: "Only the contract owner can do this.",
    category: "permission",
  },
  {
    pattern: /caller is not a validator/i,
    message: "Only validators can perform this action.",
    category: "permission",
  },
  {
    pattern: /proposal does not exist/i,
    message: "This proposal does not exist.",
    category: "state",
  },
  {
    pattern: /proposal already executed/i,
    message: "This proposal has already been executed.",
    category: "state",
  },
  {
    pattern: /validator already approved/i,
    message: "You already approved this proposal.",
    category: "validation",
  },
  {
    pattern: /recipient is not a registered beneficiary/i,
    message: "Recipient is not a registered beneficiary.",
    category: "validation",
  },
  {
    pattern: /beneficiary already registered/i,
    message: "Beneficiary is already registered.",
    category: "validation",
  },
  {
    pattern: /beneficiary not registered/i,
    message: "Beneficiary is not registered.",
    category: "validation",
  },
  {
    pattern: /amount must be greater than zero|donation must be greater than zero/i,
    message: "Amount must be greater than zero.",
    category: "validation",
  },
  {
    pattern: /insufficient contract balance/i,
    message: "Contract balance is insufficient for this request.",
    category: "state",
  },
  {
    pattern: /eth transfer failed/i,
    message: "Transfer failed. Please try again.",
    category: "system",
  },
  {
    pattern: /invalid beneficiary address/i,
    message: "Beneficiary address is invalid.",
    category: "validation",
  },
  {
    pattern: /invalid validator address/i,
    message: "Validator address is invalid.",
    category: "validation",
  },
  {
    pattern: /duplicate validator/i,
    message: "Validator list contains duplicates.",
    category: "validation",
  },
];

const FALLBACK_MESSAGE = "Something went wrong. Please try again.";
const MAX_NESTED_DEPTH = 3;

function extractRevertReason(message: string): string {
  const patterns = [
    /execution reverted(?: with reason string)?(?::| )\s*['"]?([^'"\n]+)/i,
    /reverted with reason string\s*['"]?([^'"\n]+)/i,
    /custom error\s*['"]?([^'"\n]+)/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return message
    .replace(/^Error:\s*/i, "")
    .replace(/^VM Exception while processing transaction:\s*/i, "")
    .trim();
}

function collectErrorMessages(error: unknown): string[] {
  const messages = new Set<string>();
  const visited = new Set<unknown>();

  const visit = (value: unknown, depth: number) => {
    if (!value || depth > MAX_NESTED_DEPTH || visited.has(value)) {
      return;
    }

    if (typeof value === "string") {
      messages.add(value);
      return;
    }

    if (typeof value !== "object") {
      return;
    }

    visited.add(value);

    const record = value as Record<string, unknown>;
    const data = record.data as Record<string, unknown> | undefined;

    const candidates: unknown[] = [
      record.shortMessage,
      record.reason,
      record.message,
      record.details,
      record.errorName,
      data?.message,
      data?.reason,
      data?.errorName,
    ];

    for (const candidate of candidates) {
      if (typeof candidate === "string") {
        messages.add(candidate);
      }
    }

    if (Array.isArray(record.metaMessages)) {
      for (const metaMessage of record.metaMessages) {
        if (typeof metaMessage === "string") {
          messages.add(metaMessage);
        }
      }
    }

    visit(record.cause, depth + 1);
    visit(record.error, depth + 1);
  };

  visit(error, 0);

  return Array.from(messages);
}

export function getUserFriendlyError(error: unknown): string {
  const messages = collectErrorMessages(error);

  for (const message of messages) {
    const candidates = [extractRevertReason(message), message];

    for (const candidate of candidates) {
      for (const { pattern, message: friendlyMessage } of ERROR_PATTERNS) {
        if (pattern.test(candidate)) {
          return friendlyMessage;
        }
      }
    }
  }

  if (process.env.NODE_ENV !== "production" && messages.length > 0) {
    console.warn("Unmapped contract error:", { messages, error });
  }

  return FALLBACK_MESSAGE;
}
