import type { PostMeta } from '@/lib/blog'
import PostCard from './PostCard'

export default function RelatedPosts({ posts }: { posts: PostMeta[] }) {
  if (posts.length === 0) return null
  return (
    <section className="related-posts-section">
      <div className="sec-hd fade-up in">
        <span className="badge badge-indigo">Keep Reading</span>
        <h2>Related articles</h2>
      </div>
      <div className="post-grid">
        {posts.map((p) => (
          <PostCard key={p.slug} post={p} />
        ))}
      </div>
    </section>
  )
}
