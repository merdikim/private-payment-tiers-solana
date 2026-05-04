import { createFileRoute, Link } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import {
  CheckCircle2,
  Copy,
  Eye,
  Link as LinkIcon,
  Palette,
  Plus,
  Save,
  Trash2,
} from 'lucide-react'
import {
  PAGE_QUERY_KEY,
  type SubscriptionPage,
  createEmptyTier,
  defaultSubscriptionPage,
  getPublicPagePath,
  getSubscriptionPage,
  saveSubscriptionPage,
} from '../lib/subscriptionPage'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/dashboard')({ component: Dashboard })

function Dashboard() {
  const queryClient = useQueryClient()
  const { data: page = defaultSubscriptionPage } = useQuery({
    queryKey: PAGE_QUERY_KEY,
    queryFn: getSubscriptionPage,
    initialData: defaultSubscriptionPage,
  })

  const savePage = useMutation({
    mutationFn: saveSubscriptionPage,
    onSuccess: (nextPage) => {
      queryClient.setQueryData(PAGE_QUERY_KEY, nextPage)
    },
  })

  const updatePage = (recipe: (page: SubscriptionPage) => SubscriptionPage) => {
    savePage.mutate(recipe(page))
  }

  const publicPath = getPublicPagePath(page.slug)
  const origin =
    typeof window === 'undefined' ? 'https://tierflow.local' : window.location.origin
  const publicUrl = `${origin}${publicPath}`

  return (
    <main className="page-wrap px-4 py-8">
      <section className="mb-6 grid gap-4 lg:grid-cols-[1fr_340px]">
        <div>
          <p className="island-kicker mb-2">Workspace</p>
          <h1 className="mb-3 max-w-4xl text-3xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-5xl">
            Build subscription pages businesses can link from their pricing
            area.
          </h1>
          <p className="max-w-3xl text-base leading-7 text-[var(--sea-ink-soft)]">
            Configure brand details, plans, billing copy, checkout links, and a
            hosted public page from one operational view.
          </p>
        </div>

        <div className="island-shell rounded-lg p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="m-0 text-sm font-semibold text-[var(--sea-ink)]">
                Share link
              </p>
              <p className="m-0 text-xs text-[var(--sea-ink-soft)]">
                Add this URL to an app pricing section.
              </p>
            </div>
            <Button asChild size="icon" variant="outline" title="Open public page">
              <Link to="/pages/$slug" params={{ slug: page.slug }}>
                <Eye size={17} aria-hidden="true" />
                <span className="sr-only">Open public page</span>
              </Link>
            </Button>
          </div>
          <div className="flex min-h-11 items-center gap-2 rounded-md border border-[var(--line)] bg-[var(--surface-muted)] px-3 text-sm text-[var(--sea-ink-soft)]">
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
      </section>

      <section className="grid gap-5 xl:grid-cols-[410px_1fr]">
        <div className="space-y-5">
          <Panel title="Brand and page" icon={<Palette size={17} />}>
            <Field
              label="Business name"
              value={page.businessName}
              onChange={(businessName) =>
                updatePage((current) => ({ ...current, businessName }))
              }
            />
            <Field
              label="Page slug"
              value={page.slug}
              onChange={(slug) =>
                updatePage((current) => ({
                  ...current,
                  slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                }))
              }
            />
            <TextArea
              label="Headline"
              value={page.headline}
              onChange={(headline) =>
                updatePage((current) => ({ ...current, headline }))
              }
            />
            <TextArea
              label="Subheadline"
              value={page.subheadline}
              onChange={(subheadline) =>
                updatePage((current) => ({ ...current, subheadline }))
              }
            />
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Accent"
                type="color"
                value={page.accentColor}
                onChange={(accentColor) =>
                  updatePage((current) => ({ ...current, accentColor }))
                }
              />
              <Field
                label="Background"
                type="color"
                value={page.backgroundColor}
                onChange={(backgroundColor) =>
                  updatePage((current) => ({ ...current, backgroundColor }))
                }
              />
            </div>
            <div className="grid grid-cols-[90px_1fr] gap-3">
              <Field
                label="Currency"
                value={page.currency}
                onChange={(currency) =>
                  updatePage((current) => ({ ...current, currency }))
                }
              />
              <Field
                label="Checkout URL"
                value={page.checkoutUrl}
                onChange={(checkoutUrl) =>
                  updatePage((current) => ({ ...current, checkoutUrl }))
                }
              />
            </div>
          </Panel>

          <Panel
            title="Plan controls"
            icon={<Save size={17} />}
            action={
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  updatePage((current) => ({
                    ...current,
                    tiers: [...current.tiers, createEmptyTier()],
                  }))
                }
              >
                <Plus size={15} aria-hidden="true" />
                Add tier
              </Button>
            }
          >
            <div className="grid grid-cols-3 gap-3">
              <Metric label="Plans" value={page.tiers.length} />
              <Metric
                label="Featured"
                value={page.tiers.filter((tier) => tier.featured).length}
              />
              <Metric
                label="Lowest"
                value={`${page.currency}${Math.min(...page.tiers.map((tier) => tier.price))}`}
              />
            </div>
            <p className="m-0 text-sm text-[var(--sea-ink-soft)]">
              Changes save through React Query mutations and are persisted in
              localStorage for this prototype.
            </p>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel title="Tiers" icon={<CheckCircle2 size={17} />}>
            <div className="grid gap-4 lg:grid-cols-2">
              {page.tiers.map((tier) => (
                <article
                  key={tier.id}
                  className="rounded-lg border border-[var(--line)] bg-white p-4"
                >
                  <div className="mb-3 flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <Field
                        label="Name"
                        value={tier.name}
                        onChange={(name) =>
                          updatePage((current) => ({
                            ...current,
                            tiers: current.tiers.map((item) =>
                              item.id === tier.id ? { ...item, name } : item,
                            ),
                          }))
                        }
                      />
                    </div>
                    <Button
                      type="button"
                      className="mt-6"
                      size="icon"
                      variant="outline"
                      title="Remove tier"
                      onClick={() =>
                        updatePage((current) => ({
                          ...current,
                          tiers:
                            current.tiers.length > 1
                              ? current.tiers.filter((item) => item.id !== tier.id)
                              : current.tiers,
                        }))
                      }
                    >
                      <Trash2 size={16} aria-hidden="true" />
                      <span className="sr-only">Remove tier</span>
                    </Button>
                  </div>

                  <TextArea
                    label="Description"
                    value={tier.description}
                    onChange={(description) =>
                      updatePage((current) => ({
                        ...current,
                        tiers: current.tiers.map((item) =>
                          item.id === tier.id ? { ...item, description } : item,
                        ),
                      }))
                    }
                  />

                  <div className="grid grid-cols-[1fr_130px] gap-3">
                    <Field
                      label="Price"
                      type="number"
                      value={String(tier.price)}
                      onChange={(price) =>
                        updatePage((current) => ({
                          ...current,
                          tiers: current.tiers.map((item) =>
                            item.id === tier.id
                              ? { ...item, price: Number(price) }
                              : item,
                          ),
                        }))
                      }
                    />
                    <label className="block">
                      <span className="field-label">Cycle</span>
                      <select
                        value={tier.cycle}
                        className="field-input"
                        onChange={(event) =>
                          updatePage((current) => ({
                            ...current,
                            tiers: current.tiers.map((item) =>
                              item.id === tier.id
                                ? {
                                    ...item,
                                    cycle: event.target.value as 'month' | 'year',
                                  }
                                : item,
                            ),
                          }))
                        }
                      >
                        <option value="month">Monthly</option>
                        <option value="year">Yearly</option>
                      </select>
                    </label>
                  </div>

                  <Field
                    label="Button text"
                    value={tier.cta}
                    onChange={(cta) =>
                      updatePage((current) => ({
                        ...current,
                        tiers: current.tiers.map((item) =>
                          item.id === tier.id ? { ...item, cta } : item,
                        ),
                      }))
                    }
                  />

                  <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-[var(--sea-ink)]">
                    <input
                      type="checkbox"
                      checked={tier.featured}
                      onChange={(event) =>
                        updatePage((current) => ({
                          ...current,
                          tiers: current.tiers.map((item) =>
                            item.id === tier.id
                              ? { ...item, featured: event.target.checked }
                              : item,
                          ),
                        }))
                      }
                    />
                    Featured plan
                  </label>

                  <TextArea
                    label="Features"
                    value={tier.features.join('\n')}
                    onChange={(features) =>
                      updatePage((current) => ({
                        ...current,
                        tiers: current.tiers.map((item) =>
                          item.id === tier.id
                            ? {
                                ...item,
                                features: features
                                  .split('\n')
                                  .map((feature) => feature.trim())
                                  .filter(Boolean),
                              }
                            : item,
                        ),
                      }))
                    }
                  />
                </article>
              ))}
            </div>
          </Panel>

          <PricingPreview page={page} />
        </div>
      </section>
    </main>
  )
}

