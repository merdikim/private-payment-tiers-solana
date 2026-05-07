import { Check, ShieldCheck, Wallet } from 'lucide-react'
import { useState } from 'react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Button } from '@/components/ui/button'
import type {
  PaymentState,
  UsdcBalanceState,
} from '@/hooks/useCheckoutPayment'
import type { SubscriptionPage, Tier } from '@/lib/subscriptionPage'

type PublicCheckoutProps = {
  customerWalletAddress?: string
  isCustomerWalletReady: boolean
  isWalletConnecting: boolean
  merchantWalletAddress: string
  page: SubscriptionPage
  payment: PaymentState
  payWithUsdc: (tier: Tier) => Promise<void>
  usdcBalance: UsdcBalanceState
}

export function PublicCheckout({
  customerWalletAddress,
  isCustomerWalletReady,
  isWalletConnecting,
  merchantWalletAddress,
  page,
  payment,
  payWithUsdc,
  usdcBalance,
}: PublicCheckoutProps) {
  const [selectedTierId, setSelectedTierId] = useState(page.tiers[0]?.id ?? '')
  const selectedTier =
    page.tiers.find((tier) => tier.id === selectedTierId) ?? page.tiers[0]

  return (
    <main
      className="min-h-[calc(100vh-150px)] px-4 py-8 sm:py-10"
      style={{ backgroundColor: page.backgroundColor }}
    >
      <section className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
        <section className="min-w-0">
          <CheckoutHeader page={page} />

          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="m-0 text-lg font-black text-(--sea-ink)">
              Choose item
            </h2>
            <span className="rounded-md border border-black bg-white px-2 py-1 text-[11px] font-black">
              {page.tiers.length} options
            </span>
          </div>

          <div className="overflow-hidden rounded-lg border border-black bg-white">
            {page.tiers.map((tier) => (
              <TierOption
                key={tier.id}
                currency={page.currency}
                isSelected={selectedTier?.id === tier.id}
                tier={tier}
                onSelect={() => setSelectedTierId(tier.id)}
              />
            ))}
          </div>
        </section>

        <OrderSummary
          accentColor={page.accentColor}
          currency={page.currency}
          customerWalletAddress={customerWalletAddress}
          isCustomerWalletReady={isCustomerWalletReady}
          isWalletConnecting={isWalletConnecting}
          merchantWalletAddress={merchantWalletAddress}
          payment={payment}
          selectedTier={selectedTier}
          usdcBalance={usdcBalance}
          onPay={payWithUsdc}
        />
      </section>
    </main>
  )
}

function CheckoutHeader({ page }: { page: SubscriptionPage }) {
  return (
    <div className="mb-5 border-b border-black pb-5">
      <p className="island-kicker mb-3">Secure USDC checkout</p>
      <h1 className="m-0 text-3xl font-black tracking-tight text-(--sea-ink) sm:text-5xl">
        {page.businessName}
      </h1>
      {page.headline ? (
        <p className="mb-0 mt-4 max-w-2xl text-base leading-7 text-(--sea-ink-soft)">
          {page.headline}
        </p>
      ) : null}
    </div>
  )
}

