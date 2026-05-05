import { createServerFn } from '@tanstack/react-start'

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

export const draftTiers: Tier[] = [
  {
    id: 'starter',
    name: '',
    description: '',
    price: 0,
    cycle: 'month',
    cta: '',
    featured: false,
    features: [],
  },
  {
    id: 'growth',
    name: '',
    description: '',
    price: 0,
    cycle: 'month',
    cta: '',
    featured: true,
    features: [],
  },
  {
    id: 'scale',
    name: '',
    description: '',
    price: 0,
    cycle: 'month',
    cta: '',
    featured: false,
    features: [],
  },
]

export const draftSubscriptionPage: SubscriptionPage = {
  slug: '',
  businessName: '',
  headline: '',
  subheadline: '',
  accentColor: '#000000',
  backgroundColor: '#ffffff',
  currency: '$',
  checkoutUrl: '',
  walletAddress: '',
  tiers: draftTiers,
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
  return businessName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function normalizeSubscriptionPage(page: SubscriptionPage): SubscriptionPage {
  return {
    ...draftSubscriptionPage,
    ...page,
    slug: createSlugFromBusinessName(page.businessName),
    currency: '$',
    tiers: page.tiers.map((tier) => ({
      ...tier,
      features: tier.features.map((feature) => feature.trim()).filter(Boolean),
    })),
  }
}

export function getIncompleteTierNumbers(page: SubscriptionPage) {
  return page.tiers.flatMap((tier, index) => {
    const hasFeatures = tier.features.some((feature) => feature.trim())
    const isComplete =
      tier.name.trim() &&
      tier.description.trim() &&
      tier.cta.trim() &&
      tier.price > 0 &&
      hasFeatures

    return isComplete ? [] : [index + 1]
  })
}

export function assertSubscriptionPageCanBeSaved(page: SubscriptionPage) {
  const incompleteTierNumbers = getIncompleteTierNumbers(page)

  if (incompleteTierNumbers.length > 0) {
    throw new Error(
      `Fill out tier ${incompleteTierNumbers.join(', ')} before publishing.`,
    )
  }
}

export const listSubscriptionPages = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { listSubscriptionPagesFromDatabase } = await import(
      './subscriptionPage.server'
    )

    return listSubscriptionPagesFromDatabase()
  },
)

export const getSubscriptionPage = createServerFn({ method: 'GET' })
  .inputValidator((data: { slug?: string } | undefined) => data ?? {})
  .handler(async ({ data }): Promise<SubscriptionPage | undefined> => {
    const { getSubscriptionPageFromDatabase } = await import(
      './subscriptionPage.server'
    )

    return getSubscriptionPageFromDatabase(data.slug)
  })

export const findSubscriptionPage = createServerFn({ method: 'GET' })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    const { findSubscriptionPageInDatabase } = await import(
      './subscriptionPage.server'
    )

    return findSubscriptionPageInDatabase(data.slug)
  })

export const saveSubscriptionPage = createServerFn({ method: 'POST' })
  .inputValidator((data: SubscriptionPage) => data)
  .handler(async ({ data }) => {
    assertSubscriptionPageCanBeSaved(data)

    const { saveSubscriptionPageToDatabase } = await import(
      './subscriptionPage.server'
    )

    return saveSubscriptionPageToDatabase(data)
  })

export function getPublicPagePath(slug: string) {
  return `/pages/${slug}`
}
