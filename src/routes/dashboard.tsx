import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import {
  Copy,
  ExternalLink,
  FilePlus2,
  Link as LinkIcon,
  LoaderCircle,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  PAGES_QUERY_KEY,
  getPublicPagePath,
  listSubscriptionPages,
} from '../lib/subscriptionPage'

export const Route = createFileRoute('/dashboard')({ component: Dashboard })

function Dashboard() {
  const listSubscriptionPagesFn = useServerFn(listSubscriptionPages)
  const { data: pages = [], isPending } = useQuery({
    queryKey: PAGES_QUERY_KEY,
    queryFn: () => listSubscriptionPagesFn(),
  })

  const origin =
    typeof window === 'undefined' ? 'https://tierflow.local' : window.location.origin
  const activePages = pages.filter((page) => page.checkoutUrl && page.slug)

  return (
    <main className="page-wrap min-h-[calc(100vh-230px)] px-4 py-8">
      <section className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="island-kicker mb-2">Dashboard</p>
          {/* <h1 className="mb-3 max-w-4xl text-3xl font-bold tracking-tight text-(--sea-ink) sm:text-5xl">
            Businesses with active checkout links.
          </h1>
          <p className="max-w-3xl text-base leading-7 text-(--sea-ink-soft)">
            Review each business page, copy its public pricing link, or open the
            live checkout destination.
          </p> */}
        </div>

        <Button asChild>
          <Link to="/new" className="no-underline">
            <Plus size={16} aria-hidden="true" />
            New checkout Page
          </Link>
        </Button>
      </section>

      {isPending ? (
        <DashboardLoading />
      ) : activePages.length === 0 ? (
        <section className="island-shell grid min-h-90 place-items-center rounded-lg p-6 text-center">
          <div className="mx-auto max-w-md">
            <FilePlus2
              size={34}
              aria-hidden="true"
              className="mx-auto mb-5 text-(--accent)"
            />
            <h1 className="m-0 text-2xl font-black text-(--sea-ink)">
              No pages found
            </h1>
            <p className="mx-auto mb-6 mt-3 max-w-sm text-sm leading-6 text-(--sea-ink-soft)">
              Create your first checkout page to publish plans, share a public
              link, and send customers to checkout.
            </p>
            <Button asChild>
              <Link to="/new" className="no-underline">
                <Plus size={16} aria-hidden="true" />
                Create New Checkout page
              </Link>
            </Button>
          </div>
        </section>
      ) : (
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
      )}
    </main>
  )
}

function DashboardLoading() {
  return (
    <section className="island-shell rounded-lg p-4 sm:p-6">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-3 h-3 w-24 rounded-full bg-(--surface-muted)" />
          <h1 className="m-0 flex items-center gap-3 text-2xl font-black text-(--sea-ink)">
            <LoaderCircle size={22} aria-hidden="true" className="animate-spin" />
            Loading dashboard
          </h1>
          <p className="m-0 mt-2 max-w-md text-sm leading-6 text-(--sea-ink-soft)">
            Pulling your checkout pages from the database.
          </p>
        </div>

        <div className="h-10 w-full rounded-md border border-black bg-(--surface-muted) sm:w-40" />
      </div>

      <div className="grid gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="grid gap-4 rounded-lg border border-(--line) bg-white p-4 lg:grid-cols-[1fr_300px]"
          >
            <div>
              <div className="mb-4 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full border border-black bg-(--surface-muted)" />
                <div className="h-5 w-44 rounded-md bg-(--surface-muted)" />
                <div className="h-6 w-16 rounded-md border border-black bg-white" />
              </div>
              <div className="mb-2 h-3 w-full max-w-lg rounded-full bg-(--surface-muted)" />
              <div className="h-3 w-2/3 rounded-full bg-(--surface-muted)" />
              <div className="mt-5 h-11 rounded-md border border-(--line) bg-(--surface-muted)" />
            </div>

            <div className="grid gap-3 rounded-md border border-black bg-white p-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="h-16 rounded-md border border-(--line) bg-(--surface-muted)" />
                <div className="h-16 rounded-md border border-(--line) bg-(--surface-muted)" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-10 rounded-md border border-black bg-white" />
                <div className="h-10 rounded-md border border-black bg-white" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
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
