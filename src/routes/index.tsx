import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Globe2,
  Layers3,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({ component: LandingPage })

const benefits = [
  'Create custom hosted subscription pages',
  'Control plans, pricing, copy, and checkout links',
  'Share one link from any app pricing section',
]

const steps = [
  {
    title: 'Sign in',
    description: 'Use Privy to authenticate with email or wallet.',
    icon: ShieldCheck,
  },
  {
    title: 'Build tiers',
    description: 'Create subscription plans for a business or product.',
    icon: Layers3,
  },
  {
    title: 'Publish link',
    description: 'Drop the public page URL into your app pricing area.',
    icon: Globe2,
  },
]

function LandingPage() {
  return (
    <main>
      <section className="page-wrap grid min-h-[calc(100vh-220px)] items-center gap-10 px-4 py-12 lg:grid-cols-[1.08fr_0.92fr]">
        <div>
          <h1 className="m-0 max-w-5xl text-4xl font-black tracking-tight text-black sm:text-6xl lg:text-7xl">
            Subscription pages your customers can trust.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-700">
            TierFlow lets businesses create branded payment and subscription
            tier pages, then link those pages from the pricing area of their
            own apps.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild className='max-w-75 w-full' size="lg" variant="outline">
              <Link to="/signin" className="no-underline">
                Start building
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </Button>
          </div>

          <ul className="mt-8 grid gap-3 p-0 text-sm font-semibold text-black sm:grid-cols-3">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex gap-2">
                <CheckCircle2 size={17} aria-hidden="true" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-black bg-white p-4 shadow-[10px_10px_0_#000]">
          <div className="border-b border-black pb-4">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-black">
                <CreditCard size={18} aria-hidden="true" />
                Northstar CRM
              </div>
              <span className="rounded-md border border-black px-2 py-1 text-xs font-bold">
                Live
              </span>
            </div>
            <h2 className="m-0 text-2xl font-black text-black">
              Plans for growing revenue teams.
            </h2>
            <p className="mb-0 mt-2 text-sm leading-6 text-neutral-700">
              Three clean tiers, one checkout destination, and a page that
              feels native to the business.
            </p>
          </div>

          <div className="grid gap-3 pt-4 sm:grid-cols-3">
            {['Launch', 'Growth', 'Scale'].map((plan, index) => (
              <article
                key={plan}
                className={`rounded-md border border-black p-3 ${
                  index === 1 ? 'bg-black text-white' : 'bg-white text-black'
                }`}
              >
                <h3 className="m-0 text-sm font-black">{plan}</h3>
                <p
                  className={`mb-4 mt-2 text-xs leading-5 ${
                    index === 1 ? 'text-neutral-300' : 'text-neutral-600'
                  }`}
                >
                  {index === 0
                    ? 'For first paid plans.'
                    : index === 1
                      ? 'For active teams.'
                      : 'For custom billing.'}
                </p>
                <p className="m-0 text-2xl font-black">
                  ${index === 0 ? '29' : index === 1 ? '89' : '249'}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* <section className="border-y border-black bg-black px-4 py-10 text-white">
        <div className="page-wrap grid gap-4 md:grid-cols-3">
          {steps.map((step) => (
            <article key={step.title} className="rounded-lg border border-white p-5">
              <step.icon size={22} aria-hidden="true" />
              <h2 className="mb-2 mt-4 text-xl font-black">{step.title}</h2>
              <p className="m-0 text-sm leading-6 text-neutral-300">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </section> */}
    </main>
  )
}
