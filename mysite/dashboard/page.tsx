// app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions"; // <-- path you already have in your project
import {
  NotebookText,
  Users,
  Wand2,
  LayoutTemplate,
  Settings,
  FolderKanban,
} from "lucide-react";
import Link from "next/link";

type Tile = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
};

const TILES: Tile[] = [
  { href: "/dashboard/blog", label: "Blog", icon: NotebookText },
  { href: "/dashboard/users", label: "User Management", icon: Users },
  { href: "/dashboard/ai", label: "AI Sandbox", icon: Wand2, badge: "Beta" },
  { href: "/dashboard/wysiwyg", label: "Public Site WYSIWYG", icon: LayoutTemplate },
  { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const name = session.user?.name ?? "there";

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
      {/* Top bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">
            Good {greeting()}, {firstName(name)}
          </h1>
          <p className="mt-1 text-sm opacity-70">
            Welcome back. Manage your apps and site settings here.
          </p>
        </div>

        {/* Quick actions placeholder */}
        <div className="flex gap-2">
          <button className="btn btn-primary">New Project</button>
          <Link href="/dashboard/settings" className="btn btn-ghost">
            Preferences
          </Link>
        </div>
      </div>

      {/* Tasks */}
      <section className="mt-6">
        <div className="rounded-xl border border-white/10 bg-surface/80 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium opacity-80">Your Tasks</h2>
            <Link href="/dashboard/tasks" className="text-sm link">See all</Link>
          </div>
          <div className="mt-3 text-sm opacity-60">
            No open tasks. Enjoy the quiet ✨
          </div>
        </div>
      </section>

      {/* Tiles */}
      <section className="mt-6">
        <h2 className="sr-only">Your Apps</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TILES.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="group rounded-xl border border-white/10 bg-surface/80 p-4 transition hover:translate-y-[-2px] hover:shadow-brand"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-white/10 bg-white/10 p-2">
                  <t.icon className="h-6 w-6 opacity-90" />
                </div>
                <div>
                  <div className="font-medium">
                    {t.label}
                    {t.badge && (
                      <span className="ml-2 text-xs rounded-full px-2 py-0.5 bg-white/10 opacity-80">
                        {t.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-sm opacity-60">
                    Open {t.label.toLowerCase()}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}
function firstName(n: string) {
  return n.split(" ")[0];
}
