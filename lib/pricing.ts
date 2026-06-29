/**
 * ARC PEM is sold as a one-year license (annual-only — there is no monthly
 * billing, because each license is machine-locked and issued manually).
 *
 * The admin app stores a monthly BASE price per plan; the amount actually
 * charged and displayed is exactly 12× that base — no discount. This is the
 * single source of that rule, used by the payment flow and every price label.
 */
export const MONTHS_PER_YEAR = 12

/** Yearly price for a plan, derived from its stored monthly base price. */
export const annualPrice = (monthlyBase: number): number =>
  Math.round(monthlyBase * MONTHS_PER_YEAR)
