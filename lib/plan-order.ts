/** Web plans in the order they are sold: Starter, Studio, Business, Enterprise (Enterprise is priced by quote). */
export const TIER_ORDER = ['SOLO', 'STUDIO', 'BUSINESS', 'ENTERPRISE'] as const

export const sortByTier = <T extends { tier?: string | null; price: number }>(plans: T[]): T[] =>
  [...plans].sort((a, b) => {
    const rank = (t?: string | null) => {
      const i = TIER_ORDER.indexOf((t ?? '') as (typeof TIER_ORDER)[number])
      return i === -1 ? TIER_ORDER.length : i
    }
    return rank(a.tier) - rank(b.tier) || a.price - b.price
  })

/** Shown and enforced as "unlimited" (the web app stores unlimited as 100000). */
export const isUnlimited = (n: number) => n >= 100_000

/** A plan sold by the team rather than at checkout. */
export const isQuoted = (p: { price: number }) => p.price <= 0
