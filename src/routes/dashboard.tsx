import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Copy, ExternalLink, Link as LinkIcon, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  PAGES_QUERY_KEY,
  defaultSubscriptionPage,
  getPublicPagePath,
  listSubscriptionPages,
} from '../lib/subscriptionPage'

export const Route = createFileRoute('/dashboard')({ component: Dashboard })

function Dashboard() {
  const { data: pages = [defaultSubscriptionPage] } = useQuery({
    queryKey: PAGES_QUERY_KEY,
    queryFn: listSubscriptionPages,
    initialData: [defaultSubscriptionPage],
  })

  const origin =
    typeof window === 'undefined' ? 'https://tierflow.local' : window.location.origin
  const activePages = pages.filter((page) => page.checkoutUrl && page.slug)

  return (
    <main className="page-wrap px-4 py-8">
      <section className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="island-kicker mb-2">Dashboard</p>
          <h1 className="mb-3 max-w-4xl text-3xl font-bold tracking-tight text-(--sea-ink) sm:text-5xl">
            Businesses with active checkout links.
          </h1>
          <p className="max-w-3xl text-base leading-7 text-(--sea-ink-soft)">
            Review each business page, copy its public pricing link, or open the
            live checkout destination.
          </p>
        </div>

        <Button asChild>
          <Link to="/new" className="no-underline">
            <Plus size={16} aria-hidden="true" />
            New checkout
          </Link>
        </Button>
      </section>

      <section className="grid gap-4">
        {activePages.map((page) => {
          const publicPath = getPublicPagePath(page.slug)
          const publicUrl = `${origin}${publicPath}`
          const lowestPrice = Math.min(...page.tiers.map((tier) => tier.price))

          return (
            <article
              key={page.slug}
              className="island-shell grid gap-4 rounded-lg p-4 lg:grid-cols-[1fr_300px]"
            >
              <div className="min-w-0">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full border border-black"
                    style={{ backgroundColor: page.accentColor }}
                  />
                  <h2 className="m-0 text-xl font-black text-(--sea-ink)">
                    {page.businessName}
                  </h2>
                  <span className="rounded-md border border-black px-2 py-1 text-xs font-bold">
                    {page.tiers.length} plans
                  </span>
                </div>

                <p className="m-0 max-w-3xl text-sm leading-6 text-(--sea-ink-soft)">
                  {page.headline}
                </p>

                <div className="mt-4 flex min-h-11 items-center gap-2 rounded-md border border-(--line) bg-(--surface-muted) px-3 text-sm text-(--sea-ink-soft)">
                  <LinkIcon size={16} aria-hidden="true" className="shrink-0" />
                  <span className="min-w-0 flex-1 truncate">{publicUrl}</span>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="h-8 w-8"
                    title="Copy public URL"
                    onClick={() => void navigator.clipboard?.writeText(publicUrl)}
                  >
                    <Copy size={15} aria-hidden="true" />
                    <span className="sr-only">Copy public URL</span>
                  </Button>
                </div>
              </div>

              <div className="grid content-between gap-3 rounded-md border border-black bg-white p-3">
                <div className="grid grid-cols-2 gap-3">
                  <Metric label="Lowest" value={`${page.currency}${lowestPrice}`} />
                  <Metric
                    label="Featured"
                    value={page.tiers.filter((tier) => tier.featured).length}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline" className="flex-1">
                    <Link
                      to="/pages/$slug"
                      params={{ slug: page.slug }}
                      className="no-underline"
                    >
                      <ExternalLink size={15} aria-hidden="true" />
                      Page
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1">
                    <a href={page.checkoutUrl} className="no-underline">
                      <ExternalLink size={15} aria-hidden="true" />
                      Checkout
                    </a>
                  </Button>
                </div>
              </div>
            </article>
          )
        })}
      </section>
    </main>
  )
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-(--line) bg-(--surface-muted) p-3">
      <p className="m-0 text-xs font-semibold uppercase text-(--sea-ink-soft)">
        {label}
      </p>
      <p className="m-0 mt-1 text-xl font-bold text-(--sea-ink)">{value}</p>
    </div>
  )
}
