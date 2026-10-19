import { company } from '@/lib/company'
import { entity, homeFaqs, priceLines, WEB_APP_URL } from '@/lib/seo-entity'
import { getPublicPlans } from '@/lib/plans'
import { pricingFaqs } from '@/lib/pricing-faqs'
import { LIVE_TOOLS } from '@/lib/tools'
import { GLOSSARY_SORTED } from '@/lib/glossary'
import { SEGMENTS, COMPARISONS, storyFor } from '@/lib/aeo-pages'

/**
 * /llms-full.txt — the full text of the product, audience, comparison,
 * pricing and glossary pages in one markdown file, so an AI assistant can
 * answer from a single fetch. /llms.txt is the short index.
 */
export const revalidate = 3600

export async function GET() {
  const base = company.siteUrl.replace(/\/$/, '')
  const plans = await getPublicPlans()
  const prices = priceLines(plans)

  const lines = [
    `# ${entity.name} — full reference`,
    '',
    `> ${entity.definition}`,
    '',
    `Publisher: ${company.legalName}, ${company.address.city}, ${company.address.state}, ${company.address.country}. Website: ${base}. Contact: ${company.salesEmail}, ${company.phone}.`,
    '',
    '## Platform',
    '',
    `${entity.platform}. App: ${WEB_APP_URL}.`,
    '',
    '## Pricing',
    '',
    entity.pricingModel,
    '',
    ...(prices.length ? [...prices.map((p) => `- ${p}`), ''] : []),
    ...pricingFaqs(plans.rules).flatMap((f) => [`### ${f.q}`, '', f.a, '']),
    '## Features',
    '',
    ...entity.featureGroups.flatMap((g) => [`### ${g.name}`, '', ...g.items.map((i) => `- ${i}`), '']),
    '## Customers',
    '',
    ...entity.proof.stats.map((s) => `- ${s}`),
    ...entity.proof.stories.map((s) => `- ${s.company} (${s.segment}): ${s.result}`),
    '',
    '## Frequently asked questions',
    '',
    ...homeFaqs(plans).flatMap((f) => [`### ${f.q}`, '', f.a, '']),
    '## ARC PEM by audience',
    '',
    ...SEGMENTS.flatMap((s) => {
      const story = storyFor(s.story)
      return [
        `### ${s.title}`,
        '',
        `Source: ${base}/for/${s.slug}`,
        '',
        s.answer,
        '',
        ...s.pains.map((p) => `- ${p.title}: ${p.text}`),
        '',
        `Features used most: ${s.features.join('; ')}.`,
        ...(story ? ['', `Customer result — ${story.company} (${story.segment}): ${story.result}.`] : []),
        '',
        ...s.faqs.flatMap((f) => [`**${f.q}** ${f.a}`, '']),
      ]
    }),
    '## Comparisons',
    '',
    ...COMPARISONS.flatMap((c) => [
      `### ${c.title}`,
      '',
      `Source: ${base}/compare/${c.slug}`,
      '',
      c.answer,
      '',
      `| | ${c.arcLabel ?? 'ARC PEM'} | ${c.other} |`,
      '|---|---|---|',
      ...c.rows.map((r) => `| ${r.row} | ${r.arc} | ${r.other} |`),
      '',
      `Choose ${c.arcLabel ?? 'ARC PEM'} if: ${c.chooseArc.join('; ')}.`,
      `${c.otherHeading ?? `${c.other} alone is enough if`}: ${c.chooseOther.join('; ')}.`,
      '',
      ...c.faqs.flatMap((f) => [`**${f.q}** ${f.a}`, '']),
    ]),
    '## Construction finance glossary',
    '',
    ...GLOSSARY_SORTED.flatMap((t) => [
      `### ${t.term}`,
      '',
      `Source: ${base}/glossary/${t.slug}`,
      '',
      t.definition,
      '',
      ...t.details.flatMap((d) => [d, '']),
      ...(t.example ? [`Example: ${t.example}`, ''] : []),
      `In ARC PEM: ${t.inArcPem}`,
      '',
    ]),
    '## Free tools (no sign-up)',
    '',
    ...LIVE_TOOLS.map((t) => `- [${t.name}](${base}/tools/${t.slug}): ${t.short}`),
    '',
  ]

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
