import { Check, LogOut, ShieldCheck, Wallet } from "lucide-react";
import { useState, type ReactNode } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Button } from "@/components/ui/button";
import type {
  PublicCheckoutProps,
  PaymentState,
  UsdcBalanceState,
  SubscriptionPage,
  Tier,
} from "@/types";
import CheckoutNavbar from "./CheckoutNavbar";
import delta_pay_logo from "@/assets/deltapay.png";

export function PublicCheckout({
  customerWalletAddress,
  disconnectWallet,
  isCustomerWalletReady,
  isWalletConnecting,
  merchantWalletAddress,
  page,
  payment,
  payWithUsdc,
  usdcBalance,
}: PublicCheckoutProps) {
  const [selectedTierId, setSelectedTierId] = useState(page.tiers[0]?.id ?? "");
  const selectedTier =
    page.tiers.find((tier) => tier.id === selectedTierId) ?? page.tiers[0];

  return (
    <>
      <CheckoutNavbar page={page} />
      <main
        className="min-h-[calc(100vh-150px)] px-4 py-10 sm:py-12"
        style={{ backgroundColor: page.backgroundColor }}
      >
      <section className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <section className="min-w-0">
          <CheckoutHeader page={page} />

          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="m-0 text-lg font-bold text-slate-900">
              Choose your option
            </h2>
            <span className="rounded-lg border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
              {page.tiers.length} {page.tiers.length === 1 ? "option" : "options"}
            </span>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white divide-y divide-slate-200">
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
          disconnectWallet={disconnectWallet}
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
    </>
  );
}

function CheckoutHeader({ page }: { page: SubscriptionPage }) {
  return (
    <div className="mb-8 pb-8 border-b border-slate-200">
      <p className="text-xs text-slate-600 font-semibold uppercase tracking-wide mb-4">Secure checkout</p>
      <div className="flex w-full items-center justify-between">
        <div>
          <h1 className="m-0 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-3">
        {page.businessName}
      </h1>
      {page.headline ? (
        <p className="mb-0 text-lg leading-8 text-slate-600">
          {page.headline}
        </p>
      ) : null}
        </div>
        
          <div className="mt-6 flex items-center">
            <img
              src={page.imageUrl || delta_pay_logo}
              alt={page.businessName}
              className="h-24 w-24 object-cover rounded-lg shadow-sm border border-slate-200 sm:h-32 sm:w-32"
            />
          </div>
        
      </div>
    </div>
  );
}

