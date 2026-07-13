import type { PostMeta as PostMetaType } from '@/lib/blog'
import { DEFAULT_AUTHOR } from '@/lib/blog'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function PostMetaRow({ post }: { post: PostMetaType }) {
  const author = post.author ?? DEFAULT_AUTHOR
  return (
    <div className="post-meta-row">
      <strong>{author.name}</strong>
      <span className="dot">·</span>
      <span>{formatDate(post.date)}</span>
      <span className="dot">·</span>
      <span>{post.readingTimeMinutes} min read</span>
    </div>
  )
}
