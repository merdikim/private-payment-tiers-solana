import { usePrivy } from '@privy-io/react-auth'
import {
  useSignMessage,
  useSignTransaction,
  useWallets,
} from '@privy-io/react-auth/solana'
import { useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import { Transaction, VersionedTransaction } from '@solana/web3.js'
import {
  PAYMENTS_QUERY_KEY,
  recordCheckoutPayment,
} from '@/lib/payments'
import type { SubscriptionPage, Tier } from '@/lib/subscriptionPage'
import {
  SOLANA_RPC_URLS,
  getPaymentErrorMessage,
  sendPrivateUsdcPayment,
} from '@/lib/solanaCheckout'

export type PaymentStatus =
  | 'idle'
  | 'connecting'
  | 'confirming'
  | 'success'
  | 'error'

export type PaymentState = {
  tierId?: string
  status: PaymentStatus
  message?: string
  signature?: string
  error?: string
}

export function useCheckoutPayment(page: SubscriptionPage) {
  const { login, ready } = usePrivy()
  const { ready: solanaWalletsReady, wallets } = useWallets()
  const { signMessage } = useSignMessage()
  const { signTransaction } = useSignTransaction()
  const queryClient = useQueryClient()
  const recordCheckoutPaymentFn = useServerFn(recordCheckoutPayment)
  const [payment, setPayment] = useState<PaymentState>({ status: 'idle' })
  const solanaWallet = wallets.find(
    (wallet) =>
      (wallet.standardWallet as { isPrivyWallet?: boolean }).isPrivyWallet,
  )
  const customerWalletAddress = solanaWallet?.address
  const merchantWalletAddress = page.walletAddress.trim()
  const isCustomerWalletReady = Boolean(
    customerWalletAddress && solanaWalletsReady && solanaWallet,
  )

  const requestSolanaWallet = () => {
    login({
      loginMethods: ['email'],
      walletChainType: 'solana-only',
    })
  }

  const payWithUsdc = async (tier: Tier) => {
    if (!ready) {
      return
    }

    if (!isCustomerWalletReady || !customerWalletAddress || !solanaWallet) {
      setPayment({ tierId: tier.id, status: 'connecting' })
      requestSolanaWallet()
      return
    }

    if (!merchantWalletAddress) {
      setPayment({
        tierId: tier.id,
        status: 'error',
        error: 'This business has not added a Solana wallet yet.',
      })
      return
    }

    try {
      setPayment({
        tierId: tier.id,
        status: 'confirming',
        message: 'Preparing private USDC payment...',
      })

      const { signature } = await sendPrivateUsdcPayment({
        amountUsd: tier.price,
        merchantWalletAddress,
        onProgress: (message) =>
          setPayment({ tierId: tier.id, status: 'confirming', message }),
        payerWalletAddress: customerWalletAddress,
        rpcUrls: SOLANA_RPC_URLS,
        signMessage: async (message) => {
          const result = await signMessage({
            message,
            wallet: solanaWallet,
          })

          return result.signature
        },
        signTransaction: async (transaction) => {
          const serializedTransaction =
            transaction instanceof VersionedTransaction
              ? transaction.serialize()
              : transaction.serialize({
                  requireAllSignatures: false,
                  verifySignatures: false,
                })
          const { signedTransaction } = await signTransaction({
            transaction: serializedTransaction,
            wallet: solanaWallet,
            chain: 'solana:mainnet',
          })

          return (
            transaction instanceof VersionedTransaction
              ? VersionedTransaction.deserialize(signedTransaction)
              : Transaction.from(signedTransaction)
          ) as typeof transaction
        },
      })
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
      })
      await queryClient.invalidateQueries({ queryKey: PAYMENTS_QUERY_KEY })

      setPayment({
        tierId: tier.id,
        status: 'success',
        signature,
      })
    } catch (error) {
      setPayment({
        tierId: tier.id,
        status: 'error',
        error: getPaymentErrorMessage(error),
      })
    }
  }

  return {
    customerWalletAddress,
    isCustomerWalletReady,
    isPrivyReady: ready,
    merchantWalletAddress,
    payWithUsdc,
    payment,
  }
}
