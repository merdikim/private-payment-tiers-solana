import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  LockKeyhole
} from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useMerchantAuth } from "@/components/merchantAuth";

export const Route = createFileRoute("/")({ component: LandingPage });

const benefits = [
  "Create a custom checkout page",
  "Share/Integrate a public payment link",
  "Receive Solana USDC payments privately",
];

const pricingItems = [
  {
    name: "Consultation",
    description: "Discovery call and initial recommendation.",
    price: "$75",
  },
  {
    name: "Custom project",
    description: "Scoped work with a fixed checkout amount.",
    price: "$1000",
  },
];

function LandingPage() {
  const navigate = useNavigate();
  const { authenticated, ready } = useMerchantAuth();

  useEffect(() => {
    if (ready && authenticated) {
      void navigate({ to: "/dashboard" });
    }
  }, [authenticated, navigate, ready]);

  return (
    <main className="bg-linear-to-b from-white via-white to-slate-50">
      <section className="page-wrap grid h-[calc(100vh-230px)] items-center gap-12 px-4 py-12 lg:grid-cols-[0.88fr_1.12fr] lg:py-14">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-4">Solana USDC Payments</p>
          <h1 className="m-0 text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl lg:text-6xl leading-tight">
            Accept USDC payments in seconds.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
            Delta Pay makes it simple for any business to accept Solana USDC payments. Host checkout pages, share payment links, and manage transactions. Any business, anywhere in the world.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Button asChild className="w-full sm:w-87.5" size="lg">
              <Link to="/signin" className="no-underline">
                Get started today
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </Button>
          </div>

          <ul className="mt-10 grid gap-4 p-0 text-base text-slate-700 sm:grid-cols-2">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3">
                <CheckCircle2
                  size={20}
                  aria-hidden="true"
                  className="shrink-0 text-green-600 mt-0.5"
                />
                <span className="font-medium">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <ProductPreview />
      </section>
    </main>
  );
}

function ProductPreview() {
  return (
    <section className="island-shell rounded-2xl overflow-hidden">
      <div className="border-b border-slate-200 bg-white px-6 py-5">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-100">
              <CreditCard size={20} aria-hidden="true" className="text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Studio Name</p>
              <p className="text-sm font-semibold text-slate-900 truncate">Northstar Studio</p>
            </div>
          </div>
          <span className="rounded-lg border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            Public checkout
          </span>
        </div>
        <h2 className="m-0 text-2xl font-bold text-slate-900 sm:text-3xl">
          Choose your plan
        </h2>
        <p className="mb-0 mt-3 text-sm leading-6 text-slate-600">
          Select a pricing tier and pay instantly with Solana USDC
        </p>
      </div>

      <div className="grid gap-0 lg:grid-cols-[1fr_320px]">
        <div className="divide-y divide-slate-200 border-b border-slate-200 lg:border-b-0 lg:border-r">
          {pricingItems.map((item, index) => (
            <article
              key={item.name}
              className={`grid gap-3 bg-white p-5 sm:grid-cols-[1fr_110px] sm:items-center transition-colors hover:bg-slate-50 ${
                index === 0 ? "border-l-4 border-blue-600 bg-blue-50/30" : ""
              }`}
            >
              <div className="flex min-w-0 gap-3">
                <span
                  className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                    index === 0
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {index === 0 && <CheckCircle2 size={12} aria-hidden="true" />}
                </span>
                <div className="min-w-0">
                  <h3 className="m-0 text-base font-bold text-slate-900">
                    {item.name}
                  </h3>
                  <p className="m-0 mt-1 text-sm leading-5 text-slate-600">
                    {item.description}
                  </p>
                </div>
              </div>
              <p className="m-0 pl-8 text-2xl font-bold text-slate-900 sm:pl-0 sm:text-right">
                {item.price}
              </p>
            </article>
          ))}
        </div>

        <aside className="bg-slate-50/50 p-5 space-y-5">
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-2">Order summary</p>
            <h3 className="m-0 text-lg font-bold text-slate-900">
              Consultation
            </h3>
          </div>

          <div className="space-y-2 border-y border-slate-200 py-4">
            <PreviewDetail label="Payment" value="USDC" />
            <PreviewDetail label="Status" value="Ready" />
            <PreviewDetail label="To" value="Sol...nak" />
          </div>

          <div>
            <div className="flex items-baseline justify-between mb-3">
              <span className="text-sm font-semibold text-slate-600">Total</span>
              <span className="text-3xl font-bold text-slate-900">$75</span>
            </div>
            <button
              type="button"
              disabled
              className="w-full flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 text-white font-semibold opacity-50 cursor-not-allowed"
            >
              <LockKeyhole size={16} aria-hidden="true" />
              Pay $75
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}

function PreviewDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 border border-slate-200">
      <span className="text-xs font-semibold uppercase text-slate-600">
        {label}
      </span>
      <span className="min-w-0 truncate text-right font-semibold text-slate-900">
        {value}
      </span>
    </div>
  );
}
