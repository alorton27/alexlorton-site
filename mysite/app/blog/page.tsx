import Link from "next/link";
import Image from "next/image";
import { fetchSubstackFeed } from "@/lib/substack";

export const revalidate = 600; // ISR: refresh every 10 minutes in prod

export default async function BlogIndex() {
  const posts = await fetchSubstackFeed();

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-semibold mb-2">Re:Start</h1>
      <p className="opacity-70 mb-8">Published on Substack, shown here.</p>

      {posts.length === 0 && (
        <div className="rounded-xl border border-white/10 bg-surface/80 p-6">
          <p className="opacity-70">No posts yet.</p>
        </div>
      )}

      <ul className="grid gap-6">
        {posts.map((p) => (
          <li key={p.id}>
            <Link
              href={p.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex gap-4 rounded-xl border border-white/10 bg-surface/80 p-5 transition hover:shadow-brand"
            >
              {p.cover && (
                <Image
                  src={p.cover}
                  alt=""
                  width={160}
                  height={106}
                  className="rounded-md object-cover aspect-[3/2]"
                />
              )}
              <div className="min-w-0">
                <h2 className="text-xl font-medium group-hover:underline">{p.title}</h2>
                <p className="text-sm opacity-60">{new Date(p.date).toLocaleDateString()}</p>
                {p.excerpt && <p className="mt-2 opacity-80 line-clamp-3">{p.excerpt}</p>}
                <span className="mt-3 inline-block text-sm underline underline-offset-4 opacity-80">
                  Read on Substack ↗
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
