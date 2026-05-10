import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { PAYMENTS_QUERY_KEY, recordCheckoutPayment } from "@/lib/payments";
import type {
  PaymentStatus,
  PaymentState,
  UsdcBalanceState,
  SubscriptionPage,
  Tier,
} from "@/types";
import {
  SOLANA_RPC_URLS,
  USDC_MINT_ADDRESS,
  sendPrivateUsdcPayment,
} from "@/lib/solanaCheckout";
import { getPaymentErrorDetails } from "#/lib/utils";

export function useCheckoutPayment(page: SubscriptionPage) {
  const { connection } = useConnection();
  const {
    connected,
    connecting,
    disconnect,
    publicKey,
    signMessage,
    signTransaction,
    wallet,
  } = useWallet();
  const { setVisible: setWalletModalVisible } = useWalletModal();
  const queryClient = useQueryClient();
  const recordCheckoutPaymentFn = useServerFn(recordCheckoutPayment);
  const [payment, setPayment] = useState<PaymentState>({ status: "idle" });
  const [usdcBalance, setUsdcBalance] = useState<UsdcBalanceState>({
    status: "idle",
  });
  const customerWalletAddress = publicKey?.toBase58();
  const merchantWalletAddress = page.walletAddress.trim();
  const isCustomerWalletReady = Boolean(
    connected && customerWalletAddress && wallet && signTransaction,
  );

  useEffect(() => {
    if (!connected) {
      setPayment({ status: "idle" });
    }
  }, [connected]);

  useEffect(() => {
    if (!connected || !publicKey) {
      setUsdcBalance({ status: "idle" });
      return;
    }

    let isCurrent = true;

    async function loadUsdcBalance() {
      setUsdcBalance({ status: "loading" });

      try {
        const mint = new PublicKey(USDC_MINT_ADDRESS);
        const tokenAccountAddress = getAssociatedTokenAddressSync(
          mint,
          publicKey!,
        );
        const tokenAccount =
          await connection.getAccountInfo(tokenAccountAddress);

        if (!isCurrent) {
          return;
        }

        if (!tokenAccount) {
          setUsdcBalance({ status: "success", amount: "0" });
          return;
        }

        const balance =
          await connection.getTokenAccountBalance(tokenAccountAddress);

        if (!isCurrent) {
          return;
        }

        setUsdcBalance({
          status: "success",
          amount: balance.value.uiAmountString ?? "0",
        });
      } catch (error) {
        if (!isCurrent) {
          return;
        }

        setUsdcBalance({
          status: "error",
          error:
            error instanceof Error
              ? error.message
              : "Could not load USDC balance.",
        });
      }
    }

    void loadUsdcBalance();

    return () => {
      isCurrent = false;
    };
  }, [connected, connection, publicKey]);

  const requestSolanaWallet = () => {
    setWalletModalVisible(true);
  };

  const payWithUsdc = async (tier: Tier) => {
    if (!isCustomerWalletReady || !customerWalletAddress || !signTransaction) {
      setPayment({ tierId: tier.id, status: "connecting" });
      requestSolanaWallet();
      return;
    }

    if (!merchantWalletAddress) {
      setPayment({
        tierId: tier.id,
        status: "error",
        error: "This business has not added a Solana wallet yet.",
      });
      return;
    }

    try {
      setPayment({
        tierId: tier.id,
        status: "confirming",
        message: "Preparing private USDC payment...",
      });

      const { signature } = await sendPrivateUsdcPayment({
        amountUsd: tier.price,
        merchantWalletAddress,
        onProgress: (message) =>
          setPayment({ tierId: tier.id, status: "confirming", message }),
        payerWalletAddress: customerWalletAddress,
        rpcUrls: SOLANA_RPC_URLS,
        signMessage: async (message) => {
          if (!signMessage) {
            throw new Error("The connected wallet cannot sign messages.");
          }

          return signMessage(message);
        },
        signTransaction,
      });
      await recordCheckoutPaymentFn({
        data: {
          pageSlug: page.slug,
          tierId: tier.id,
          tierName: tier.name,
          payerWallet: customerWalletAddress,
          merchantWallet: merchantWalletAddress,
          amountUsd: tier.price,
          signature,
        },
      });
      await queryClient.invalidateQueries({ queryKey: PAYMENTS_QUERY_KEY });

      setPayment({
        tierId: tier.id,
        status: "success",
        signature,
      });
    } catch (error) {
      console.log(error)
      const paymentError = getPaymentErrorDetails(error);

      setPayment({
        tierId: tier.id,
        status: "error",
        error: paymentError.message,
        errorCategory: paymentError.category,
        errorRecoverable: paymentError.recoverable,
        errorSuggestion: paymentError.suggestion,
        errorTitle: paymentError.title,
      });
    }
  };

  return {
    customerWalletAddress,
    disconnectWallet: disconnect,
    isCustomerWalletReady,
    isWalletConnecting: connecting,
    merchantWalletAddress,
    payWithUsdc,
    payment,
    usdcBalance,
  };
}

// Re-export types for backward compatibility
export type { PaymentStatus, PaymentState, UsdcBalanceState };

