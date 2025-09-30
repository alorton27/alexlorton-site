import Image from "next/image";
import DOMPurify from "isomorphic-dompurify"; // not needed server-side; we'll use sanitize-html instead
import he from "he";
import sanitizeHtml from "sanitize-html";
import { XMLParser } from "fast-xml-parser";

// ---- types
type Post = {
  title: string;
  link: string;
  pubDate: string;
  image?: string | null;
  html: string;         // sanitized full HTML body
  plain?: string;       // optional text-only
};

async function fetchPosts(): Promise<Post[]> {
  const controller = new AbortController();
  const to = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch("https://alexlorton.substack.com/feed", {
      // If you want caching, swap to: next: { revalidate: 600 }
      cache: "no-store",
      signal: controller.signal,
      headers: { Accept: "application/rss+xml, text/xml" },
    });
    clearTimeout(to);
    if (!res.ok) return [];

    const xml = await res.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      cdataPropName: "__cdata",
      processEntities: true, // decodes common entities in text nodes
    });
    const parsed = parser.parse(xml);

    const items = parsed?.rss?.channel?.item ?? [];
    return items.map((it: any): Post => {
      // Title/date
      const title = he.decode(it.title ?? "");
      const pubDate = it.pubDate ?? "";
      const link = it.link ?? "";

      // Prefer <content:encoded> (full body). Some feeds put it under "content:encoded".
      const rawHtml =
        it["content:encoded"]?.__cdata ??
        it["content:encoded"] ??
        it.description ??
        "";

      // Try to find a lead image: <media:content>, <enclosure>, or first <img> in content.
      let image: string | null = null;
      const enclosure = it.enclosure?.["@_url"];
      const media = it["media:content"]?.["@_url"];
      image = enclosure || media || null;

      // Fallback: sniff the first <img src="..."> in the HTML
      if (!image && typeof rawHtml === "string") {
        const m = rawHtml.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (m) image = m[1];
      }

      // Sanitize the full HTML so we can render in-page safely.
      const html = sanitizeHtml(String(rawHtml), {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "figure", "figcaption"]),
        allowedAttributes: {
          ...sanitizeHtml.defaults.allowedAttributes,
          img: ["src", "alt", "title", "width", "height", "srcset", "sizes", "loading"],
          a: ["href", "name", "target", "rel"],
        },
        // Add rel attrs to external links
        transformTags: {
          a: (tagName, attribs) => ({
            tagName: "a",
            attribs: {
              ...attribs,
              rel: attribs.rel ?? "noopener noreferrer",
              target: attribs.target ?? "_blank",
            },
          }),
        },
      });

      return { title, link, pubDate, image, html };
    });
  } catch {
    return [];
  }
}

export default async function BlogPage() {
  const posts = await fetchPosts();

  return (
    <main className="prose mx-auto px-4 py-10">
      <h1>Re:Start</h1>
      <p className="text-sm text-gray-500">Published on Substack, shown here.</p>

      {posts.length === 0 && (
        <p>
          Couldn’t load posts right now.{" "}
          <a href="https://alexlorton.substack.com" target="_blank" rel="noreferrer">
            Read on Substack ↗
          </a>
        </p>
      )}

      {posts.map((p) => (
        <article key={p.link} className="not-prose border-b pb-10 mb-10">
          <header className="prose">
            <h2 className="mb-1">{p.title}</h2>
            <p className="text-sm text-gray-500">{new Date(p.pubDate).toLocaleDateString()}</p>
          </header>

          {p.image && (
            <div className="my-4">
              <Image
                src={p.image}
                alt={p.title}
                width={1200}
                height={630}
                sizes="(max-width: 768px) 100vw, 1200px"
                style={{ width: "100%", height: "auto" }}
              />
            </div>
          )}

          {/* FULL BODY from Substack feed (sanitized) */}
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: p.html }} />

          {/* Optional: a small link back to the canonical */}
          <p className="prose mt-4">
            <a href={p.link} target="_blank" rel="noreferrer">
              View on Substack ↗
            </a>
          </p>
        </article>
      ))}
    </main>
  );
}