function TierOption({
  currency,
  isSelected,
  onSelect,
  tier,
}: {
  currency: string
  isSelected: boolean
  onSelect: () => void
  tier: Tier
}) {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      className={`grid min-h-24 w-full gap-3 border-b border-black bg-white p-4 text-left last:border-b-0 sm:grid-cols-[1fr_auto] sm:items-center sm:p-5 ${
        isSelected ? 'shadow-[inset_5px_0_0_#000]' : ''
      }`}
      onClick={onSelect}
    >
      <span className="flex min-w-0 gap-3">
        <span
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-black ${
            isSelected ? 'bg-black text-white' : 'bg-white text-transparent'
          }`}
        >
          <Check size={13} aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-base font-black text-(--sea-ink)">
            {tier.name}
          </span>
          {tier.description ? (
            <span className="mt-1 line-clamp-2 block text-sm leading-6 text-(--sea-ink-soft)">
              {tier.description}
            </span>
          ) : null}
        </span>
      </span>

      <span className="pl-8 text-2xl font-black text-(--sea-ink) sm:pl-0">
        {currency}
        {tier.price}
      </span>
    </button>
  )
}

function OrderSummary({
  accentColor,
  currency,
  customerWalletAddress,
  isCustomerWalletReady,
  isWalletConnecting,
  merchantWalletAddress,
  payment,
  selectedTier,
  usdcBalance,
  onPay,
}: {
  accentColor: string
  currency: string
  customerWalletAddress?: string
  isCustomerWalletReady: boolean
  isWalletConnecting: boolean
  merchantWalletAddress: string
  payment: PaymentState
  selectedTier?: Tier
  usdcBalance: UsdcBalanceState
  onPay: (tier: Tier) => Promise<void>
}) {
  const selectedPaymentIsActive = Boolean(
    selectedTier &&
      payment.tierId === selectedTier.id &&
      payment.status !== 'idle',
  )
  const paymentButtonText =
    selectedTier &&
    payment.tierId === selectedTier.id &&
    payment.status === 'confirming'
      ? 'Confirming...'
      : (isCustomerWalletReady && selectedTier) && `Pay ${currency}${selectedTier.price}`
       

  return (
    <aside className="island-shell h-fit rounded-lg p-4 sm:p-5 lg:sticky lg:top-24">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="island-kicker mb-2">Order summary</p>
          <h2 className="m-0 truncate text-2xl font-black text-(--sea-ink)">
            {selectedTier?.name ?? 'No item selected'}
          </h2>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-black bg-(--surface-muted)">
          <Wallet size={19} aria-hidden="true" />
        </div>
      </div>

      {selectedTier ? (
        <>
          <div className="border-y border-black py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="m-0 truncate text-sm font-black text-(--sea-ink)">
                  {selectedTier.name}
                </p>
                {selectedTier.description ? (
                  <p className="mb-0 mt-1 line-clamp-2 text-sm leading-6 text-(--sea-ink-soft)">
                    {selectedTier.description}
                  </p>
                ) : null}
              </div>
              <p className="m-0 shrink-0 text-sm font-black text-(--sea-ink)">
                {currency}
                {selectedTier.price}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-2 text-sm">
            <CheckoutDetail label="Payment" value="Private USDC via Cloak" />
            <CheckoutDetail
              label="Wallet"
              value={formatWalletAddress(customerWalletAddress)}
            />
            <CheckoutDetail
              label="USDC balance"
              value={formatUsdcBalance(usdcBalance)}
            />
            <CheckoutDetail
              label="Receiving"
              value={formatWalletAddress(merchantWalletAddress)}
            />
          </div>

          <div className="mt-5 flex items-end justify-between gap-4 border-t border-black pt-4">
            <span className="text-sm font-black text-(--sea-ink)">Total</span>
            <span className="text-3xl font-black text-(--sea-ink)">
              {currency}
              {selectedTier.price}
            </span>
          </div>

          {!isCustomerWalletReady && <WalletMultiButton className="checkout-wallet-button mt-5" style={{ backgroundColor: accentColor, width:"100%", display: 'flex', justifyContent:'center', marginTop:'20px' }}>
            <Wallet size={16} aria-hidden="true" className='mr-2' />Connect Wallet
          </WalletMultiButton>}
          {isCustomerWalletReady && <Button
            type="button"
            className="mt-5 w-full"
            size="lg"
            disabled={
              isWalletConnecting ||
              payment.status === 'confirming'
            }
            style={{ backgroundColor: accentColor }}
            onClick={() => void onPay(selectedTier)}
          >
            <Wallet size={16} aria-hidden="true" />
            {paymentButtonText}
          </Button>}

          {selectedPaymentIsActive ? <PaymentMessage payment={payment} /> : null}

          <p className="mb-0 mt-4 flex items-center gap-2 text-xs font-semibold leading-5 text-(--sea-ink-soft)">
            <ShieldCheck size={15} aria-hidden="true" />
            Private payments made possible by Cloak.
          </p>
        </>
      ) : (
        <p className="m-0 text-sm leading-6 text-(--sea-ink-soft)">
          This checkout does not have any available items yet.
        </p>
      )}
    </aside>
  )
}

function CheckoutDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-h-9 items-center justify-between gap-4 rounded-md border border-(--line) bg-(--surface-muted) px-3">
      <span className="text-xs font-black uppercase text-(--sea-ink-soft)">
        {label}
      </span>
      <span className="min-w-0 truncate text-right font-black text-(--sea-ink)">
        {value}
      </span>
    </div>
  )
}

function formatWalletAddress(address?: string) {
  if (!address) {
    return 'Not connected'
  }

  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

function formatUsdcBalance(balance: UsdcBalanceState) {
  if (balance.status === 'loading') {
    return 'Loading...'
  }

  if (balance.status === 'error') {
    return 'Unavailable'
  }

  if (balance.status !== 'success') {
    return 'Connect wallet'
  }

  const amount = Number(balance.amount ?? 0)

  if (!Number.isFinite(amount)) {
    return `${balance.amount ?? '0'} USDC`
  }

  return `${amount.toLocaleString(undefined, {
    maximumFractionDigits: 6,
    minimumFractionDigits: amount > 0 && amount < 1 ? 2 : 0,
  })} USDC`
}

function PaymentMessage({ payment }: { payment: PaymentState }) {
  if (payment.status === 'connecting') {
    return (
      <p className="mb-0 mt-3 text-xs font-semibold text-slate-500">
        Choose a Solana wallet to continue.
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

  if (payment.status === 'confirming') {
    return (
      <p className="mb-0 mt-3 text-xs font-semibold text-slate-500">
        {payment.message ?? 'Confirming private payment...'}
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
