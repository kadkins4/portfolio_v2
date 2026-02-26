import type { Metadata } from "next";
import { createReader } from "@keystatic/core/reader";
import config from "../../../../keystatic.config";
import PostCard from "@/components/PostCard";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Blog",
  description: "Thoughts on frontend engineering, design systems, performance, and accessibility.",
};

export default async function BlogPage() {
  const reader = createReader(process.cwd(), config);
  const posts = await reader.collections.posts.all();

  const sorted = posts.sort(
    (a, b) => new Date(b.entry.date ?? 0).getTime() - new Date(a.entry.date ?? 0).getTime()
  );

  return (
    <div className="section-wrapper">
      <div className="fade-in">
        <p className="section-label">Blog</p>
        <h1 className="section-title">Writing.</h1>
      </div>
      <div className={styles.grid}>
        {sorted.map((post) => (
          <div key={post.slug} className="fade-in">
            <PostCard
              slug={post.slug}
              title={post.entry.title}
              excerpt={post.entry.excerpt}
              date={post.entry.date ?? ""}
              coverImage={post.entry.coverImage ?? null}
            />
          </div>
        ))}
        {sorted.length === 0 && (
          <p style={{ color: "var(--text-muted)" }}>No posts yet. Check back soon.</p>
        )}
      </div>
    </div>
  );
}
