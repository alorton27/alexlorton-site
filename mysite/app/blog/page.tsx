import styles from "./blog.module.css";
import sanitizeHtml from "sanitize-html";
import { XMLParser } from "fast-xml-parser";

type Post = {
  title: string;
  link: string;
  pubDate: string;
  bodyHtml: string; // sanitized, full HTML
};

// Safely convert XML node (string | {__cdata|#text|...}) to string
function textify(v: any): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object") {
    // common shapes from fast-xml-parser
    if (typeof v.__cdata === "string") return v.__cdata;
    if (typeof v["#text"] === "string") return v["#text"];
    // last resort: first string value
    const firstStr = Object.values(v).find((x) => typeof x === "string");
    if (firstStr) return String(firstStr);
  }
  return String(v);
}

async function fetchPosts(): Promise<Post[]> {
  const controller = new AbortController();
  const to = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch("https://alexlorton.substack.com/feed", {
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
      processEntities: true,
    });
    const parsed = parser.parse(xml);
    const items = parsed?.rss?.channel?.item ?? [];

    return items.map((it: any): Post => {
      const title = textify(it?.title);
      const link = textify(it?.link);
      const pubDate = textify(it?.pubDate);

      const raw =
        it?.["content:encoded"]?.__cdata ??
        it?.["content:encoded"] ??
        it?.description ??
        "";
      const rawHtml = typeof raw === "string" ? raw : textify(raw);

      const bodyHtml = sanitizeHtml(rawHtml, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat([
          "img",
          "figure",
          "figcaption",
          "iframe",
        ]),
        allowedAttributes: {
          ...sanitizeHtml.defaults.allowedAttributes,
          img: [
            "src",
            "alt",
            "title",
            "width",
            "height",
            "srcset",
            "sizes",
            "loading",
          ],
          a: ["href", "name", "target", "rel"],
          iframe: ["src", "width", "height", "allow", "allowfullscreen"],
        },
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

      return { title, link, pubDate, bodyHtml };
    });
  } catch {
    return [];
  }
}

export default async function BlogPage() {
  const posts = await fetchPosts();

  return (
    <main className={styles.wrap}>
      <h1 className={styles.title}>Re:Start</h1>
      <p className={styles.subtitle}>Published on Substack, shown here.</p>

      {posts.map((p) => {
        const dateStr = p.pubDate
          ? new Date(p.pubDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "";

        return (
          <article key={p.link} className={styles.post}>
            <header className={styles.header}>
              <h2 className={styles.postTitle}>{p.title}</h2>
              {dateStr && (
                <time
                  className={styles.date}
                  dateTime={new Date(p.pubDate).toISOString()}
                >
                  {dateStr}
                </time>
              )}
            </header>

            {/* Render full Substack HTML (includes the hero image already) */}
            <div
              className={styles.body}
              dangerouslySetInnerHTML={{ __html: p.bodyHtml }}
            />

            <p className={styles.canonical}>
              <a href={p.link} target="_blank" rel="noreferrer">
                View on Substack ↗
              </a>
            </p>
          </article>
        );
      })}
    </main>
  );
}
