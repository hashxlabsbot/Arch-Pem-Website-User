import GithubSlugger from 'github-slugger'

type Heading = { text: string; slug: string; depth: 2 | 3 }

/**
 * Extracts h2/h3 headings straight from the raw MDX source (not the compiled
 * tree) and slugs them with the same GithubSlugger rehype-slug uses
 * internally, in the same top-to-bottom order — so the anchors here always
 * match the ids rehype-slug stamps onto the real headings, including its
 * -1/-2 suffixing when two headings share text.
 */
function extractHeadings(content: string): Heading[] {
  const slugger = new GithubSlugger()
  const headings: Heading[] = []
  const lines = content.split('\n')
  for (const line of lines) {
    const match = /^(##|###)\s+(.+)$/.exec(line.trim())
    if (!match) continue
    const depth = match[1].length as 2 | 3
    const text = match[2].replace(/[*_`]/g, '').trim()
    headings.push({ text, slug: slugger.slug(text), depth })
  }
  return headings
}

export default function TableOfContents({ content }: { content: string }) {
  const headings = extractHeadings(content)
  if (headings.length < 2) return null

  return (
    <nav className="post-toc" aria-label="Table of contents">
      <div className="post-toc-label">On this page</div>
      <ol>
        {headings.map((h) => (
          <li key={h.slug} style={{ paddingLeft: h.depth === 3 ? 14 : 0 }}>
            <a href={`#${h.slug}`}>{h.text}</a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
