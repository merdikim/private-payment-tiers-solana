import "@tanstack/react-start/client-only";
import { PrivyProvider, usePrivy } from "@privy-io/react-auth";
import type { ReactNode } from "react";
import { MerchantAuthContext } from "./merchantAuth";
import {
  toSolanaWalletConnectors,
  useWallets,
} from "@privy-io/react-auth/solana";
import { createSolanaRpc, createSolanaRpcSubscriptions } from "@solana/kit";

type PrivyClientProviderProps = {
  appId: string;
  children: ReactNode;
};

const solanaRpcUrl =
  String(import.meta.env.VITE_SOLANA_RPC_URL ?? "")
    .trim()
    .replace(/^['"]|['"]$/g, "") || "https://api.mainnet-beta.solana.com";
const solanaRpcSubscriptionsUrl = solanaRpcUrl
  .replace(/^https:/, "wss:")
  .replace(/^http:/, "ws:");
const solanaWalletConnectors = toSolanaWalletConnectors();

export default function PrivyClientProvider({
  appId,
  children,
}: PrivyClientProviderProps) {
  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ["email", "wallet"],
        appearance: {
          theme: "light",
          accentColor: "#000000",
          logo: undefined,
          walletChainType: "solana-only",
          walletList: ["phantom", "metamask", "backpack", "detected_solana_wallets", "wallet_connect_qr_solana"],
        },
        externalWallets: { solana: { connectors: solanaWalletConnectors } },
        solana: {
          rpcs: {
            "solana:mainnet": {
              rpc: createSolanaRpc(solanaRpcUrl),
              rpcSubscriptions: createSolanaRpcSubscriptions(
                solanaRpcSubscriptionsUrl,
              ),
              blockExplorerUrl: "https://explorer.solana.com",
            },
          },
        },
        embeddedWallets: { solana: { createOnLogin: "users-without-wallets" } },
      }}
    >
      {" "}
      <PrivyMerchantAuthProvider>{children}</PrivyMerchantAuthProvider>{" "}
    </PrivyProvider>
  );
}

function PrivyMerchantAuthProvider({ children }: { children: ReactNode }) {
  const { authenticated, login, logout, ready } = usePrivy();
  const { ready: walletReady, wallets } = useWallets();
  const walletAddress =
    wallets.find(
      (wallet) =>
        (wallet.standardWallet as { isPrivyWallet?: boolean }).isPrivyWallet,
    )?.address ??
    wallets[0]?.address ??
    "";

  return (
    <MerchantAuthContext.Provider
      value={{
        authenticated,
        login: async () => {
          await login();
        },
        logout,
        ready,
        walletAddress,
        walletReady,
      }}
    >
      {children}
    </MerchantAuthContext.Provider>
  );
}
