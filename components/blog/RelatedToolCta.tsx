import Link from 'next/link'
import { TOOLS } from '@/lib/tools'
import { RupeeIcon, CalculatorIcon, CubeIcon } from '@/components/icons'

const ICONS: Record<string, React.ReactNode> = {
  'contractor-bill-generator': <RupeeIcon size={22} color="#4f46e5" />,
  'construction-cost-calculator': <CalculatorIcon size={22} color="#4f46e5" />,
  'concrete-calculator': <CubeIcon size={22} color="#4f46e5" />,
}

/** Inline CTA bridging a blog post into the matching free tool — same idea as ToolCta, pointed at a specific tool instead of the demo funnel. */
export default function RelatedToolCta({ slugs }: { slugs: string[] }) {
  const tools = slugs.map((s) => TOOLS.find((t) => t.slug === s)).filter((t): t is (typeof TOOLS)[number] => Boolean(t) && t!.live)
  if (tools.length === 0) return null
  const tool = tools[0]

  return (
    <div className="related-tool-cta">
      <div className="related-tool-cta-icon">{ICONS[tool.slug]}</div>
      <div className="related-tool-cta-body">
        <div className="related-tool-cta-label">Free Tool</div>
        <div className="related-tool-cta-title">{tool.name}</div>
        <div className="related-tool-cta-desc">{tool.short}</div>
      </div>
      <Link href={`/tools/${tool.slug}`} className="btn btn-primary btn-sm">
        Try it free →
      </Link>
    </div>
  )
}
