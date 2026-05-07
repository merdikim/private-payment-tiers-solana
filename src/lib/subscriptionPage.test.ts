import { describe, expect, it } from 'vitest'
import {
  createEmptyTier,
  createSlugFromBusinessName,
  draftSubscriptionPage,
  getIncompleteTierNumbers,
  getPublicPagePath,
  normalizeSubscriptionPage,
  selectSubscriptionPageTier,
} from './subscriptionPage'

describe('subscription page helpers', () => {
  it('ships with editable starter tiers', () => {
    expect(draftSubscriptionPage.tiers.length).toBeGreaterThan(1)
    expect(draftSubscriptionPage.tiers.every((tier) => !tier.featured)).toBe(true)
  })

  it('creates a draft tier and public path', () => {
    expect(createEmptyTier()).toMatchObject({
      name: '',
      price: 49,
      features: [],
    })
    expect(getPublicPagePath('acme-analytics')).toBe(
      '/business/acme-analytics',
    )
  })

  it('generates slugs from business names', () => {
    expect(createSlugFromBusinessName('Acme Analytics')).toBe('acme-analytics')
    expect(createSlugFromBusinessName('  Kim & Co. Billing!  ')).toBe(
      'kim-co-billing',
    )
    expect(createSlugFromBusinessName('')).toBe('')
  })

  it('normalizes pages before persistence', () => {
    expect(
      normalizeSubscriptionPage({
        ...draftSubscriptionPage,
        businessName: 'Kim & Co. Billing!',
        currency: 'EUR',
      }),
    ).toMatchObject({
      slug: 'kim-co-billing',
      currency: '$',
    })
  })

  it('keeps the slug aligned to edited business names', () => {
    expect(
      normalizeSubscriptionPage({
        ...draftSubscriptionPage,
        slug: 'old-name',
        businessName: 'New Checkout Name',
      }).slug,
    ).toBe('new-checkout-name')
  })

  it('reports tiers missing required content', () => {
    expect(getIncompleteTierNumbers(draftSubscriptionPage)).toEqual([1, 2])

    expect(
      getIncompleteTierNumbers({
        ...draftSubscriptionPage,
        tiers: [
          {
            ...draftSubscriptionPage.tiers[0],
            name: 'Consultation',
            price: 29,
          },
        ],
      }),
    ).toEqual([])
  })

  it('selects a public tier by number or id', () => {
    const page = {
      ...draftSubscriptionPage,
      tiers: [
        { ...draftSubscriptionPage.tiers[0], id: 'consultation' },
        { ...draftSubscriptionPage.tiers[1], id: 'package' },
      ],
    }

    expect(selectSubscriptionPageTier(page, '1')?.tiers).toEqual([
      page.tiers[0],
    ])
    expect(selectSubscriptionPageTier(page, 'package')?.tiers).toEqual([
      page.tiers[1],
    ])
    expect(selectSubscriptionPageTier(page)?.tiers).toEqual(page.tiers)
    expect(selectSubscriptionPageTier(page, '3')).toBeUndefined()
  })
})
