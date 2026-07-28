import Link from 'next/link'
import Image from 'next/image'
import { compileMDX } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import JsonLd from '@/components/seo/JsonLd'
import ShareButton from '@/components/tools/ShareButton'
import BrandedCover from '@/components/blog/BrandedCover'
import TableOfContents from '@/components/blog/TableOfContents'
import ReadingProgress from '@/components/blog/ReadingProgress'
import ViewBeacon from '@/components/blog/ViewBeacon'
import RelatedToolCta from '@/components/blog/RelatedToolCta'
import RelatedPosts from '@/components/blog/RelatedPosts'
import BlogFaq from '@/components/blog/BlogFaq'
import { mdxComponents } from '@/components/blog/MdxComponents'
import { DEFAULT_AUTHOR, type PostMeta } from '@/lib/blog'
import { company } from '@/lib/company'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}
function initials(name: string): string {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}

/** Shared, single source of truth for the article page — used by both the live
 *  /blog/[slug] route and the /blog/preview/[id] editor preview, so the two can
 *  never drift. `preview` shows a draft banner and omits structured data. */
export default async function ArticleView({
  meta,
  content,
  relatedPosts,
  preview = false,
}: {
  meta: PostMeta
  content: string
  relatedPosts: PostMeta[]
  preview?: boolean
}) {
  const base = company.siteUrl.replace(/\/$/, '')
  const author = meta.author ?? DEFAULT_AUTHOR
  const ogImageUrl = `${base}/blog/${meta.slug}/opengraph-image`

  const { content: compiled } = await compileMDX({
    source: content,
    components: mdxComponents,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeSlug,
          [rehypeAutolinkHeadings, {
            behavior: 'append',
            properties: { className: ['heading-anchor'], ariaHidden: true, tabIndex: -1 },
            content: { type: 'text', value: ' #' },
          }],
        ],
      },
    },
  })

  return (
    <>
      <ReadingProgress />
      {!preview && <ViewBeacon slug={meta.slug} />}

      {preview && (
        <div style={{
          position: 'sticky', top: 0, zIndex: 50, textAlign: 'center',
          background: '#f59e0b', color: '#1a1205', fontFamily: "'Plus Jakarta Sans',sans-serif",
          fontWeight: 800, fontSize: '0.78rem', letterSpacing: '0.05em', textTransform: 'uppercase',
          padding: '8px 16px',
        }}>
          Draft preview · not published · not indexed
        </div>
      )}

      {!preview && (
        <>
          <JsonLd
            data={{
              '@context': 'https://schema.org',
              '@type': 'BlogPosting',
              headline: meta.title,
              description: meta.description,
              image: ogImageUrl,
              datePublished: meta.date,
              dateModified: meta.updatedDate ?? meta.date,
              author: { '@type': 'Person', name: author.name },
              publisher: {
                '@type': 'Organization',
                name: company.legalName,
                logo: { '@type': 'ImageObject', url: `${base}/arc-icon.png` },
              },
              mainEntityOfPage: { '@type': 'WebPage', '@id': `${base}/blog/${meta.slug}` },
              url: `${base}/blog/${meta.slug}`,
            }}
          />
          <JsonLd
            data={{
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Blog', item: `${base}/blog` },
                { '@type': 'ListItem', position: 2, name: meta.title, item: `${base}/blog/${meta.slug}` },
              ],
            }}
          />
          {meta.faq && (
            <JsonLd
              data={{
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: meta.faq.map((f) => ({
                  '@type': 'Question',
                  name: f.q,
                  acceptedAnswer: { '@type': 'Answer', text: f.a },
                })),
              }}
            />
          )}
          {meta.howto && (
            <JsonLd
              data={{
                '@context': 'https://schema.org',
                '@type': 'HowTo',
                name: meta.howto.name,
                description: meta.howto.description,
                step: meta.howto.steps.map((s, i) => ({
                  '@type': 'HowToStep',
                  position: i + 1,
                  name: s.name,
                  text: s.text,
                })),
              }}
            />
          )}
        </>
      )}

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="post-hero fade-up in">
            <div className="post-crumb">
              <Link href="/blog">Blog</Link> / <Link href={`/blog/category/${meta.categorySlug}`}>{meta.category}</Link>
            </div>
            <span className="badge badge-indigo">{meta.category}</span>
            <h1>{meta.title}</h1>
            <p className="post-dek">{meta.description}</p>
            <div className="post-meta-row">
              <strong>{author.name}</strong>
              {author.role && <span>· {author.role}</span>}
              <span className="dot">·</span>
              <span>{formatDate(meta.date)}</span>
              <span className="dot">·</span>
              <span>{meta.readingTimeMinutes} min read</span>
              {meta.updatedDate && <span className="post-updated">Updated {formatDate(meta.updatedDate)}</span>}
            </div>
          </div>

          <div className="post-cover fade-up in">
            {meta.coverImage ? (
              <Image src={meta.coverImage} alt={meta.coverImageAlt || meta.title} fill priority sizes="980px" />
            ) : (
              <BrandedCover categorySlug={meta.categorySlug} category={meta.category} />
            )}
          </div>

          <div className="post-layout">
            <TableOfContents content={content} />

            <article className="post-prose">
              {compiled}

              {meta.relatedTools && meta.relatedTools.length > 0 && <RelatedToolCta slugs={meta.relatedTools} />}
              {meta.faq && <BlogFaq items={meta.faq} />}

              <div className="post-footer-row">
                <div className="post-author">
                  <div className="post-author-avatar">{initials(author.name)}</div>
                  <div>
                    <div className="post-author-name">{author.name}</div>
                    {author.role && <div className="post-author-role">{author.role}</div>}
                  </div>
                </div>
                <ShareButton />
              </div>
            </article>
          </div>

          <RelatedPosts posts={relatedPosts} />
        </div>
      </section>
    </>
  )
}
