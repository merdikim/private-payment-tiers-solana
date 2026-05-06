import { describe, expect, it } from 'vitest'
import {
  createEmptyTier,
  createSlugFromBusinessName,
  draftSubscriptionPage,
  getIncompleteTierNumbers,
  getPublicPagePath,
  normalizeSubscriptionPage,
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
    expect(getPublicPagePath('acme-analytics')).toBe('/pages/acme-analytics')
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
})
