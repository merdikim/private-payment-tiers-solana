import { prisma } from "./prisma.server";
import {
  type CheckoutPayment,
  type CheckoutPaymentInput,
  centsToDollars,
  dollarsToCents,
  dollarsToUsdcBaseUnits,
} from "./payments";

type StoredPayment = Awaited<ReturnType<typeof prisma.payment.findFirst>>;

function toCheckoutPayment(
  payment: NonNullable<StoredPayment>,
): CheckoutPayment {
  return {
    id: payment.id,
    pageSlug: payment.pageSlug,
    tierId: payment.tierId,
    tierName: payment.tierName,
    payerWallet: payment.payerWallet,
    merchantWallet: payment.merchantWallet,
    amountUsd: centsToDollars(payment.amountUsdCents),
    amountUsdcBaseUnits: payment.amountUsdcBaseUnits.toString(),
    token: payment.token,
    network: payment.network,
    signature: payment.signature,
    status: payment.status,
    createdAt: payment.createdAt.toISOString(),
  };
}

export async function listCheckoutPaymentsFromDatabase() {
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return payments.map(toCheckoutPayment);
}

export async function recordCheckoutPaymentInDatabase(
  payment: CheckoutPaymentInput,
) {
  const savedPayment = await prisma.payment.upsert({
    where: { signature: payment.signature },
    create: {
      pageSlug: payment.pageSlug,
      tierId: payment.tierId,
      tierName: payment.tierName,
      payerWallet: payment.payerWallet,
      merchantWallet: payment.merchantWallet,
      amountUsdCents: dollarsToCents(payment.amountUsd),
      amountUsdcBaseUnits: dollarsToUsdcBaseUnits(payment.amountUsd),
      signature: payment.signature,
      status: "confirmed",
    },
    update: {
      status: "confirmed",
    },
  });

  return toCheckoutPayment(savedPayment);
}
