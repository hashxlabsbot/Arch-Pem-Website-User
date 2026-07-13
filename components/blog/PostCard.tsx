import Link from 'next/link'
import Image from 'next/image'
import type { PostMeta } from '@/lib/blog'
import BrandedCover from './BrandedCover'
import PostMetaRow from './PostMeta'

export default function PostCard({ post, priority = false }: { post: PostMeta; priority?: boolean }) {
  return (
    <Link href={`/blog/${post.slug}`} className="post-card">
      <div className="post-card-media">
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.coverImageAlt || post.title}
            fill
            priority={priority}
            sizes="(max-width: 1080px) 50vw, 33vw"
          />
        ) : (
          <BrandedCover categorySlug={post.categorySlug} category={post.category} />
        )}
        {post.coverImage && <span className="post-card-cat">{post.category}</span>}
      </div>
      <div className="post-card-body">
        <div className="post-card-title">{post.title}</div>
        <div className="post-card-desc">{post.description}</div>
        <PostMetaRow post={post} />
      </div>
    </Link>
  )
}