function TierOption({
  currency,
  isSelected,
  onSelect,
  tier,
}: {
  currency: string;
  isSelected: boolean;
  onSelect: () => void;
  tier: Tier;
}) {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      className={`grid min-h-24 w-full gap-3 bg-white p-5 text-left sm:grid-cols-[1fr_auto] sm:items-center transition-all hover:bg-blue-50 ${
        isSelected ? "border-l-4 border-blue-600 bg-blue-50/30" : ""
      }`}
      onClick={onSelect}
    >
      <span className="flex min-w-0 gap-3">
        <span
          className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
            isSelected ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 bg-white"
          }`}
        >
          {isSelected && <Check size={12} aria-hidden="true" />}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-base font-bold text-slate-900">
            {tier.name}
          </span>
          {tier.description ? (
            <span className="mt-1 line-clamp-2 block text-sm leading-6 text-slate-600">
              {tier.description}
            </span>
          ) : null}
        </span>
      </span>

      <span className="pl-8 text-2xl font-bold text-slate-900 sm:pl-0">
        {currency}{tier.price}
      </span>
    </button>
  );
}

function OrderSummary({
  accentColor,
  currency,
  customerWalletAddress,
  disconnectWallet,
  isCustomerWalletReady,
  isWalletConnecting,
  merchantWalletAddress,
  payment,
  selectedTier,
  usdcBalance,
  onPay,
}: {
  accentColor: string;
  currency: string;
  customerWalletAddress?: string;
  disconnectWallet: () => Promise<void>;
  isCustomerWalletReady: boolean;
  isWalletConnecting: boolean;
  merchantWalletAddress: string;
  payment: PaymentState;
  selectedTier?: Tier;
  usdcBalance: UsdcBalanceState;
  onPay: (tier: Tier) => Promise<void>;
}) {
  const selectedPaymentIsActive = Boolean(
    selectedTier &&
    payment.tierId === selectedTier.id &&
    payment.status !== "idle",
  );
  const paymentButtonText =
    selectedTier &&
    payment.tierId === selectedTier.id &&
    payment.status === "confirming"
      ? "Confirming..."
      : isCustomerWalletReady &&
        selectedTier &&
        `Pay ${currency}${selectedTier.price}`;

  return (
    <aside className="island-shell h-fit rounded-2xl p-6 lg:sticky lg:top-24">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs text-slate-600 font-semibold uppercase tracking-wide mb-2">Order summary</p>
          <h2 className="m-0 truncate text-2xl font-bold text-slate-900">
            {selectedTier?.name ?? "No item selected"}
          </h2>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 border border-blue-200">
          <Wallet size={20} aria-hidden="true" className="text-blue-600" />
        </div>
      </div>

      {selectedTier ? (
        <>
          <div className="border-y border-slate-200 py-5">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="min-w-0">
                <p className="m-0 truncate text-sm font-semibold text-slate-900">
                  {selectedTier.name}
                </p>
                {selectedTier.description ? (
                  <p className="mb-0 mt-1 line-clamp-2 text-sm leading-6 text-slate-600">
                    {selectedTier.description}
                  </p>
                ) : null}
              </div>
              <p className="m-0 shrink-0 text-sm font-semibold text-slate-900">
                {currency}{selectedTier.price}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-2">
            <CheckoutDetail label="Method" value="Private USDC" />
            <CheckoutDetailWithAction
              action={
                isCustomerWalletReady ? (
                  <Button
                    type="button"
                    aria-label="Disconnect wallet"
                    title="Disconnect wallet"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    onClick={() => void disconnectWallet()}
                  >
                    <LogOut size={14} aria-hidden="true" />
                  </Button>
                ) : null
              }
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

          <div className="mt-6 flex items-baseline justify-between gap-4 border-t border-slate-200 pt-5">
            <span className="text-sm font-semibold text-slate-600">Total</span>
            <span className="text-3xl font-bold text-slate-900">
              {currency}{selectedTier.price}
            </span>
          </div>

          {!isCustomerWalletReady && (
            <WalletMultiButton
              className="checkout-wallet-button mt-6 w-full"
              style={{
                backgroundColor: accentColor,
                width: "100%",
                display: "flex",
                justifyContent: "center",
                borderRadius: "8px",
                height: "44px",
                fontSize: "15px",
              }}
            >
              <Wallet size={16} aria-hidden="true" className="mr-2" />
              Connect Wallet
            </WalletMultiButton>
          )}
          {isCustomerWalletReady && (
            <Button
              type="button"
              className="mt-6 w-full"
              size="lg"
              disabled={isWalletConnecting || payment.status === "confirming"}
              style={{ backgroundColor: accentColor }}
              onClick={() => void onPay(selectedTier)}
            >
              <Wallet size={16} aria-hidden="true" />
              {paymentButtonText}
            </Button>
          )}

          {selectedPaymentIsActive ? (
            <PaymentMessage payment={payment} />
          ) : null}

          <p className="mb-0 mt-5 flex items-center gap-2 text-xs font-semibold leading-5 text-slate-600">
            <ShieldCheck size={15} aria-hidden="true" />
            Payments secured with Cloak.
          </p>
        </>
      ) : (
        <p className="m-0 text-sm leading-6 text-slate-600">
          This checkout does not have any available items yet.
        </p>
      )}
    </aside>
  );
}

function CheckoutDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2.5">
      <span className="text-xs font-semibold uppercase text-slate-600">
        {label}
      </span>
      <span className="min-w-0 truncate text-right font-semibold text-slate-900">
        {value}
      </span>
    </div>
  );
}

function CheckoutDetailWithAction({
  action,
  label,
  value,
}: {
  action: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2.5">
      <span className="text-xs font-semibold uppercase text-slate-600">
        {label}
      </span>
      <span className="flex min-w-0 items-center justify-end gap-2">
        <span className="min-w-0 truncate text-right font-semibold text-slate-900">
          {value}
        </span>
        {action}
      </span>
    </div>
  );
}

function formatWalletAddress(address?: string) {
  if (!address) {
    return "Not connected";
  }

  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function formatUsdcBalance(balance: UsdcBalanceState) {
  if (balance.status === "loading") {
    return "Loading...";
  }

  if (balance.status === "error") {
    return "Unavailable";
  }

  if (balance.status !== "success") {
    return "Connect wallet";
  }

  const amount = Number(balance.amount ?? 0);

  if (!Number.isFinite(amount)) {
    return `${balance.amount ?? "0"} USDC`;
  }

  return `${amount.toLocaleString(undefined, {
    maximumFractionDigits: 6,
    minimumFractionDigits: amount > 0 && amount < 1 ? 2 : 0,
  })} USDC`;
}

function PaymentMessage({ payment }: { payment: PaymentState }) {
  if (payment.status === "connecting") {
    return (
      <p className="mb-0 mt-4 text-sm font-semibold text-slate-600 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
        Choose a Solana wallet to continue with payment.
      </p>
    );
  }

  if (payment.status === "success" && payment.signature) {
    return (
      <p className="mb-0 mt-4 text-sm font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
        ✓ Payment confirmed. Signature {payment.signature.slice(0, 8)}...
        {payment.signature.slice(-8)}
      </p>
    );
  }

  if (payment.status === "confirming") {
    return (
      <p className="mb-0 mt-4 text-sm font-semibold text-slate-600 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
        ⏱ {payment.message ?? "Processing payment..."}
      </p>
    );
  }

  if (payment.status === "error" && payment.error) {
    return (
      <div className="mt-4 rounded-lg border border-red-300 bg-red-50 px-3 py-3 text-sm font-semibold leading-5 text-red-800">
        <p className="m-0 font-bold">
          {payment.errorTitle ?? "Payment failed"}
        </p>
        <p className="mb-0 mt-1 text-red-700">{payment.error}</p>
        {payment.errorSuggestion ? (
          <p className="mb-0 mt-1 text-sm text-red-600">{payment.errorSuggestion}</p>
        ) : null}
        {payment.errorRecoverable ? (
          <p className="mb-0 mt-1 text-sm text-red-600">You can try again.</p>
        ) : null}
      </div>
    );
  }

  return null;
}
