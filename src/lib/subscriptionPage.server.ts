import type { Prisma } from '../generated/prisma/client'
import { prisma } from './prisma.server'
import {
  type SubscriptionPage,
  type Tier,
  draftTiers,
  normalizeSubscriptionPage,
} from './subscriptionPage'

type StoredSubscriptionPage = Awaited<
  ReturnType<typeof prisma.subscriptionPage.findFirst>
>

function isLegacyDefaultPage(page: NonNullable<StoredSubscriptionPage>) {
  return (
    page.slug === 'acme-analytics' &&
    page.businessName === 'Acme Analytics' &&
    page.checkoutUrl === 'https://pay.example.com/checkout'
  )
}

function parseTiers(tiers: Prisma.JsonValue): Tier[] {
  if (!Array.isArray(tiers)) {
    return draftTiers
  }

  return tiers.map((tier) => {
    const item = tier as Partial<Tier>

    return {
      id: typeof item.id === 'string' ? item.id : crypto.randomUUID(),
      name: typeof item.name === 'string' ? item.name : '',
      description: typeof item.description === 'string' ? item.description : '',
      price: typeof item.price === 'number' ? item.price : 0,
      cycle: item.cycle === 'year' ? 'year' : 'month',
      cta: typeof item.cta === 'string' ? item.cta : '',
      featured: Boolean(item.featured),
      features: Array.isArray(item.features)
        ? item.features.filter((feature): feature is string => typeof feature === 'string')
        : [],
    }
  })
}

function toSubscriptionPage(page: NonNullable<StoredSubscriptionPage>): SubscriptionPage {
  return normalizeSubscriptionPage({
    slug: page.slug,
    businessName: page.businessName,
    headline: page.headline,
    subheadline: page.subheadline,
    accentColor: page.accentColor,
    backgroundColor: page.backgroundColor,
    currency: page.currency,
    checkoutUrl: page.checkoutUrl,
    walletAddress: page.walletAddress,
    tiers: parseTiers(page.tiers),
  })
}

export async function listSubscriptionPagesFromDatabase() {
  const pages = await prisma.subscriptionPage.findMany({
    orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
  })

  return pages.filter((page) => !isLegacyDefaultPage(page)).map(toSubscriptionPage)
}

export async function findSubscriptionPageInDatabase(slug: string) {
  const page = await prisma.subscriptionPage.findUnique({
    where: { slug },
  })

  if (!page || isLegacyDefaultPage(page)) {
    return undefined
  }

  return toSubscriptionPage(page)
}

export async function getSubscriptionPageFromDatabase(slug?: string) {
  if (slug) {
    return findSubscriptionPageInDatabase(slug)
  }

  const page = await prisma.subscriptionPage.findFirst({
    orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
  })

  if (!page || isLegacyDefaultPage(page)) {
    return undefined
  }

  return toSubscriptionPage(page)
}

export async function saveSubscriptionPageToDatabase(page: SubscriptionPage) {
  const nextPage = normalizeSubscriptionPage(page)

  const savedPage = await prisma.subscriptionPage.upsert({
    where: { slug: nextPage.slug },
    create: {
      slug: nextPage.slug,
      businessName: nextPage.businessName,
      headline: nextPage.headline,
      subheadline: nextPage.subheadline,
      accentColor: nextPage.accentColor,
      backgroundColor: nextPage.backgroundColor,
      currency: '$',
      checkoutUrl: nextPage.checkoutUrl,
      walletAddress: nextPage.walletAddress,
      tiers: nextPage.tiers,
    },
    update: {
      businessName: nextPage.businessName,
      headline: nextPage.headline,
      subheadline: nextPage.subheadline,
      accentColor: nextPage.accentColor,
      backgroundColor: nextPage.backgroundColor,
      currency: '$',
      checkoutUrl: nextPage.checkoutUrl,
      walletAddress: nextPage.walletAddress,
      tiers: nextPage.tiers,
    },
  })

  return toSubscriptionPage(savedPage)
}
