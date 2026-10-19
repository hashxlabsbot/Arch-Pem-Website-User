/**
 * Plans store a monthly BASE price (₹). Every amount charged or displayed is derived here, so the payment flow,
 * every price label and the admin app (lib/pricing.ts there, which must agree) use the same figures.
 *
 * - ARC PEM is a subscription billed monthly or annually and renewed automatically (Razorpay Subscriptions).
 * - Legacy desktop licences were sold as one year at exactly 12× the base (`annualPrice`).
 */
export const MONTHS_PER_YEAR = 12

export const BILLING_INTERVALS = ['MONTH', 'YEAR'] as const
export type BillingInterval = (typeof BILLING_INTERVALS)[number]
export const isBillingInterval = (v: unknown): v is BillingInterval =>
  typeof v === 'string' && (BILLING_INTERVALS as readonly string[]).includes(v)

/** Yearly price for a legacy desktop licence, derived from its stored monthly base price. */
export const annualPrice = (monthlyBase: number): number =>
  Math.round(monthlyBase * MONTHS_PER_YEAR)

/** Billing rules staff edit in admin Settings (BillingSettings). DEFAULT_BILLING_RULES applies until that row exists. */
export type BillingRules = {
  /** Monthly price of one add-on team seat (₹). */
  seatAddonMonthly: number
  /** Monthly price of one add-on site seat (₹), for a Site engineer or Supervisor. */
  siteSeatAddonMonthly: number
  /** Months charged for a year on annual billing: 10 = two months free, 12 = no discount. */
  annualBilledMonths: number
  /** Free trial on a firm's first subscription, in days; 0 = no trial. */
  trialDays: number
  /** Most add-on seats of each kind sold self-serve. */
  maxAddonSeats: number
}
export const DEFAULT_BILLING_RULES: BillingRules = {
  seatAddonMonthly: 599,
  siteSeatAddonMonthly: 199,
  annualBilledMonths: 10,
  trialDays: 14,
  maxAddonSeats: 50,
}

export type SeatAddons = { seats: number; siteSeats: number }
export const NO_ADDONS: SeatAddons = { seats: 0, siteSeats: 0 }

/** What one billing cycle of a subscription costs (₹): the plan plus any add-on seats, at the interval's rate. */
export const subscriptionPrice = (
  monthlyBase: number,
  interval: BillingInterval,
  addons: SeatAddons = NO_ADDONS,
  rules: BillingRules = DEFAULT_BILLING_RULES,
): number =>
  Math.round(
    (monthlyBase + addons.seats * rules.seatAddonMonthly + addons.siteSeats * rules.siteSeatAddonMonthly) *
      (interval === 'MONTH' ? 1 : rules.annualBilledMonths),
  )

/** Percentage saved by paying annually instead of monthly (0 when annual has no discount). */
export const annualSavingPct = (rules: BillingRules = DEFAULT_BILLING_RULES): number =>
  Math.round((1 - rules.annualBilledMonths / MONTHS_PER_YEAR) * 100)

