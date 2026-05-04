import { describe, expect, it } from 'vitest'
import {
  createEmptyTier,
  createSlugFromBusinessName,
  defaultSubscriptionPage,
  getPublicPagePath,
  getSubscriptionPage,
  listSubscriptionPages,
} from './subscriptionPage'

describe('subscription page helpers', () => {
  it('ships with editable starter tiers', () => {
    expect(defaultSubscriptionPage.tiers.length).toBeGreaterThan(1)
    expect(defaultSubscriptionPage.tiers.some((tier) => tier.featured)).toBe(true)
  })

  it('creates a draft tier and public path', () => {
    expect(createEmptyTier().features).toContain('Core subscription access')
    expect(getPublicPagePath('acme-analytics')).toBe('/pages/acme-analytics')
  })

  it('generates slugs from business names', () => {
    expect(createSlugFromBusinessName('Acme Analytics')).toBe('acme-analytics')
    expect(createSlugFromBusinessName('  Kim & Co. Billing!  ')).toBe(
      'kim-co-billing',
    )
    expect(createSlugFromBusinessName('')).toBe(defaultSubscriptionPage.slug)
  })

  it('lists and resolves default pages outside the browser', async () => {
    await expect(listSubscriptionPages()).resolves.toEqual([defaultSubscriptionPage])
    await expect(getSubscriptionPage(defaultSubscriptionPage.slug)).resolves.toEqual(
      defaultSubscriptionPage,
    )
  })
})
