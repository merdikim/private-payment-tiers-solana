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
  tiers: Tier[]
}

export const PAGE_QUERY_KEY = ['subscription-page', 'active']

const STORAGE_KEY = 'tierflow.subscriptionPage'

export const defaultSubscriptionPage: SubscriptionPage = {
  slug: 'acme-growth',
  businessName: 'Acme Analytics',
  headline: 'Simple plans for teams that need sharper revenue reporting.',
  subheadline:
    'Choose a plan, invite your operators, and keep billing tied to the work customers actually use.',
  accentColor: '#000000',
  backgroundColor: '#ffffff',
  currency: '$',
  checkoutUrl: 'https://pay.example.com/checkout',
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

export async function getSubscriptionPage(): Promise<SubscriptionPage> {
  if (typeof window === 'undefined') {
    return defaultSubscriptionPage
  }

  const savedPage = window.localStorage.getItem(STORAGE_KEY)

  if (!savedPage) {
    return defaultSubscriptionPage
  }

  try {
    return { ...defaultSubscriptionPage, ...JSON.parse(savedPage) }
  } catch {
    return defaultSubscriptionPage
  }
}

export async function saveSubscriptionPage(page: SubscriptionPage) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(page))
  }

  return page
}

export function getPublicPagePath(slug: string) {
  return `/pages/${slug || defaultSubscriptionPage.slug}`
}
