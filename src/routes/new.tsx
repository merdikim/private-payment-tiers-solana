import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useState, type ReactNode } from 'react'
import {
  Link as LinkIcon,
  Save,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import {
  PAGE_QUERY_KEY,
  PAGES_QUERY_KEY,
  type BillingCycle,
  type SubscriptionPage,
  type Tier,
  createSlugFromBusinessName,
  draftSubscriptionPage,
  saveSubscriptionPage,
} from '../lib/subscriptionPage'

export const Route = createFileRoute('/new')({
  component: NewCheckoutPage,
})

const pagePlaceholders = {
  businessName: 'Business name',
  headline: 'A clear headline for your pricing page.',
  subheadline: 'A short description of what customers get after subscribing.',
  checkoutUrl: 'https://your-checkout-link.com',
  walletAddress: 'Solana wallet address',
}

const tierPlaceholders = [
  {
    name: 'Launch',
    description: 'For customers getting started.',
    price: '29',
    cta: 'Choose Launch',
    features: 'Core access\nHosted checkout page\nEmail support',
  },
  {
    name: 'Growth',
    description: 'For teams ready to grow.',
    price: '89',
    cta: 'Choose Growth',
    features: 'Everything in Launch\nMore usage\nPriority support',
  },
  {
    name: 'Scale',
    description: 'For larger businesses.',
    price: '249',
    cta: 'Contact Sales',
    features: 'Custom limits\nAdvanced workflows\nDedicated onboarding',
  },
]

const requiredPageFields = [
  { label: 'Business name', key: 'businessName' },
  { label: 'Wallet address', key: 'walletAddress' },
  { label: 'Headline', key: 'headline' },
  { label: 'Checkout URL', key: 'checkoutUrl' },
] as const

function createBlankPage(): SubscriptionPage {
  return withSingleRecommendedTier({
    ...draftSubscriptionPage,
    tiers: draftSubscriptionPage.tiers.map((tier) => ({
      ...tier,
    })),
  })
}

function withSingleRecommendedTier(page: SubscriptionPage): SubscriptionPage {
  const recommendedTierId =
    page.tiers.find((tier) => tier.featured)?.id ?? page.tiers[0]?.id

  return {
    ...page,
    tiers: page.tiers.map((tier) => ({
      ...tier,
      featured: tier.id === recommendedTierId,
    })),
  }
}

function NewCheckoutPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const saveSubscriptionPageFn = useServerFn(saveSubscriptionPage)
  const [page, setPage] = useState<SubscriptionPage>(() => createBlankPage())

  const savePage = useMutation({
    mutationFn: (nextPage: SubscriptionPage) =>
      saveSubscriptionPageFn({ data: nextPage }),
    onSuccess: async (nextPage) => {
      queryClient.setQueryData(PAGE_QUERY_KEY, nextPage)
      await queryClient.invalidateQueries({ queryKey: PAGES_QUERY_KEY })
      await navigate({ to: '/dashboard' })
    },
    onError: (error) => {
      toast({
        title: 'Page was not saved',
        description:
          error instanceof Error
            ? error.message
            : 'Check your database connection and try again.',
      })
    },
  })

  const updatePage = (recipe: (page: SubscriptionPage) => SubscriptionPage) => {
    setPage((current) => recipe(current))
  }

  const publishPage = () => {
    const missingFields = requiredPageFields
      .filter((field) => !page[field.key].trim())
      .map((field) => field.label)

    if (missingFields.length > 0) {
      toast({
        title: 'Required details missing',
        description: `Add: ${missingFields.join(', ')}`,
      })
      return
    }

    savePage.mutate(withSingleRecommendedTier(page))
  }

  return (
    <main className="page-wrap px-4 py-8">
      <section className="mb-6 grid gap-4 lg:grid-cols-[1fr_340px]">
        <div>
          <h1 className="mb-3 max-w-4xl text-xxl font-bold tracking-tight text-(--sea-ink) sm:text-3xl">
            Create a checkout page for a business.
          </h1>
          <p className="max-w-3xl text-base leading-7 text-(--sea-ink-soft)">
            Enter brand details, shape the plan cards, and publish the link back
            to the dashboard.
          </p>
        </div>

        <div className="island-shell rounded-lg p-4">
          {/* <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="m-0 text-sm font-semibold text-(--sea-ink)">
                Generated link
              </p>
              <p className="m-0 text-xs text-(--sea-ink-soft)">
                Based on the business name.
              </p>
            </div>
            <Button asChild size="icon" variant="outline" title="Preview public page">
              <Link to="/pages/$slug" params={{ slug: page.slug }}>
                <Eye size={17} aria-hidden="true" />
                <span className="sr-only">Preview public page</span>
              </Link>
            </Button>
          </div>
          <div className="flex min-h-11 items-center gap-2 rounded-md border border-(--line) bg-(--surface-muted) px-3 text-sm text-(--sea-ink-soft)">
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
          </div> */}
          <Button
            type="button"
            className="mt-3 w-full"
            disabled={savePage.isPending}
            onClick={publishPage}
          >
            <Save size={15} aria-hidden="true" />
            {savePage.isPending ? 'Publishing...' : 'Publish checkout'}
          </Button>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[410px_1fr]">
        <div className="space-y-5">
          <Panel title="Brand and page" icon={<LinkIcon size={17} />}>
            <Field
              label="Business name"
              value={page.businessName}
              placeholder={pagePlaceholders.businessName}
              required
              onChange={(businessName) =>
                updatePage((current) => ({
                  ...current,
                  businessName,
                  slug: createSlugFromBusinessName(businessName),
                }))
              }
            />
            <Field
              label="Wallet address"
              value={page.walletAddress}
              placeholder={pagePlaceholders.walletAddress}
              required
              onChange={(walletAddress) =>
                updatePage((current) => ({ ...current, walletAddress }))
              }
            />
            <TextArea
              label="Headline"
              value={page.headline}
              placeholder={pagePlaceholders.headline}
              required
              onChange={(headline) =>
                updatePage((current) => ({ ...current, headline }))
              }
            />
            <TextArea
              label="Subheadline"
              value={page.subheadline}
              placeholder={pagePlaceholders.subheadline}
              onChange={(subheadline) =>
                updatePage((current) => ({ ...current, subheadline }))
              }
            />
            <Field
              label="Checkout URL"
              value={page.checkoutUrl}
              placeholder={pagePlaceholders.checkoutUrl}
              required
              onChange={(checkoutUrl) =>
                updatePage((current) => ({ ...current, checkoutUrl }))
              }
            />
          </Panel>
        </div>

        <PricingPreview page={page} updatePage={updatePage} />
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
        <h2 className="m-0 flex items-center gap-2 text-base font-bold text-(--sea-ink)">
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
  placeholder,
  required = false,
  type = 'text',
  onChange,
}: {
  label: string
  value: string
  placeholder?: string
  required?: boolean
  type?: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="field-label">
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </span>
      <input
        className="field-input"
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        aria-required={required}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function TextArea({
  label,
  value,
  placeholder,
  required = false,
  onChange,
}: {
  label: string
  value: string
  placeholder?: string
  required?: boolean
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="field-label">
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </span>
      <textarea
        className="field-input min-h-24 resize-y leading-6"
        value={value}
        placeholder={placeholder}
        required={required}
        aria-required={required}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function PricingPreview({
  page,
  updatePage,
}: {
  page: SubscriptionPage
  updatePage: (recipe: (page: SubscriptionPage) => SubscriptionPage) => void
}) {
  const recommendedTierId =
    page.tiers.find((tier) => tier.featured)?.id ?? page.tiers[0]?.id

  const updateTier = (id: string, patch: Partial<Tier>) => {
    updatePage((current) => ({
      ...current,
      tiers: current.tiers.map((tier) =>
        tier.id === id ? { ...tier, ...patch } : tier,
      ),
    }))
  }

  const setRecommendedTier = (id: string) => {
    updatePage((current) => ({
      ...current,
      tiers: current.tiers.map((tier) => ({
        ...tier,
        featured: tier.id === id,
      })),
    }))
  }

  const renderTierEditor = (tier: Tier, index: number) => {
    const isRecommended = tier.id === recommendedTierId
    const placeholders =
      tierPlaceholders[index] ?? tierPlaceholders[tierPlaceholders.length - 1]

    return (
      <article
        key={tier.id}
        className={cn(
          'rounded-lg border p-4',
          isRecommended ? 'bg-black' : 'bg-white',
        )}
        style={{
          borderColor: isRecommended ? '#000000' : 'var(--line)',
        }}
      >
        <div>
          <div className="mb-3 flex min-h-8 items-center gap-3">
            <label
              className={cn(
                'inline-flex items-center gap-2 text-xs font-bold',
                isRecommended ? 'text-white' : 'text-slate-700',
              )}
            >
              <input
                type="radio"
                name="recommended-tier"
                checked={isRecommended}
                onChange={() => setRecommendedTier(tier.id)}
              />
              Recommended
            </label>
          </div>

          <label className="block">
            <span className="sr-only">Tier name</span>
            <input
              className={cn(
                'tier-card-input text-lg font-bold',
                isRecommended ? 'text-white' : 'text-slate-950',
                isRecommended && 'tier-card-input-inverted',
              )}
              value={tier.name}
              placeholder={placeholders.name}
              onChange={(event) => updateTier(tier.id, { name: event.target.value })}
            />
          </label>

          <label className="mt-2 block">
            <span className="sr-only">Tier description</span>
            <textarea
              className={cn(
                'tier-card-input min-h-16 resize-y text-sm leading-6',
                isRecommended ? 'text-neutral-200' : 'text-slate-600',
                isRecommended && 'tier-card-input-inverted',
              )}
              value={tier.description}
              placeholder={placeholders.description}
              onChange={(event) =>
                updateTier(tier.id, { description: event.target.value })
              }
            />
          </label>
        </div>

        <div>
          <div className="mt-3 grid grid-cols-[1fr_116px] items-end gap-2">
            <label className="block">
              <span className="sr-only">Tier price</span>
              <span
                className={cn(
                  'flex items-center gap-1 text-3xl font-bold',
                  isRecommended ? 'text-white' : 'text-slate-950',
                )}
              >
                {page.currency}
                <input
                  className={cn(
                    'tier-card-input min-w-0 text-3xl font-bold',
                    isRecommended ? 'text-white' : 'text-slate-950',
                    isRecommended && 'tier-card-input-inverted',
                  )}
                  type="number"
                  value={tier.price > 0 ? String(tier.price) : ''}
                  placeholder={placeholders.price}
                  onChange={(event) =>
                    updateTier(tier.id, { price: Number(event.target.value) })
                  }
                />
              </span>
            </label>
            <label className="block">
              <span className="sr-only">Billing cycle</span>
              <select
                value={tier.cycle}
                className={cn(
                  'tier-card-input h-10 text-sm font-semibold',
                  isRecommended ? 'text-neutral-200' : 'text-slate-500',
                  isRecommended && 'tier-card-input-inverted',
                )}
                onChange={(event) =>
                  updateTier(tier.id, {
                    cycle: event.target.value as BillingCycle,
                  })
                }
              >
                <option value="month">/month</option>
                <option value="year">/year</option>
              </select>
            </label>
          </div>

          <label className="mt-4 block">
            <span className="sr-only">Button text</span>
            <input
              className={cn(
                'tier-card-cta',
                isRecommended && 'tier-card-cta-inverted',
              )}
              style={{
                backgroundColor: isRecommended ? '#ffffff' : '#000000',
                color: isRecommended ? '#000000' : '#ffffff',
              }}
              value={tier.cta}
              placeholder={placeholders.cta}
              onChange={(event) => updateTier(tier.id, { cta: event.target.value })}
            />
          </label>
        </div>

        <label className="mt-4 block">
          <span className="sr-only">Features</span>
          <textarea
            className={cn(
              'tier-card-input min-h-32 resize-y text-sm leading-7',
              isRecommended ? 'text-neutral-100' : 'text-slate-700',
              isRecommended && 'tier-card-input-inverted',
            )}
            value={tier.features.join('\n')}
            placeholder={placeholders.features}
            onChange={(event) =>
              updateTier(tier.id, {
                features: event.target.value
                  .split('\n')
                  .map((feature) => feature.trim())
                  .filter(Boolean),
              })
            }
          />
        </label>
      </article>
    )
  }

  return (
    <section className="overflow-hidden rounded-lg border border-(--line) bg-white">
      <div className="border-t-5 border-black bg-white p-5">
        <p className="m-0 text-sm font-bold text-black">
          {page.businessName || pagePlaceholders.businessName}
        </p>
        <h2 className="mb-2 mt-2 max-w-3xl text-2xl font-bold text-slate-950">
          {page.headline || pagePlaceholders.headline}
        </h2>
        <p className="m-0 max-w-3xl text-sm leading-6 text-slate-600">
          {page.subheadline || pagePlaceholders.subheadline}
        </p>
      </div>
      <div
        className="grid gap-4 p-5 lg:grid-cols-3"
      >
        {page.tiers.map(renderTierEditor)}
      </div>
    </section>
  )
}
