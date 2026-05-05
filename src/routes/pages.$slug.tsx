import { createFileRoute, notFound } from '@tanstack/react-router'
import { CheckCircle2, LockKeyhole } from 'lucide-react'
import { findSubscriptionPage } from '../lib/subscriptionPage'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/pages/$slug')({
  loader: async ({ params }) => {
    const page = await findSubscriptionPage(params.slug)

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
  const createCheckoutHref = (tierId: string) => {
    const params = new URLSearchParams({ plan: tierId })

    if (page.walletAddress.trim()) {
      params.set('walletAddress', page.walletAddress.trim())
    }

    const separator = page.checkoutUrl.includes('?') ? '&' : '?'

    return `${page.checkoutUrl}${separator}${params.toString()}`
  }

  const renderCheckoutCard = (tier: (typeof page.tiers)[number]) => (
    <article
      key={tier.id}
      className="flex min-h-[430px] flex-col rounded-lg border bg-white p-5 shadow-sm"
      style={{
        borderColor: tier.featured ? page.accentColor : '#e2e8f0',
      }}
    >
      <div className="min-h-36">
        {tier.featured ? (
          <p
            className="m-0 mb-3 inline-flex rounded-md px-2 py-1 text-xs font-bold text-white"
            style={{ backgroundColor: page.accentColor }}
          >
            Recommended
          </p>
        ) : null}
        <h2 className="m-0 text-xl font-bold text-slate-950">{tier.name}</h2>
        <p className="text-sm leading-6 text-slate-600">{tier.description}</p>
      </div>

      <div>
        <p className="m-0 text-4xl font-bold text-slate-950">
          {page.currency}
          {tier.price}
          <span className="text-sm font-semibold text-slate-500">
            /{tier.cycle}
          </span>
        </p>

        <Button
          asChild
          className="mt-5 w-full"
          style={{ backgroundColor: page.accentColor }}
        >
          <a href={createCheckoutHref(tier.id)} className="no-underline">
            {tier.cta}
          </a>
        </Button>
      </div>

      <div className="flex flex-1 flex-col">
        <ul className="mt-5 flex-1 space-y-3 p-0 text-sm text-slate-700">
          {tier.features.map((feature) => (
            <li key={feature} className="flex gap-2">
              <CheckCircle2
                size={17}
                aria-hidden="true"
                style={{ color: page.accentColor }}
              />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <p className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500">
          <LockKeyhole size={14} aria-hidden="true" />
          Secure checkout link
        </p>
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
            <h1 className="mb-3 mt-2 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              {page.headline}
            </h1>
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

        <div className="grid gap-4 lg:grid-cols-3">
          {page.tiers.map(renderCheckoutCard)}
        </div>
      </section>
    </main>
  )
}
