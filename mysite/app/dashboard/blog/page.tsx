import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

const ADMIN_SUBSTACK_URL =
  process.env.ADMIN_SUBSTACK_URL || "https://substack.com/publish";

export default async function BlogAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/dashboard/blog");

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-semibold">Blog</h1>
      <p className="opacity-70">
        Blog posts are authored on Substack and automatically appear on{" "}
        <code>/blog</code> via RSS.
      </p>

      <div className="mt-6 flex gap-3">
        <a
          href={ADMIN_SUBSTACK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
        >
          Open Substack Publisher ↗
        </a>
        <a
          href="/blog"
          className="btn btn-ghost"
          target="_blank"
          rel="noopener noreferrer"
        >
          View Blog on Site
        </a>
      </div>

      <div className="mt-8 rounded-xl border border-white/10 bg-surface/80 p-4 text-sm opacity-80">
        <ul className="list-disc pl-5 space-y-1">
          <li>Publish or edit posts on Substack.</li>
          <li>
            Your site’s <code>/blog</code> lists latest posts (refreshes every ~10 minutes).
          </li>
          <li>Use large images in Substack for nicer cards here.</li>
        </ul>
      </div>
    </div>
  );
}
