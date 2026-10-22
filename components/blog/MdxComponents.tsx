import type { MDXComponents } from 'mdx/types'

const SIZES = new Set(['small', 'medium', 'full'])

/** Pull the `#small|#medium|#full` marker off the src; default to medium. */
function parseImage(src?: string): { url: string; size: string } {
  if (!src) return { url: '', size: 'medium' }
  const hash = src.lastIndexOf('#')
  if (hash === -1) return { url: src, size: 'medium' }
  const marker = src.slice(hash + 1).toLowerCase()
  if (!SIZES.has(marker)) return { url: src, size: 'medium' }
  return { url: src.slice(0, hash), size: marker }
}

/** Custom renderers passed to <MDXRemote components={...}> — only overrides where the default HTML needs a wrapper or site-specific behaviour. */
export const mdxComponents: MDXComponents = {
  // The article title is the page's one <h1>. A stray `# Heading` in a post body would give the page two, so it is
  // rendered as an <h2>.
  h1: (props) => <h2 {...props} />,
  table: (props) => (
    <div className="tool-table-wrap">
      <table className="tool-table" {...props} />
    </div>
  ),
  // Inline body images: size preset comes from a `#small|#medium|#full` marker on
  // the src (added by the admin editor); the markdown `title` becomes a caption.
  img: ({ src, alt, title }) => {
    const { url, size } = parseImage(typeof src === 'string' ? src : undefined)
    return (
      <figure className={`post-fig post-fig--${size}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={alt ?? ''} loading="lazy" decoding="async" />
        {title ? <figcaption>{title}</figcaption> : null}
      </figure>
    )
  },
}
