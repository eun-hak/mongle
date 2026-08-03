import Link from "next/link";
import type { Post } from "@/lib/posts";

export default function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/${post.slug}`} className="card post-card">
      <div className="pc-head">
        <span className="pc-emoji" aria-hidden="true">
          {post.emoji}
        </span>
        <span className="badge">{post.category}</span>
      </div>
      <h3 className="pc-title serif">{post.title}</h3>
      <p className="pc-intro">{post.intro}</p>
      <p className="pc-meta">관련 질문 {post.variants.length}가지</p>
    </Link>
  );
}
