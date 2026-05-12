import type { CheckoutPaymentError } from "#/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  CloakError,
  RootNotFoundError,
  ShieldPoolErrors,
  UtxoAlreadySpentError,
  isRootNotFoundError,
  parseError,
} from "@cloak.dev/sdk";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function getShieldPoolErrorMessage(message: string) {
  const codeMatch = message.match(/0x[0-9a-f]+|\b\d{4,5}\b/i);

  if (!codeMatch) {
    return undefined;
  }

  const rawCode = codeMatch[0];
  const code = rawCode.startsWith("0x")
    ? Number.parseInt(rawCode, 16)
    : Number(rawCode);

  if (!Number.isFinite(code)) {
    return undefined;
  }

  return ShieldPoolErrors[code];
}

export function getPaymentErrorDetails(error: unknown): CheckoutPaymentError {
  const message = error instanceof Error ? error.message : String(error);
  const mappedProgramError = getShieldPoolErrorMessage(message);

  if (isRootNotFoundError(error) || error instanceof RootNotFoundError) {
    return {
      category: "transaction",
      title: "Cloak proof expired",
      message:
        "Cloak could not use the proof root before it became stale. Please try the payment again.",
      suggestion:
        "Retrying rebuilds the private proof with a fresh Merkle root.",
      recoverable: true,
    };
  }

  if (error instanceof UtxoAlreadySpentError) {
    return {
      category: "transaction",
      title: "Private balance already spent",
      message:
        "Cloak detected that this private balance was already spent. Refresh your wallet state and try again.",
      suggestion:
        "If this happened after approving a wallet prompt, check whether the transaction already completed.",
      recoverable: true,
    };
  }

  if (mappedProgramError) {
    return {
      category: "transaction",
      title: "Cloak transaction rejected",
      message: mappedProgramError,
      recoverable: false,
    };
  }

  if (message.includes("_bn")) {
    return {
      category: "validation",
      title: "Invalid Solana address",
      message:
        "A Solana address is missing or invalid. Check the receiving wallet and SOLANA_USDC_MINT configuration.",
      recoverable: false,
    };
  }

  if (message.includes("403") || message.toLowerCase().includes("forbidden")) {
    return {
      category: "network",
      title: "Solana RPC rejected the request",
      message:
        "Solana RPC rejected this request. The app tried its public fallbacks; set VITE_SOLANA_RPC_URL to a dedicated browser-accessible mainnet endpoint.",
      recoverable: true,
    };
  }

  if (message.toLowerCase().includes("failed to get recent blockhash")) {
    return {
      category: "network",
      title: "Solana RPC unavailable",
      message:
        "Could not reach a Solana RPC endpoint. Set VITE_SOLANA_RPC_URL to a reliable browser-accessible mainnet RPC.",
      recoverable: true,
    };
  }

  if (message.toLowerCase().includes("insufficient")) {
    return {
      category: "wallet",
      title: "Insufficient balance",
      message:
        "Your wallet does not have enough USDC or SOL to complete this private payment.",
      suggestion:
        "You need enough USDC for the item and a little SOL for fees.",
      recoverable: true,
    };
  }

  if (message.toLowerCase().includes("user rejected")) {
    return {
      category: "wallet",
      title: "Payment cancelled",
      message: "Payment was cancelled in your wallet.",
      recoverable: true,
    };
  }

  if (message.toLowerCase().includes("Deposit amount too small")) {
    return {
      category: "wallet",
      title: "Insufficient balance",
      message:
        "Your wallet does not have enough SOL(minimum 0.01 SOL) to complete this private payment.",
      suggestion:
        "You need enough USDC for the item and a little SOL for fees.",
      recoverable: true,
    };
  }

  if (error instanceof CloakError) {
    const parsed = parseError(error);

    return {
      category: parsed.category,
      title: parsed.title,
      message: parsed.message,
      suggestion: parsed.suggestion,
      recoverable: parsed.recoverable || error.retryable,
    };
  }

  const parsed = parseError(error);

  return {
    category: parsed.category,
    title: parsed.title,
    message: parsed.message || "USDC payment failed.",
    suggestion: parsed.suggestion,
    recoverable: parsed.recoverable,
  };
}
