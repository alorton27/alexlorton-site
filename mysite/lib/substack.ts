import { XMLParser } from "fast-xml-parser";

export type BlogItem = {
  id: string;
  title: string;
  link: string;
  date: string;          // ISO
  excerpt?: string;
  cover?: string;        // try to pull first image
};

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

export async function fetchSubstackFeed(): Promise<BlogItem[]> {
  const url = process.env.SUBSTACK_FEED_URL;
  if (!url) return [];

  const res = await fetch(url, { cache: "no-store" }); // latest every request in preview; we’ll revalidate on page
  if (!res.ok) return [];

  const xml = await res.text();
  const json: any = parser.parse(xml);

  // Substack uses RSS 2.0
  const items: any[] = json?.rss?.channel?.item ?? [];
  return items.map((it) => {
    const html: string = it["content:encoded"] ?? it.description ?? "";
    return {
      id: it.guid?.["#text"] || it.guid || it.link,
      title: it.title,
      link: it.link,
      date: new Date(it.pubDate).toISOString(),
      excerpt: strip(html).slice(0, 220) + (html ? "…" : ""),
      cover: extractFirstImg(html),
    };
  });
}

function extractFirstImg(html: string): string | undefined {
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : undefined;
}
function strip(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}
