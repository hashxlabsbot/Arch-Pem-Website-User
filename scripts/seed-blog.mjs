// One-time migration of the original filesystem MDX posts into the DB-backed CMS.
// Idempotent — upserts by unique `slug`, so re-running just updates. Safe against
// the shared production (Neon) database (never deletes anything).
//
//   node scripts/seed-blog.mjs
//
import nextEnv from '@next/env'
nextEnv.loadEnvConfig(process.cwd())

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()
const POSTS_DIR = path.join(process.cwd(), 'content', 'blog')

function toDate(v) {
  return v ? new Date(v) : null
}

async function main() {
  const host = (process.env.DATABASE_URL ?? '').match(/@([^/?]+)/)?.[1] ?? 'unknown'
  console.log(`Seeding blog posts into: ${host}`)

  if (!fs.existsSync(POSTS_DIR)) {
    console.log('No content/blog directory — nothing to seed.')
    return
  }
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.mdx'))

  for (const file of files) {
    const slug = file.replace(/\.mdx$/, '')
    const { data: fm, content } = matter(fs.readFileSync(path.join(POSTS_DIR, file), 'utf8'))

    const record = {
      slug,
      title: fm.title,
      description: fm.description,
      contentMarkdown: content.trim(),
      category: fm.category,
      tags: fm.tags ?? [],
      authorName: fm.author?.name ?? null,
      authorRole: fm.author?.role ?? null,
      coverImage: fm.coverImage ?? null,
      coverImageAlt: fm.coverImageAlt ?? null,
      seoTitle: fm.seoTitle ?? null,
      featured: Boolean(fm.featured),
      status: 'PUBLISHED',
      publishedAt: toDate(fm.date),
      updatedDate: toDate(fm.updatedDate),
      relatedTools: fm.relatedTools ?? [],
      relatedPosts: fm.relatedPosts ?? [],
      faq: fm.faq ?? null,
      howto: fm.howto ?? null,
    }

    await db.blogPost.upsert({
      where: { slug },
      update: record,
      create: record,
    })
    console.log(`  ✓ ${slug}  [${fm.category}]${fm.featured ? ' ★ featured' : ''}`)
  }

  const total = await db.blogPost.count()
  console.log(`Done. ${total} posts in the database.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
