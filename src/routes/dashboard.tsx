import { createFileRoute, Link } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useEffect, useState, type ReactNode } from 'react'
import {
  BadgeDollarSign,
  Copy,
  ExternalLink,
  FilePlus2,
  Link as LinkIcon,
  LoaderCircle,
  Pencil,
  Plus,
  ReceiptText,
  Save,
  Trash2,
  Wallet,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import {
  PAYMENTS_QUERY_KEY,
  type CheckoutPayment,
  listCheckoutPayments,
} from '../lib/payments'
import {
  PAGES_QUERY_KEY,
  type SubscriptionPage,
  type Tier,
  createEmptyTier,
  getPublicPagePath,
  listSubscriptionPages,
  saveSubscriptionPage,
} from '../lib/subscriptionPage'

export const Route = createFileRoute('/dashboard')({ component: Dashboard })

function Dashboard() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const listSubscriptionPagesFn = useServerFn(listSubscriptionPages)
  const listCheckoutPaymentsFn = useServerFn(listCheckoutPayments)
  const saveSubscriptionPageFn = useServerFn(saveSubscriptionPage)
  const { data: pages = [], isPending } = useQuery({
    queryKey: PAGES_QUERY_KEY,
    queryFn: () => listSubscriptionPagesFn(),
  })
  const { data: payments = [], isPending: paymentsPending } = useQuery({
    queryKey: PAYMENTS_QUERY_KEY,
    queryFn: () => listCheckoutPaymentsFn(),
  })

  const origin =
    typeof window === 'undefined'
      ? 'https://usdc-checkout.local'
      : window.location.origin
  const activePages = pages.filter((page) => page.slug && page.walletAddress)
  const totalRevenue = payments.reduce(
    (sum, payment) => sum + payment.amountUsd,
    0,
  )
  const successfulPayments = payments.filter(
    (payment) => payment.status === 'confirmed',
  ).length
  const [selectedSlug, setSelectedSlug] = useState('')
  const selectedPage =
    activePages.find((page) => page.slug === selectedSlug) ?? activePages[0]
  const savePage = useMutation({
    mutationFn: (nextPage: SubscriptionPage) =>
      saveSubscriptionPageFn({ data: nextPage }),
    onSuccess: async (nextPage, savedDraft) => {
      queryClient.setQueryData<SubscriptionPage[]>(
        PAGES_QUERY_KEY,
        (currentPages) => {
          if (!currentPages) {
            return [nextPage]
          }

          let replacedSavedPage = false
          const updatedPages = currentPages.map((page) => {
            if (page.slug === savedDraft.slug || page.slug === nextPage.slug) {
              replacedSavedPage = true
              return nextPage
            }

            return page
          })

          return replacedSavedPage ? updatedPages : [nextPage, ...updatedPages]
        },
      )
      setSelectedSlug(nextPage.slug)
      await queryClient.invalidateQueries({ queryKey: PAGES_QUERY_KEY })
      toast({
        title: 'Checkout page updated',
        description: `${nextPage.businessName} has been saved.`,
      })
    },
    onError: (error) => {
      toast({
        title: 'Checkout was not saved',
        description:
          error instanceof Error
            ? error.message
            : 'Check the required fields and try again.',
      })
    },
  })

  useEffect(() => {
    if (!activePages.length) {
      setSelectedSlug('')
      return
    }

    if (!activePages.some((page) => page.slug === selectedSlug)) {
      setSelectedSlug(activePages[0].slug)
    }
  }, [activePages, selectedSlug])

  return (
    <main className="page-wrap min-h-[calc(100vh-230px)] px-4 py-8">
      <section className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="island-kicker mb-2">Dashboard</p>
        </div>

        <Button asChild>
          <Link to="/new" className="no-underline">
            <Plus size={16} aria-hidden="true" />
            Create New Checkout Page
          </Link>
        </Button>
      </section>

      {isPending || paymentsPending ? (
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
              No businesses found
            </h1>
            <p className="mx-auto mb-6 mt-3 max-w-sm text-sm leading-6 text-(--sea-ink-soft)">
              Create your first business pricing menu, add item tiers, and
              accept Solana wallet payments.
            </p>
            <Button asChild>
              <Link to="/new" className="no-underline">
                <Plus size={16} aria-hidden="true" />
                Create New Checkout Page
              </Link>
            </Button>
          </div>
        </section>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[290px_1fr_360px]">
          <ProjectSidebar
            pages={activePages}
            payments={payments}
            selectedSlug={selectedPage.slug}
            onSelect={setSelectedSlug}
          />

          <ProjectDetails
            page={selectedPage}
            payments={payments.filter(
              (payment) => payment.pageSlug === selectedPage.slug,
            )}
            origin={origin}
          />

          <aside className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                icon={<BadgeDollarSign size={18} aria-hidden="true" />}
                label="USDC volume"
                value={`$${totalRevenue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
              />
              <MetricCard
                icon={<ReceiptText size={18} aria-hidden="true" />}
                label="Payments"
                value={String(successfulPayments)}
              />
            </div>

            <ProjectEditor
              page={selectedPage}
              isSaving={savePage.isPending}
              onSave={(nextPage) => savePage.mutate(nextPage)}
            />

            <section className="island-shell rounded-lg p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="m-0 text-base font-black text-(--sea-ink)">
                  Recent payments
                </h2>
                <span className="rounded-md border border-black px-2 py-1 text-[11px] font-black">
                  USDC
                </span>
              </div>

              {payments.length === 0 ? (
                <p className="m-0 text-sm leading-6 text-(--sea-ink-soft)">
                  Completed wallet payments will appear here with the payer,
                  tier, amount, and transaction signature.
                </p>
              ) : (
                <div className="divide-y divide-(--line)">
                  {payments.slice(0, 8).map((payment) => (
                    <article key={payment.id} className="py-3 first:pt-0 last:pb-0">
                      <div className="mb-1 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="m-0 truncate text-sm font-black text-(--sea-ink)">
                            {payment.tierName}
                          </p>
                          <p className="m-0 mt-0.5 truncate text-xs text-(--sea-ink-soft)">
                            {payment.payerWallet}
                          </p>
                        </div>
                        <p className="m-0 shrink-0 text-sm font-black text-(--sea-ink)">
                          ${payment.amountUsd.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-2 text-[11px] font-bold uppercase text-(--sea-ink-soft)">
                        <span>{payment.status}</span>
                        <span>
                          {payment.signature.slice(0, 6)}...
                          {payment.signature.slice(-6)}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </aside>
        </div>
      )}
    </main>
  )
}

function ProjectSidebar({
  pages,
  payments,
  selectedSlug,
  onSelect,
}: {
  pages: SubscriptionPage[]
  payments: CheckoutPayment[]
  selectedSlug: string
  onSelect: (slug: string) => void
}) {
  return (
    <aside className="island-shell h-fit rounded-lg p-3 xl:sticky xl:top-24">
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <h2 className="m-0 text-base font-black text-(--sea-ink)">Projects</h2>
        <span className="rounded-md border border-black px-2 py-1 text-[11px] font-black">
          {pages.length}
        </span>
      </div>

      <div className="grid gap-2">
        {pages.map((page) => {
          const isSelected = page.slug === selectedSlug
          const pagePayments = payments.filter(
            (payment) => payment.pageSlug === page.slug,
          )

          return (
            <button
              key={page.slug}
              type="button"
              className={`min-h-20 rounded-md border border-black p-3 text-left ${
                isSelected
                  ? 'bg-black text-white shadow-[4px_4px_0_#a3a3a3]'
                  : 'bg-white text-black hover:bg-(--surface-muted)'
              }`}
              onClick={() => onSelect(page.slug)}
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <span className="min-w-0 truncate text-sm font-black">
                  {page.businessName}
                </span>
                <span
                  className={`h-3 w-3 shrink-0 rounded-full border ${
                    isSelected ? 'border-white' : 'border-black'
                  }`}
                  style={{ backgroundColor: page.accentColor }}
                />
              </div>
              <span
                className={`block text-[11px] font-bold uppercase ${
                  isSelected ? 'text-neutral-300' : 'text-(--sea-ink-soft)'
                }`}
              >
                {page.tiers.length} tiers · {pagePayments.length} payments
              </span>
            </button>
          )
        })}
      </div>
    </aside>
  )
}

function ProjectEditor({
  page,
  isSaving,
  onSave,
}: {
  page: SubscriptionPage
  isSaving: boolean
  onSave: (page: SubscriptionPage) => void
}) {
  const [draft, setDraft] = useState(page)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setDraft(page)
    setIsOpen(false)
  }, [page])

  const updateDraft = (recipe: (page: SubscriptionPage) => SubscriptionPage) => {
    setDraft((current) => recipe(current))
  }

  const updateTier = (id: string, patch: Partial<Tier>) => {
    updateDraft((current) => ({
      ...current,
      tiers: current.tiers.map((tier) =>
        tier.id === id ? { ...tier, ...patch } : tier,
      ),
    }))
  }

  const addTier = () => {
    updateDraft((current) => ({
      ...current,
      tiers: [...current.tiers, createEmptyTier()],
    }))
  }

  const removeTier = (id: string) => {
    updateDraft((current) => ({
      ...current,
      tiers:
        current.tiers.length <= 1
          ? current.tiers
          : current.tiers.filter((tier) => tier.id !== id),
    }))
  }

  return (
    <>
      <button
        type="button"
        className="island-shell flex w-full items-center justify-between gap-4 rounded-lg p-4 text-left hover:bg-(--surface-muted)"
        onClick={() => setIsOpen(true)}
      >
        <span className="min-w-0">
          <span className="mb-1 flex items-center gap-2 text-base font-black text-(--sea-ink)">
            <Pencil size={17} aria-hidden="true" />
            Edit checkout page
          </span>
          <span className="block text-sm leading-6 text-(--sea-ink-soft)">
            Update business details and pricing tiers.
          </span>
        </span>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-black bg-white">
          <Pencil size={16} aria-hidden="true" />
        </span>
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-100 grid place-items-center overflow-y-auto bg-black/35 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-editor-title"
        >
          <section className="island-shell my-6 max-h-[calc(100vh-3rem)] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-4 sm:p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="island-kicker mb-2">Edit checkout</p>
                <h2
                  id="project-editor-title"
                  className="m-0 text-2xl font-black text-(--sea-ink)"
                >
                  {page.businessName}
                </h2>
              </div>
              <Button
                type="button"
                size="icon"
                variant="outline"
                title="Close editor"
                onClick={() => setIsOpen(false)}
              >
                <X size={16} aria-hidden="true" />
                <span className="sr-only">Close editor</span>
              </Button>
            </div>

            <div className="mb-4 flex items-center justify-end gap-3 border-b border-(--line) pb-4">
              <Button
                type="button"
                disabled={isSaving}
                onClick={() => onSave(draft)}
              >
                <Save size={15} aria-hidden="true" />
                {isSaving ? 'Saving...' : 'Save changes'}
              </Button>
            </div>

            <div className="grid gap-3">
              <label className="block">
                <span className="field-label">
                  Business name <span aria-hidden="true">*</span>
                </span>
                <input
                  className="field-input field-input-compact"
                  value={draft.businessName}
                  onChange={(event) =>
                    updateDraft((current) => ({
                      ...current,
                      businessName: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="block">
                <span className="field-label">Headline</span>
                <textarea
                  className="field-input min-h-20 resize-y leading-6"
                  value={draft.headline}
                  onChange={(event) =>
                    updateDraft((current) => ({
                      ...current,
                      headline: event.target.value,
                    }))
                  }
                />
              </label>
            </div>

            <div className="my-4 border-t border-(--line)" />

            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="m-0 text-sm font-black text-(--sea-ink)">Tiers</h3>
              <Button type="button" size="sm" variant="outline" onClick={addTier}>
                <Plus size={15} aria-hidden="true" />
                Add tier
              </Button>
            </div>

            <div className="grid gap-3">
              {draft.tiers.map((tier, index) => (
                <article
                  key={tier.id}
                  className="rounded-md border border-(--line) bg-white p-3"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="m-0 text-sm font-black text-(--sea-ink)">
                      Tier {index + 1}
                    </p>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      title="Delete tier"
                      disabled={draft.tiers.length <= 1}
                      onClick={() => removeTier(tier.id)}
                    >
                      <Trash2 size={14} aria-hidden="true" />
                      <span className="sr-only">Delete tier</span>
                    </Button>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-[1fr_140px]">
                    <label className="block">
                      <span className="field-label">
                        Item or service <span aria-hidden="true">*</span>
                      </span>
                      <input
                        className="field-input field-input-compact"
                        value={tier.name}
                        onChange={(event) =>
                          updateTier(tier.id, { name: event.target.value })
                        }
                      />
                    </label>

                    <label className="block">
                      <span className="field-label">
                        Price <span aria-hidden="true">*</span>
                      </span>
                      <span className="flex min-h-10 items-center gap-1 rounded-md border border-black bg-white px-3">
                        <span className="font-black">{draft.currency}</span>
                        <input
                          className="min-w-0 flex-1 border-0 bg-transparent text-base font-black outline-none"
                          type="number"
                          min="0"
                          value={tier.price > 0 ? String(tier.price) : ''}
                          onChange={(event) =>
                            updateTier(tier.id, {
                              price: Number(event.target.value),
                            })
                          }
                        />
                      </span>
                    </label>
                  </div>

                  <label className="mt-2 block">
                    <span className="field-label">Description</span>
                    <input
                      className="field-input field-input-compact"
                      value={tier.description}
                      onChange={(event) =>
                        updateTier(tier.id, { description: event.target.value })
                      }
                    />
                  </label>
                </article>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </>
  )
}

function ProjectDetails({
  page,
  payments,
  origin,
}: {
  page: SubscriptionPage
  payments: CheckoutPayment[]
  origin: string
}) {
  const publicPath = getPublicPagePath(page.slug)
  const publicUrl = `${origin}${publicPath}`
  const revenue = payments.reduce((sum, payment) => sum + payment.amountUsd, 0)

  return (
    <section className="min-w-0 space-y-5">
      <article className="island-shell rounded-lg p-5">
        <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div className="min-w-0">
            <p className="island-kicker mb-2">Selected project</p>
            <div className="flex items-center gap-3">
              <span
                className="h-4 w-4 shrink-0 rounded-full border border-black"
                style={{ backgroundColor: page.accentColor }}
              />
              <h1 className="m-0 truncate text-3xl font-black text-(--sea-ink)">
                {page.businessName}
              </h1>
            </div>
            {page.headline ? (
              <p className="m-0 mt-3 max-w-2xl text-base leading-7 text-(--sea-ink-soft)">
                {page.headline}
              </p>
            ) : null}
            {page.subheadline ? (
              <p className="m-0 mt-2 max-w-2xl text-sm leading-6 text-(--sea-ink-soft)">
                {page.subheadline}
              </p>
            ) : null}
          </div>

          <Button asChild variant="outline">
            <a
              href={getPublicPagePath(page.slug)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink size={16} aria-hidden="true" />
              Open
            </a>
          </Button>
        </div>

        <div className="grid border-y border-black md:grid-cols-3">
          <ProjectStat
            icon={<ReceiptText size={18} aria-hidden="true" />}
            label="Project payments"
            value={String(payments.length)}
          />
          <ProjectStat
            icon={<BadgeDollarSign size={18} aria-hidden="true" />}
            label="Project volume"
            value={`$${revenue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
          />
          <ProjectStat
            icon={<LinkIcon size={18} aria-hidden="true" />}
            label="Pricing tiers"
            value={String(page.tiers.length)}
          />
        </div>

        <div className="mt-5 grid gap-3">
          <CopyRow
            className="bg-white"
            icon={<LinkIcon size={16} aria-hidden="true" />}
            label="Checkout page"
            value={publicUrl}
            title="Copy public URL"
          />
          <CopyRow
            className="bg-white"
            icon={<Wallet size={16} aria-hidden="true" />}
            label="USDC receiving wallet"
            value={page.walletAddress}
            title="Copy payment address"
          />
        </div>
      </article>

      <section className="overflow-hidden rounded-lg border border-black bg-white">
        {page.tiers.map((tier, index) => {
          const tierUrl = `${publicUrl}?tier=${index + 1}`

          return (
            <a
              key={tier.id}
              href={tierUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="grid gap-2 border-b border-(--line) p-3 text-black no-underline last:border-b-0 hover:bg-(--surface-muted) md:grid-cols-[1fr_130px] md:items-center"
            >
              <div className="min-w-0">
                <h2 className="m-0 truncate text-base font-black text-(--sea-ink)">
                  {tier.name}
                </h2>
                {tier.description ? (
                  <p className="m-0 mt-0.5 line-clamp-2 text-xs leading-5 text-(--sea-ink-soft)">
                    {tier.description}
                  </p>
                ) : null}
              </div>

              <p className="m-0 text-xl font-black text-(--sea-ink) md:text-right">
                {page.currency}
                {tier.price}
              </p>
            </a>
          )
        })}
      </section>
    </section>
  )
}

function ProjectStat({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex min-h-24 items-center gap-3 border-b border-black py-4 last:border-b-0 md:border-b-0 md:border-r md:px-4 md:first:pl-0 md:last:border-r-0 md:last:pr-0">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-black">
        {icon}
      </div>
      <div>
        <p className="m-0 text-[11px] font-black uppercase text-(--sea-ink-soft)">
          {label}
        </p>
        <p className="m-0 mt-1 text-2xl font-black text-(--sea-ink)">{value}</p>
      </div>
    </div>
  )
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <section className="island-shell rounded-lg p-4">
      <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-md border border-black">
        {icon}
      </div>
      <p className="m-0 text-[11px] font-black uppercase text-(--sea-ink-soft)">
        {label}
      </p>
      <p className="m-0 mt-1 text-2xl font-black text-(--sea-ink)">{value}</p>
    </section>
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
    <div className="grid gap-5 xl:grid-cols-[290px_1fr_360px]">
      <aside className="island-shell h-fit rounded-lg p-3 xl:sticky xl:top-24">
        <div className="mb-3 flex items-center justify-between gap-3 px-1">
          <div className="h-5 w-20 rounded-md bg-(--surface-muted)" />
          <div className="h-7 w-9 rounded-md border border-black bg-white" />
        </div>

        <div className="grid gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="min-h-20 rounded-md border border-black bg-white p-3"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="h-4 w-36 rounded-md bg-(--surface-muted)" />
                <div className="h-3 w-3 shrink-0 rounded-full border border-black bg-(--surface-muted)" />
              </div>
              <div className="h-3 w-28 rounded-md bg-(--surface-muted)" />
            </div>
          ))}
        </div>
      </aside>

      <section className="min-w-0 space-y-5">
        <article className="island-shell rounded-lg p-5">
          <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div className="min-w-0 flex-1">
              <div className="mb-3 h-3 w-28 rounded-full bg-(--surface-muted)" />
              <h1 className="m-0 flex items-center gap-3 text-2xl font-black text-(--sea-ink)">
                <LoaderCircle
                  size={22}
                  aria-hidden="true"
                  className="animate-spin"
                />
                Loading dashboard
              </h1>
              <div className="mt-4 h-4 w-full max-w-xl rounded-md bg-(--surface-muted)" />
              <div className="mt-3 h-3 w-full max-w-lg rounded-md bg-(--surface-muted)" />
            </div>

            <div className="h-10 w-full rounded-md border border-black bg-white sm:w-28" />
          </div>

          <div className="grid border-y border-black md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="flex min-h-24 items-center gap-3 border-b border-black py-4 last:border-b-0 md:border-b-0 md:border-r md:px-4 md:first:pl-0 md:last:border-r-0 md:last:pr-0"
              >
                <div className="h-8 w-8 shrink-0 rounded-md border border-black bg-white" />
                <div className="min-w-0 flex-1">
                  <div className="h-3 w-24 rounded-md bg-(--surface-muted)" />
                  <div className="mt-2 h-6 w-16 rounded-md bg-(--surface-muted)" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-3">
            <div className="h-8 rounded-md border border-(--line) bg-(--surface-muted)" />
            <div className="h-8 rounded-md border border-(--line) bg-(--surface-muted)" />
          </div>
        </article>

        <section className="overflow-hidden rounded-lg border border-black bg-white">
          {Array.from({ length: 3 }).map((_, index) => (
            <article
              key={index}
              className="grid gap-2 border-b border-(--line) p-3 last:border-b-0 md:grid-cols-[1fr_130px] md:items-center"
            >
              <div className="min-w-0">
                <div className="h-5 w-36 rounded-md bg-(--surface-muted)" />
                <div className="mt-1 h-3 w-full max-w-md rounded-md bg-(--surface-muted)" />
              </div>
              <div className="h-7 w-20 rounded-md bg-(--surface-muted) md:ml-auto" />
            </article>
          ))}
        </section>
      </section>

      <aside className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <section className="island-shell rounded-lg p-4">
            <div className="mb-4 h-8 w-8 rounded-md border border-black bg-white" />
            <div className="h-3 w-20 rounded-md bg-(--surface-muted)" />
            <div className="mt-2 h-7 w-24 rounded-md bg-(--surface-muted)" />
          </section>
          <section className="island-shell rounded-lg p-4">
            <div className="mb-4 h-8 w-8 rounded-md border border-black bg-white" />
            <div className="h-3 w-16 rounded-md bg-(--surface-muted)" />
            <div className="mt-2 h-7 w-12 rounded-md bg-(--surface-muted)" />
          </section>
        </div>

        <section className="island-shell rounded-lg p-4">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="h-5 w-32 rounded-md bg-(--surface-muted)" />
            <div className="h-7 w-14 rounded-md border border-black bg-white" />
          </div>
          <div className="grid gap-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="border-b border-(--line) pb-4 last:border-b-0 last:pb-0">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div className="h-4 w-28 rounded-md bg-(--surface-muted)" />
                  <div className="h-4 w-14 rounded-md bg-(--surface-muted)" />
                </div>
                <div className="h-3 w-full rounded-md bg-(--surface-muted)" />
              </div>
            ))}
          </div>
        </section>
      </aside>
    </div>
  )
}
