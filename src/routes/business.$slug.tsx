import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import { createFileRoute, notFound } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { PublicCheckout } from "@/components/checkout/PublicCheckout";
import { useCheckoutPayment } from "@/hooks/useCheckoutPayment";
import { SOLANA_RPC_URLS } from "@/lib/solanaCheckout";
import { findSubscriptionPage } from "@/lib/subscriptionPage";

export const Route = createFileRoute("/business/$slug")({
  validateSearch: (search: Record<string, unknown>) => ({
    tier: typeof search.tier === "string" ? search.tier : undefined,
  }),
  loaderDeps: ({ search }) => ({
    tier: search.tier,
  }),
  loader: async ({ deps, params }) => {
    const page = await findSubscriptionPage({
      data: { slug: params.slug, tier: deps.tier },
    });

    if (!page) {
      throw notFound();
    }

    return page;
  },
  head: (page) => ({
    meta: [
      {
        title: `${ page.loaderData?.businessName} chekout | Delta Pay`,
        "aria-description": page.loaderData?.headline
      },
    ]
  }),
  component: PublicPricingPage,
});

function PublicPricingPage() {
  return (
    <CheckoutWalletProvider>
      <PublicPricingCheckout />
    </CheckoutWalletProvider>
  );
}

function CheckoutWalletProvider({ children }: { children: ReactNode }) {
  const endpoint = SOLANA_RPC_URLS[0] ?? "https://api.mainnet-beta.solana.com";

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

function PublicPricingCheckout() {
  const page = Route.useLoaderData();
  const checkoutPayment = useCheckoutPayment(page);

  return <PublicCheckout page={page} {...checkoutPayment} />;
}