function Panel({
  title,
  icon,
  action,
  children,
}: {
  title: string
  icon: ReactNode
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="island-shell rounded-lg p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="m-0 flex items-center gap-2 text-base font-bold text-[var(--sea-ink)]">
          {icon}
          {title}
        </h2>
        {action}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

function Field({
  label,
  value,
  type = 'text',
  onChange,
}: {
  label: string
  value: string
  type?: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <input
        className="field-input"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <textarea
        className="field-input min-h-24 resize-y leading-6"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-[var(--line)] bg-[var(--surface-muted)] p-3">
      <p className="m-0 text-xs font-semibold uppercase text-[var(--sea-ink-soft)]">
        {label}
      </p>
      <p className="m-0 mt-1 text-xl font-bold text-[var(--sea-ink)]">{value}</p>
    </div>
  )
}

function PricingPreview({ page }: { page: SubscriptionPage }) {
  return (
    <section className="overflow-hidden rounded-lg border border-[var(--line)] bg-white">
      <div
        className="p-5"
        style={{
          backgroundColor: page.backgroundColor,
          borderTop: `5px solid ${page.accentColor}`,
        }}
      >
        <p className="m-0 text-sm font-bold" style={{ color: page.accentColor }}>
          {page.businessName}
        </p>
        <h2 className="mb-2 mt-2 max-w-3xl text-2xl font-bold text-slate-950">
          {page.headline}
        </h2>
        <p className="m-0 max-w-3xl text-sm leading-6 text-slate-600">
          {page.subheadline}
        </p>
      </div>
      <div className="grid gap-4 p-5 lg:grid-cols-3">
        {page.tiers.map((tier) => (
          <article
            key={tier.id}
            className="rounded-lg border p-4"
            style={{
              borderColor: tier.featured ? page.accentColor : 'var(--line)',
            }}
          >
            {tier.featured ? (
              <p
                className="m-0 mb-3 inline-flex rounded-md px-2 py-1 text-xs font-bold text-white"
                style={{ backgroundColor: page.accentColor }}
              >
                Recommended
              </p>
            ) : null}
            <h3 className="m-0 text-lg font-bold text-slate-950">{tier.name}</h3>
            <p className="min-h-12 text-sm leading-6 text-slate-600">
              {tier.description}
            </p>
            <p className="m-0 text-3xl font-bold text-slate-950">
              {page.currency}
              {tier.price}
              <span className="text-sm font-semibold text-slate-500">
                /{tier.cycle}
              </span>
            </p>
            <Button
              type="button"
              className="mt-4 w-full"
              style={{ backgroundColor: page.accentColor }}
            >
              {tier.cta}
            </Button>
            <ul className="mt-4 space-y-2 p-0 text-sm text-slate-700">
              {tier.features.map((feature) => (
                <li key={feature} className="flex gap-2">
                  <CheckCircle2
                    size={16}
                    aria-hidden="true"
                    style={{ color: page.accentColor }}
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
}
