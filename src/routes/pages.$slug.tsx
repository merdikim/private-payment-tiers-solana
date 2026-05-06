import { usePrivy } from '@privy-io/react-auth'
import {
  useSignAndSendTransaction,
  useWallets,
} from '@privy-io/react-auth/solana'
import {
  createAssociatedTokenAccountIdempotentInstruction,
  createTransferCheckedInstruction,
  getAssociatedTokenAddress,
} from '@solana/spl-token'
import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute, notFound } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useMemo, useState } from 'react'
import bs58 from 'bs58'
import {
  PAYMENTS_QUERY_KEY,
  dollarsToUsdcBaseUnits,
  recordCheckoutPayment,
} from '../lib/payments'
import { findSubscriptionPage } from '../lib/subscriptionPage'
import { Button } from '@/components/ui/button'

const SOLANA_RPC_URL =
  import.meta.env.VITE_SOLANA_RPC_URL ?? 'https://api.mainnet-beta.solana.com'
const USDC_MINT_ADDRESS =
  import.meta.env.VITE_SOLANA_USDC_MINT ??
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
const USDC_DECIMALS = 6

type PaymentStatus = 'idle' | 'connecting' | 'confirming' | 'success' | 'error'

type PaymentState = {
  tierId?: string
  status: PaymentStatus
  signature?: string
  error?: string
}

export const Route = createFileRoute('/pages/$slug')({
  loader: async ({ params }) => {
    const page = await findSubscriptionPage({ data: { slug: params.slug } })

    if (!page) {
      throw notFound()
    }

    return page
  },
  component: PublicPricingPage,
})

function PublicPricingPage() {
  const { slug } = Route.useParams()
  const page = Route.useLoaderData()
  const { authenticated, linkWallet, login, ready } = usePrivy()
  const { ready: solanaWalletsReady, wallets } = useWallets()
  const { signAndSendTransaction } = useSignAndSendTransaction()
  const queryClient = useQueryClient()
  const recordCheckoutPaymentFn = useServerFn(recordCheckoutPayment)
  const connection = useMemo(() => new Connection(SOLANA_RPC_URL, 'confirmed'), [])
  const [payment, setPayment] = useState<PaymentState>({ status: 'idle' })
  const solanaWallet = wallets[0]
  const customerWalletAddress = solanaWallet?.address
  const merchantWalletAddress = page.walletAddress.trim()

  const requestSolanaWallet = () => {
    const walletOptions = {
      walletChainType: 'solana-only' as const,
      walletList: [
        'detected_solana_wallets' as const,
        'wallet_connect_qr_solana' as const,
      ],
      description: 'Connect a Solana wallet to continue to checkout.',
    }

    if (authenticated) {
      linkWallet(walletOptions)
      return
    }

    login({
      loginMethods: ['wallet'],
      walletChainType: 'solana-only',
    })
  }

  const payWithUsdc = async (tier: (typeof page.tiers)[number]) => {
    if (!ready) {
      return
    }

    if (!customerWalletAddress || !solanaWalletsReady || !solanaWallet) {
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

      const transaction = await createUsdcTransferTransaction({
        amountUsd: tier.price,
        connection,
        merchantWalletAddress,
        payerWalletAddress: customerWalletAddress,
      })
      const { signature } = await signAndSendTransaction({
        transaction,
        wallet: solanaWallet,
        chain: 'solana:mainnet',
      })
      const signatureText = bs58.encode(signature)

      await connection.confirmTransaction(signatureText, 'confirmed')
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
        error: error instanceof Error ? error.message : 'USDC payment failed.',
      })
    }
  }

  const renderPricingTier = (tier: (typeof page.tiers)[number]) => (
    <article
      key={tier.id}
      className="grid gap-3 border-b border-slate-200 bg-white p-3 last:border-b-0 sm:p-4 lg:grid-cols-[1fr_140px_180px] lg:items-center"
    >
      <div className="min-w-0">
        <h2 className="m-0 truncate text-lg font-bold text-slate-950">
          {tier.name}
        </h2>
        {tier.description ? (
          <p className="mb-0 mt-1 line-clamp-2 text-xs leading-5 text-slate-600">
            {tier.description}
          </p>
        ) : null}
      </div>

      <p className="m-0 text-2xl font-bold text-slate-950">
        {page.currency}
        {tier.price}
      </p>

      <div>
        <Button
          type="button"
          className="w-full"
          disabled={!ready || payment.status === 'confirming'}
          style={{ backgroundColor: page.accentColor }}
          onClick={() => void payWithUsdc(tier)}
        >
          {payment.tierId === tier.id && payment.status === 'confirming'
            ? 'Confirming...'
            : `Pay ${page.currency}${tier.price}`}
        </Button>
        {payment.tierId === tier.id && payment.status !== 'idle' ? (
          <PaymentMessage payment={payment} />
        ) : null}
      </div>
    </article>
  )

  return (
    <main
      className="min-h-[calc(100vh-150px)] px-4 py-10"
      style={{ backgroundColor: page.backgroundColor }}
    >
      <section className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p
              className="m-0 text-sm font-bold"
              style={{ color: page.accentColor }}
            >
              {page.businessName}
            </p>
            {page.headline ? (
              <h1 className="mb-3 mt-2 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                {page.headline}
              </h1>
            ) : null}
            {page.subheadline ? (
              <p className="m-0 max-w-3xl text-base leading-7 text-slate-600">
                {page.subheadline}
              </p>
            ) : null}
          </div>
          <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            /pages/{slug}
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          {page.tiers.map(renderPricingTier)}
        </div>
      </section>
    </main>
  )
}

function PaymentMessage({ payment }: { payment: PaymentState }) {
  if (payment.status === 'connecting') {
    return (
      <p className="mb-0 mt-3 text-xs font-semibold text-slate-500">
        Connect a Solana wallet to continue.
      </p>
    )
  }

  if (payment.status === 'success' && payment.signature) {
    return (
      <p className="mb-0 mt-3 text-xs font-semibold text-emerald-700">
        Payment sent. Signature {payment.signature.slice(0, 8)}...
        {payment.signature.slice(-8)}
      </p>
    )
  }

  if (payment.status === 'error' && payment.error) {
    return (
      <p className="mb-0 mt-3 text-xs font-semibold text-red-700">
        {payment.error}
      </p>
    )
  }

  return null
}

async function createUsdcTransferTransaction({
  amountUsd,
  connection,
  merchantWalletAddress,
  payerWalletAddress,
}: {
  amountUsd: number
  connection: Connection
  merchantWalletAddress: string
  payerWalletAddress: string
}) {
  const mint = new PublicKey(USDC_MINT_ADDRESS)
  const payer = new PublicKey(payerWalletAddress)
  const merchant = new PublicKey(merchantWalletAddress)
  const payerUsdcAccount = await getAssociatedTokenAddress(mint, payer)
  const merchantUsdcAccount = await getAssociatedTokenAddress(mint, merchant)
  const amount = dollarsToUsdcBaseUnits(amountUsd)
  const { blockhash } = await connection.getLatestBlockhash()

  const transaction = new Transaction({
    feePayer: payer,
    recentBlockhash: blockhash,
  }).add(
    createAssociatedTokenAccountIdempotentInstruction(
      payer,
      merchantUsdcAccount,
      merchant,
      mint,
    ),
    createTransferCheckedInstruction(
      payerUsdcAccount,
      mint,
      merchantUsdcAccount,
      payer,
      amount,
      USDC_DECIMALS,
    ),
  )

  return transaction.serialize({
    requireAllSignatures: false,
    verifySignatures: false,
  })
}
