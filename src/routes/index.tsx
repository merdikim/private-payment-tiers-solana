import { usePrivy } from '@privy-io/react-auth'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
} from 'lucide-react'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({ component: LandingPage })

const benefits = [
  'Private payments',
  'Instant completion',
  'Completely decentralized',
]

const pricingItems = [
  {
    name: 'Consultation',
    description: 'Discovery call and initial recommendation.',
    price: '$75',
  },
  // {
  //   name: 'Service package',
  //   description: 'Recurring operational support.',
  //   price: '$250',
  // },
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
      <section className="page-wrap grid min-h-[calc(100vh-250px)] items-center gap-10 px-4 py-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="max-w-3xl">
          <h1 className="m-0 text-4xl font-black tracking-tight text-black sm:text-6xl lg:text-7xl">
            A pricing menu that gets paid in Solana USDC.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-700">
            Create one hosted checkout for a business, add prices for the items
            or services it sells, and send customers a simple link to pay with a
            Solana wallet.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild className="w-full max-w-72" size="lg">
              <Link to="/signin" className="no-underline">
                Start pricing
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </Button>
          </div>

          <ul className="mt-8 gap-3 p-0 text-sm font-semibold flex text-black">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-2">
                <CheckCircle2 size={17} aria-hidden="true" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <section className="island-shell overflow-hidden rounded-lg">
          <div className="border-b border-black bg-white p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-black">
                <CreditCard size={18} aria-hidden="true" />
                Northstar Studio
              </div>
              <span className="rounded-md border border-black px-2 py-1 text-xs font-bold">
                Published
              </span>
            </div>
            <h2 className="m-0 text-2xl font-black text-black sm:text-3xl">
              Choose what you want to pay for.
            </h2>
            <p className="mb-0 mt-2 text-sm leading-6 text-neutral-700">
              The customer sees a simple pricing list. The merchant receives
              USDC directly to their wallet.
            </p>
          </div>

          <div className="divide-y divide-black">
            {pricingItems.map((item) => (
              <article
                key={item.name}
                className="grid gap-3 bg-white p-4 sm:grid-cols-[1fr_110px_150px] sm:items-center"
              >
                <div className="min-w-0">
                  <h3 className="m-0 truncate text-base font-black text-black">
                    {item.name}
                  </h3>
                  <p className="m-0 mt-1 text-xs leading-5 text-neutral-600">
                    {item.description}
                  </p>
                </div>
                <p className="m-0 text-2xl font-black text-black">
                  {item.price}
                </p>
                <button
                  type="button"
                  disabled
                  className="h-10 rounded-md border border-black bg-black px-4 text-sm font-black text-white"
                >
                  Pay USDC
                </button>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  )
}
