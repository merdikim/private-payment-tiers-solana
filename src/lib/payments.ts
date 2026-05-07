import { createServerFn } from "@tanstack/react-start";

export type CheckoutPaymentInput = {
  pageSlug: string;
  tierId: string;
  tierName: string;
  payerWallet: string;
  merchantWallet: string;
  amountUsd: number;
  signature: string;
};

export type CheckoutPayment = {
  id: string;
  pageSlug: string;
  tierId: string;
  tierName: string;
  payerWallet: string;
  merchantWallet: string;
  amountUsd: number;
  amountUsdcBaseUnits: string;
  token: string;
  network: string;
  signature: string;
  status: string;
  createdAt: string;
};

export const PAYMENTS_QUERY_KEY = ["checkout-payments"];
export function checkoutPaymentsQueryKey(merchantWallet?: string) {
  return [...PAYMENTS_QUERY_KEY, merchantWallet?.trim() ?? ""];
}
const USDC_BASE_UNITS = 1_000_000;

export function dollarsToCents(amountUsd: number) {
  return Math.round(amountUsd * 100);
}

export function dollarsToUsdcBaseUnits(amountUsd: number) {
  return BigInt(Math.round(amountUsd * USDC_BASE_UNITS));
}

export function centsToDollars(amountUsdCents: number) {
  return amountUsdCents / 100;
}

export function assertPaymentCanBeRecorded(payment: CheckoutPaymentInput) {
  const missingFields = [
    payment.pageSlug.trim() ? "" : "checkout page",
    payment.tierId.trim() ? "" : "tier",
    payment.tierName.trim() ? "" : "tier name",
    payment.payerWallet.trim() ? "" : "payer wallet",
    payment.merchantWallet.trim() ? "" : "merchant wallet",
    payment.signature.trim() ? "" : "transaction signature",
  ].filter(Boolean);

  if (missingFields.length > 0) {
    throw new Error(`Missing ${missingFields.join(", ")}.`);
  }

  if (!Number.isFinite(payment.amountUsd) || payment.amountUsd <= 0) {
    throw new Error("Payment amount must be greater than zero.");
  }
}

export const recordCheckoutPayment = createServerFn({ method: "POST" })
  .inputValidator((data: CheckoutPaymentInput) => data)
  .handler(async ({ data }) => {
    assertPaymentCanBeRecorded(data);

    const { recordCheckoutPaymentInDatabase } =
      await import("./payments.server");

    return recordCheckoutPaymentInDatabase(data);
  });

export const listCheckoutPayments = createServerFn({ method: "GET" })
  .inputValidator((data: { merchantWallet?: string } | undefined) => data ?? {})
  .handler(async ({ data }) => {
    const { listCheckoutPaymentsFromDatabase } =
      await import("./payments.server");

    return listCheckoutPaymentsFromDatabase(data.merchantWallet);
  });
