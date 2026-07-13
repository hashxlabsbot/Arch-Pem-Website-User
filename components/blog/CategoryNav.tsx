import Link from 'next/link'
import type { CategorySummary } from '@/lib/blog'

export default function CategoryNav({
  categories,
  activeSlug,
}: {
  categories: CategorySummary[]
  activeSlug?: string
}) {
  return (
    <nav className="cat-nav" aria-label="Blog categories">
      <Link href="/blog" className={`cat-pill${!activeSlug ? ' active' : ''}`}>
        All Posts
      </Link>
      {categories.map((c) => (
        <Link
          key={c.slug}
          href={`/blog/category/${c.slug}`}
          className={`cat-pill${activeSlug === c.slug ? ' active' : ''}`}
        >
          {c.name} <span className="cat-count">({c.count})</span>
        </Link>
      ))}
    </nav>
  )
}
