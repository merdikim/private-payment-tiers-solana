import { usePrivy } from '@privy-io/react-auth'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import {
  ArrowRight,
  BadgeDollarSign,
  CheckCircle2,
  CreditCard,
  Link as LinkIcon,
  ListPlus,
  Wallet,
} from 'lucide-react'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({ component: LandingPage })

const benefits = [
  'One hosted link per business',
  'Pricing tiers for items and services',
  'Direct USDC settlement to a Solana wallet',
]

const pricingItems = [
  {
    name: 'Consultation',
    description: 'Discovery call and initial recommendation.',
    price: '$75',
  },
  {
    name: 'Service package',
    description: 'Recurring operational support.',
    price: '$250',
  },
  {
    name: 'Custom project',
    description: 'Scoped work with a fixed checkout amount.',
    price: '$1000',
  },
]

const workflow = [
  {
    title: 'Business',
    description: 'Add the business name and optional checkout headline.',
    icon: CreditCard,
  },
  {
    title: 'Tiers',
    description: 'Create compact prices for each item, package, or service.',
    icon: ListPlus,
  },
  {
    title: 'Payment',
    description: 'Customers pay the selected price with a Solana wallet.',
    icon: Wallet,
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
      <section className="page-wrap grid min-h-[calc(100vh-190px)] items-center gap-10 px-4 py-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="max-w-3xl">
          <p className="island-kicker mb-3">USDC Checkout</p>
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
            <Button asChild className="w-full max-w-52" size="lg" variant="outline">
              <Link to="/about" className="no-underline">
                Learn more
              </Link>
            </Button>
          </div>

          <ul className="mt-8 grid gap-3 p-0 text-sm font-semibold text-black">
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
                  className="h-10 rounded-md border border-black bg-black px-4 text-sm font-black text-white"
                >
                  Pay USDC
                </button>
              </article>
            ))}
          </div>

          <div className="grid gap-3 border-t border-black bg-(--surface-muted) p-4 sm:grid-cols-3">
            <div className="flex items-center gap-2 text-xs font-black">
              <BadgeDollarSign size={17} aria-hidden="true" />
              Dollar pricing
            </div>
            <div className="flex items-center gap-2 text-xs font-black">
              <Wallet size={17} aria-hidden="true" />
              Solana wallet
            </div>
            <div className="flex items-center gap-2 text-xs font-black">
              <LinkIcon size={17} aria-hidden="true" />
              Hosted link
            </div>
          </div>
        </section>
      </section>

      <section className="border-y border-black bg-black px-4 py-10 text-white">
        <div className="page-wrap grid gap-6 md:grid-cols-3">
          {workflow.map((step) => (
            <article key={step.title} className="border border-white p-5">
              <step.icon size={22} aria-hidden="true" />
              <h2 className="mb-2 mt-4 text-xl font-black">{step.title}</h2>
              <p className="m-0 text-sm leading-6 text-neutral-300">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
