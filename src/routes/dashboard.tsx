import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import type { ReactNode } from 'react'
import {
  Copy,
  ExternalLink,
  FilePlus2,
  Link as LinkIcon,
  LoaderCircle,
  Plus,
  Wallet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  PAGES_QUERY_KEY,
  getPublicPagePath,
  listSubscriptionPages,
} from '../lib/subscriptionPage'

export const Route = createFileRoute('/dashboard')({ component: Dashboard })

const noteColors = ['#fff7ad', '#dcfce7', '#dbeafe', '#ffe4e6', '#fef3c7']
const noteRotations = ['-1.2deg', '0.8deg', '-0.5deg', '1.1deg']

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
        <section className="min-h-[calc(100vh-330px)] rounded-lg border border-black bg-[#f4f1e8] p-4 shadow-[6px_6px_0_#000]">
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {activePages.map((page, index) => {
            const publicPath = getPublicPagePath(page.slug)
            const publicUrl = `${origin}${publicPath}`
            const noteColor = noteColors[index % noteColors.length]
            const noteRotation = noteRotations[index % noteRotations.length]

            return (
              <article
                key={page.slug}
                className="windy-note relative flex flex-col rounded-sm border border-black p-3 shadow-[4px_4px_0_rgba(0,0,0,0.22)]"
                style={{
                  backgroundColor: noteColor,
                  ['--note-rotation' as string]: noteRotation,
                  ['--note-delay' as string]: `${index * -0.8}s`,
                }}
              >
                <span
                  aria-hidden="true"
                  className="absolute left-1/2 top-0 h-5 w-20 -translate-x-1/2 -translate-y-2 rotate-1 border border-black bg-white/70"
                />
                <div className="min-w-0 flex-1">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="m-0 truncate text-base font-black text-(--sea-ink)">
                        {page.businessName}
                      </h2>
                      <p className="m-0 mt-0.5 text-[11px] font-bold uppercase text-(--sea-ink-soft)">
                        {page.tiers.length} plans
                      </p>
                    </div>
                    <span
                      className="h-3.5 w-3.5 shrink-0 rounded-full border border-black"
                      style={{ backgroundColor: page.accentColor }}
                    />
                  </div>

                  <p className="m-0 line-clamp-1 text-xs leading-5 text-(--sea-ink-soft)">
                    {page.headline}
                  </p>

                  <div className="mt-3">
                    <p className="m-0 mb-1.5 text-[11px] font-bold uppercase text-(--sea-ink-soft)">
                      Tier pricing
                    </p>
                    <div className="divide-y divide-neutral-300 rounded-md border border-(--line) bg-white/60">
                      {page.tiers.map((tier) => (
                        <div
                          key={tier.id}
                          className="flex min-h-8 items-center justify-between gap-2 px-2.5 py-1.5 text-xs"
                        >
                          <span className="min-w-0 truncate font-semibold text-(--sea-ink)">
                            {tier.name}
                          </span>
                          <span className="shrink-0 font-bold text-(--sea-ink)">
                            {page.currency}
                            {tier.price}
                            <span className="font-semibold text-(--sea-ink-soft)">
                              /{tier.cycle}
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <CopyRow
                    className="mt-3 bg-white/60"
                    icon={<LinkIcon size={16} aria-hidden="true" />}
                    label="Public page"
                    value={publicUrl}
                    title="Copy public URL"
                  />
                  <CopyRow
                    className="mt-2 bg-white/60"
                    icon={<Wallet size={16} aria-hidden="true" />}
                    label="Payment address"
                    value={page.walletAddress}
                    title="Copy payment address"
                  />
                </div>

                {/* <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link
                      to="/pages/$slug"
                      params={{ slug: page.slug }}
                      className="no-underline"
                    >
                      <ExternalLink size={15} aria-hidden="true" />
                      Page
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <a href={page.checkoutUrl} className="no-underline">
                      <ExternalLink size={15} aria-hidden="true" />
                      Checkout
                    </a>
                  </Button>
                </div> */}
              </article>
            )
          })}
          </div>
        </section>
      )}
    </main>
  )
}

function CopyRow({
  className,
  icon,
  label,
  value,
  title,
}: {
  className?: string
  icon: ReactNode
  label: string
  value: string
  title: string
}) {
  return (
    <div
      className={`flex min-h-8 items-center gap-2 rounded-md border border-(--line) bg-(--surface-muted) px-2.5 text-[11px] text-(--sea-ink-soft) ${className ?? ''}`}
    >
      <span className="shrink-0">{icon}</span>
      <div className="min-w-0 flex-1">
        <span className="sr-only">{label}</span>
        <span className="block truncate">{value}</span>
      </div>
      <Button
        type="button"
        size="icon"
        variant="outline"
        className="h-6 w-6"
        title={title}
        onClick={() => void navigator.clipboard?.writeText(value)}
      >
        <Copy size={13} aria-hidden="true" />
        <span className="sr-only">{title}</span>
      </Button>
    </div>
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
