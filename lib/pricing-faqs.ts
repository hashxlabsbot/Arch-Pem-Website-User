import { company } from '@/lib/company'
import { DEFAULT_BILLING_RULES, MONTHS_PER_YEAR, type BillingRules } from '@/lib/pricing'

/**
 * Shared with the pricing page's FAQ accordion (client) and its FAQPage
 * JSON-LD (server metadata) — kept in one place so the two never drift.
 */
export type PricingFaq = { q: string; a: string }

/** The pricing FAQs for the current billing rules (admin Settings). */
export function pricingFaqs(rules: BillingRules = DEFAULT_BILLING_RULES): PricingFaq[] {
  const free = MONTHS_PER_YEAR - rules.annualBilledMonths
  return [
  {
    q: 'How is ARC PEM priced?',
    a: 'ARC PEM is one subscription per firm: Starter, Studio or Business, plus a custom Enterprise plan for large firms. Every plan includes every feature — ledgers, BOQ, approvals, GST, GSTR-2B, TDS and Tally export. Plans differ only in team seats, site seats, active projects and the level of support.',
  },
  ...(rules.trialDays > 0 ? [{
    q: 'Is there a free trial?',
    a: `Yes. Your firm's first subscription starts with a ${rules.trialDays}-day free trial on Starter, Studio or Business. You set up auto-pay at the start, but nothing is charged until the trial ends. Turn off auto-renew before then and you pay nothing.`,
  }] : []),
  {
    q: 'What is the difference between a team seat and a site seat?',
    a: `Team seats are for people who run the firm's money — owner, partners, accounts, office and project managers. Site seats are for site engineers and supervisors who add bills, labour and site expenses for their projects. Site seats cost much less, so your whole site team can use ARC PEM.`,
  },
  {
    q: 'Can I add more seats without changing plan?',
    a: `Yes. Add team seats for ₹${rules.seatAddonMonthly} a month each and site seats for ₹${rules.siteSeatAddonMonthly} a month each, on any plan, from Account → Subscription. They are billed with your plan, monthly or annually.`,
  },
  {
    q: 'Can I pay monthly or annually?',
    a: `Both. ${free > 0 ? `Annual billing costs ${rules.annualBilledMonths} months' price for 12 months — ${free === 1 ? 'one month' : `${free} months`} free.` : 'Annual billing costs the same as twelve monthly payments, charged once a year.'} You can switch between them later from your account.`,
  },
  {
    q: 'How does auto-renewal work?',
    a: 'You authorise auto-pay once at checkout. After that, Razorpay charges your chosen payment method at the start of each month or year, and a GST invoice is emailed to you every time.',
  },
  {
    q: 'Which payment methods can I use?',
    a: 'Credit and debit cards (Visa, Mastercard, RuPay), UPI AutoPay from any UPI app, and netbanking or debit-card e-mandates from major Indian banks. All payments are processed securely by Razorpay; we never see or store your card details.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Turn off auto-renew from Account → Subscription at any time and nothing more is charged. Your firm keeps full access until the end of the period you have already paid for.',
  },
  {
    q: 'What happens if a renewal payment fails?',
    a: 'Razorpay retries the payment over the next few days and we let you know. Your team keeps working for a 14-day grace period after the paid period ends; after that the workspace becomes read-only until the plan is renewed. Your data is never deleted and stays exportable.',
  },
  {
    q: 'Can I upgrade or change my plan later?',
    a: 'Yes. Pick a new plan, billing cycle or number of seats from your account at any time. The change starts straight away and the time you have already paid for is kept. All your data stays exactly where it is.',
  },
  {
    q: 'Do prices include GST?',
    a: `All prices are in Indian Rupees and ${company.pricesIncludeGst ? `include ${company.gstRatePct}% GST` : `exclude ${company.gstRatePct}% GST, which is added at checkout`}. A GST invoice is issued for every payment, ready for your input tax credit.`,
  },
  {
    q: 'What is the Enterprise plan?',
    a: 'For large builders and multi-office firms that need 30 or more team seats, an SLA, a security review or a dedicated account manager. It is priced by agreement — talk to our sales team.',
  },
  ]
}
