export type BillingCycle = 'month' | 'year'

export type Tier = {
  id: string
  name: string
  description: string
  price: number
  cycle: BillingCycle
  cta: string
  featured: boolean
  features: string[]
}

export type SubscriptionPage = {
  slug: string
  businessName: string
  headline: string
  subheadline: string
  accentColor: string
  backgroundColor: string
  currency: string
  checkoutUrl: string
  walletAddress: string
  tiers: Tier[]
}

export const PAGE_QUERY_KEY = ['subscription-page', 'active']
export const PAGES_QUERY_KEY = ['subscription-pages']

const STORAGE_KEY = 'tierflow.subscriptionPage'
const PAGES_STORAGE_KEY = 'tierflow.subscriptionPages'

export const defaultSubscriptionPage: SubscriptionPage = {
  slug: 'acme-analytics',
  businessName: 'Acme Analytics',
  headline: 'Simple plans for teams that need sharper revenue reporting.',
  subheadline:
    'Choose a plan, invite your operators, and keep billing tied to the work customers actually use.',
  accentColor: '#000000',
  backgroundColor: '#ffffff',
  currency: '$',
  checkoutUrl: 'https://pay.example.com/checkout',
  walletAddress: '',
  tiers: [
    {
      id: 'starter',
      name: 'Starter',
      description: 'For founders validating a paid workflow.',
      price: 29,
      cycle: 'month',
      cta: 'Start Starter',
      featured: false,
      features: ['Hosted pricing page', '3 active tiers', 'Basic analytics'],
    },
    {
      id: 'growth',
      name: 'Growth',
      description: 'For teams selling subscriptions at scale.',
      price: 89,
      cycle: 'month',
      cta: 'Start Growth',
      featured: true,
      features: [
        'Unlimited hosted pages',
        'Custom brand controls',
        'Conversion event tracking',
      ],
    },
    {
      id: 'scale',
      name: 'Scale',
      description: 'For businesses with advanced billing operations.',
      price: 249,
      cycle: 'month',
      cta: 'Contact Sales',
      featured: false,
      features: [
        'Private checkout links',
        'Approval workflows',
        'Priority onboarding',
      ],
    },
  ],
}

export function createEmptyTier(): Tier {
  return {
    id: globalThis.crypto?.randomUUID?.() ?? String(Date.now()),
    name: 'New tier',
    description: 'Describe who this plan is built for.',
    price: 49,
    cycle: 'month',
    cta: 'Choose plan',
    featured: false,
    features: ['Core subscription access', 'Customer support'],
  }
}

export function createSlugFromBusinessName(businessName: string) {
  return (
    businessName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || defaultSubscriptionPage.slug
  )
}

function normalizeSubscriptionPage(page: SubscriptionPage): SubscriptionPage {
  return {
    ...page,
    slug: createSlugFromBusinessName(page.businessName),
  }
}

function readStoredPages() {
  if (typeof window === 'undefined') {
    return [defaultSubscriptionPage]
  }

  const savedPages = window.localStorage.getItem(PAGES_STORAGE_KEY)

  if (savedPages) {
    try {
      const pages = JSON.parse(savedPages)

      if (Array.isArray(pages) && pages.length > 0) {
        return pages.map((page) =>
          normalizeSubscriptionPage({ ...defaultSubscriptionPage, ...page }),
        )
      }
    } catch {
      return [defaultSubscriptionPage]
    }
  }

  const savedPage = window.localStorage.getItem(STORAGE_KEY)

  if (!savedPage) {
    return [defaultSubscriptionPage]
  }

  try {
    const migratedPage = normalizeSubscriptionPage({
      ...defaultSubscriptionPage,
      ...JSON.parse(savedPage),
    })

    window.localStorage.setItem(PAGES_STORAGE_KEY, JSON.stringify([migratedPage]))

    return [migratedPage]
  } catch {
    return [defaultSubscriptionPage]
  }
}

export async function listSubscriptionPages(): Promise<SubscriptionPage[]> {
  return readStoredPages()
}

export async function getSubscriptionPage(
  slug?: string,
): Promise<SubscriptionPage> {
  const pages = readStoredPages()

  if (!slug) {
    return pages[0] ?? defaultSubscriptionPage
  }

  return pages.find((page) => page.slug === slug) ?? defaultSubscriptionPage
}

export async function findSubscriptionPage(slug: string) {
  const pages = readStoredPages()

  return pages.find((page) => page.slug === slug)
}

export async function saveSubscriptionPage(page: SubscriptionPage) {
  const nextPage = normalizeSubscriptionPage(page)
  const pages = readStoredPages()
  const nextPages = pages.some((item) => item.slug === nextPage.slug)
    ? pages.map((item) => (item.slug === nextPage.slug ? nextPage : item))
    : [...pages, nextPage]

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(PAGES_STORAGE_KEY, JSON.stringify(nextPages))
  }

  return nextPage
}

export function getPublicPagePath(slug: string) {
  return `/pages/${slug || defaultSubscriptionPage.slug}`
}
