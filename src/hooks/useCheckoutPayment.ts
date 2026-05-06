import { usePrivy } from '@privy-io/react-auth'
import {
  useSignAndSendTransaction,
  useWallets,
} from '@privy-io/react-auth/solana'
import { useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import bs58 from 'bs58'
import { useState } from 'react'
import {
  PAYMENTS_QUERY_KEY,
  recordCheckoutPayment,
} from '@/lib/payments'
import type { SubscriptionPage, Tier } from '@/lib/subscriptionPage'
import {
  SOLANA_RPC_URLS,
  createUsdcTransferTransaction,
  getPaymentErrorMessage,
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
  signature?: string
  error?: string
}

export function useCheckoutPayment(page: SubscriptionPage) {
  const { login, ready } = usePrivy()
  const { ready: solanaWalletsReady, wallets } = useWallets()
  const { signAndSendTransaction } = useSignAndSendTransaction()
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
      setPayment({ tierId: tier.id, status: 'confirming' })

      const { blockhash, connection, lastValidBlockHeight, transaction } =
        await createUsdcTransferTransaction({
          amountUsd: tier.price,
          merchantWalletAddress,
          payerWalletAddress: customerWalletAddress,
          rpcUrls: SOLANA_RPC_URLS,
        })
      const { signature } = await signAndSendTransaction({
        transaction,
        wallet: solanaWallet,
        chain: 'solana:mainnet',
      })
      const signatureText = bs58.encode(signature)

      await connection.confirmTransaction(
        {
          blockhash,
          lastValidBlockHeight,
          signature: signatureText,
        },
        'confirmed',
      )
      await recordCheckoutPaymentFn({
        data: {
          pageSlug: page.slug,
          tierId: tier.id,
          tierName: tier.name,
          payerWallet: customerWalletAddress,
          merchantWallet: merchantWalletAddress,
          amountUsd: tier.price,
          signature: signatureText,
        },
      })
      await queryClient.invalidateQueries({ queryKey: PAYMENTS_QUERY_KEY })

      setPayment({
        tierId: tier.id,
        status: 'success',
        signature: signatureText,
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
