import { usePrivy } from '@privy-io/react-auth'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  LockKeyhole,
  Wallet,
} from 'lucide-react'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({ component: LandingPage })

const benefits = [
  'Create a hosted pricing page',
  'Share/Integrate a public checkout link',
  'Receive private Solana USDC payments',
]

const pricingItems = [
  {
    name: 'Consultation',
    description: 'Discovery call and initial recommendation.',
    price: '$75',
  },
  {
    name: 'Custom project',
    description: 'Scoped work with a fixed checkout amount.',
    price: '$1000',
  },
]

function LandingPage() {
  const navigate = useNavigate()
  const { authenticated, ready } = usePrivy()

  useEffect(() => {
    if (ready && authenticated) {
      void navigate({ to: '/dashboard' })
    }
  }, [authenticated, navigate, ready])

  return (
    <main>
      <section className="page-wrap grid min-h-[calc(100vh-230px)] items-center gap-8 px-4 py-8 lg:grid-cols-[0.88fr_1.12fr] lg:py-10">
        <div className="max-w-3xl">
          <p className="island-kicker mb-3">Solana USDC payment links</p>
          <h1 className="m-0 text-4xl font-black tracking-tight text-black sm:text-5xl lg:text-6xl">
            Start accepting USDC payments on Solana in minutes.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-700 sm:text-lg">
            Delta Pay lets any business accept private Solana USDC payments through a hosted checkout, 
            simple payment links, and a merchant dashboard for tracking payments.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild className="w-full sm:w-auto" size="lg">
              <Link to="/signin" className="no-underline">
                Create your checkout page now
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </Button>
          </div>

          <ul className="mt-7 grid gap-3 p-0 text-sm font-semibold text-black sm:grid-cols-3">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-2">
                <CheckCircle2
                  size={17}
                  aria-hidden="true"
                  className="shrink-0"
                />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <ProductPreview />
      </section>
    </main>
  )
}

function ProductPreview() {
  return (
    <section className="island-shell overflow-hidden rounded-lg">
      <div className="border-b border-black bg-white p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2 text-sm font-black">
            <CreditCard size={18} aria-hidden="true" className="shrink-0" />
            <span className="truncate">Northstar Studio</span>
          </div>
          <span className="rounded-md border border-black px-2 py-1 text-xs font-bold">
            Public checkout
          </span>
        </div>
        <h2 className="m-0 text-2xl font-black text-black sm:text-3xl">
          Choose an item and pay privately with USDC.
        </h2>
        <p className="mb-0 mt-2 text-sm leading-6 text-neutral-700">
          The customer sees the same focused checkout your app generates:
          pricing options and an instant payment modal.
        </p>
      </div>

      <div className="grid gap-0 lg:grid-cols-[1fr_320px]">
        <div className="divide-y divide-black border-b border-black lg:border-b-0 lg:border-r">
          {pricingItems.map((item, index) => (
            <article
              key={item.name}
              className={`grid gap-3 bg-white p-4 sm:grid-cols-[1fr_110px] sm:items-center ${
                index === 0 ? 'shadow-[inset_5px_0_0_#000]' : ''
              }`}
            >
              <div className="flex min-w-0 gap-3">
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-black ${
                    index === 0
                      ? 'bg-black text-white'
                      : 'bg-white text-transparent'
                  }`}
                >
                  <CheckCircle2 size={13} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h3 className="m-0 truncate text-base font-black text-black">
                    {item.name}
                  </h3>
                  <p className="m-0 mt-1 text-xs leading-5 text-neutral-600">
                    {item.description}
                  </p>
                </div>
              </div>
              <p className="m-0 pl-8 text-2xl font-black text-black sm:pl-0 sm:text-right">
                {item.price}
              </p>
            </article>
          ))}
        </div>

        <aside className="bg-white p-4">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="island-kicker mb-2">Order summary</p>
              <h3 className="m-0 truncate text-xl font-black text-black">
                Consultation
              </h3>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-black bg-neutral-100">
              <Wallet size={18} aria-hidden="true" />
            </div>
          </div>

          <div className="grid gap-2 border-y border-black py-4 text-sm">
            <PreviewDetail label="Payment" value="Private USDC" />
            <PreviewDetail label="Wallet" value="Connected" />
            <PreviewDetail label="Receiving" value="8eS...93k" />
          </div>

          <div className="mt-4 flex items-end justify-between gap-4">
            <span className="text-sm font-black">Total</span>
            <span className="text-3xl font-black">$75</span>
          </div>
          <button
            type="button"
            disabled
            className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-md border border-black bg-black px-4 text-sm font-black text-white"
          >
            <LockKeyhole size={16} aria-hidden="true" />
            Pay $75
          </button>
        </aside>
      </div>
    </section>
  )
}

function PreviewDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-h-9 items-center justify-between gap-3 rounded-md border border-black bg-neutral-100 px-3">
      <span className="text-xs font-black uppercase text-neutral-600">
        {label}
      </span>
      <span className="min-w-0 truncate text-right font-black text-black">
        {value}
      </span>
    </div>
  )
}
