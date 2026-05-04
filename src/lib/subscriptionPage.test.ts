import { describe, expect, it } from 'vitest'
import {
  createEmptyTier,
  defaultSubscriptionPage,
  getPublicPagePath,
} from './subscriptionPage'

describe('subscription page helpers', () => {
  it('ships with editable starter tiers', () => {
    expect(defaultSubscriptionPage.tiers.length).toBeGreaterThan(1)
    expect(defaultSubscriptionPage.tiers.some((tier) => tier.featured)).toBe(true)
  })

  it('creates a draft tier and public path', () => {
    expect(createEmptyTier().features).toContain('Core subscription access')
    expect(getPublicPagePath('acme-growth')).toBe('/pages/acme-growth')
  })
})
