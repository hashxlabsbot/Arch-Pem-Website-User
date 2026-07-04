/**
 * Shared with the pricing page's FAQ accordion (client) and its FAQPage
 * JSON-LD (server metadata) — kept in one place so the two never drift.
 */
export const PRICING_FAQS = [
  {
    q: 'What is a "machine"?',
    a: 'Each installation of Arc PEM on a Windows computer counts as one machine. A Solo license works on 1 computer, Studio on up to 3, and Enterprise on up to 10.',
  },
  {
    q: 'What is Multi-User Database Sharing?',
    a: 'Studio and Enterprise users can place the project database on a shared network drive, allowing multiple team members to access and update the same data simultaneously from different computers on the same network.',
  },
  {
    q: 'What is Machine Transfer Support?',
    a: 'Studio and Enterprise users can transfer their license to a new computer directly from within the app — no need to contact support. Solo users can reach out to HashX Labs for assisted transfers.',
  },
  {
    q: 'Can I upgrade my plan later?',
    a: 'Yes. Contact HashX Labs and we\'ll issue a new license file for your upgraded plan. Your existing data is fully preserved.',
  },
  {
    q: 'How is the license delivered?',
    a: 'After purchase, HashX Labs emails you a .lic file. Open Arc PEM, go to Settings → License, and import the file to activate on your machine.',
  },
  {
    q: 'What happens when my license expires?',
    a: 'You get a 7-day grace period after expiry. A warning banner appears 30 days before expiry so you have plenty of time to renew.',
  },
  {
    q: 'Is there a free trial?',
    a: 'Yes, Arc PEM includes a free trial period so you can explore all features before purchasing. No credit card required.',
  },
]
