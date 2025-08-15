// =============================
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import ThemeToggle from "@/components/ThemeToggle";

const LinkItem = ({ href, label }: { href: string; label: string }) => {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={`px-3 py-2 rounded-xl text-sm transition hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
        active ? "bg-neutral-100 dark:bg-neutral-800 font-medium" : "text-neutral-700 dark:text-neutral-300"
      }`}
    >
      {label}
    </Link>
  );
};

export default function Nav() {
  const { status } = useSession();
  return (
    <nav className="w-full border-b bg-white/80 backdrop-blur dark:bg-neutral-900/70">
      <div className="mx-auto max-w-4xl p-3 sm:p-4 flex items-center gap-2">
        <Link href="/" className="mr-1 sm:mr-3 text-base sm:text-lg font-semibold">
          Alex Lorton
        </Link>
        <div className="hidden sm:flex items-center gap-1">
          <LinkItem href="/about" label="About" />
          <LinkItem href="/projects" label="Projects" />
          <LinkItem href="/dashboard" label="Dashboard" />
        </div>
        <div className="ml-auto flex items-center gap-2">
          {status === "authenticated" ? (
            <button onClick={() => signOut({ callbackUrl: "/" })} className="text-sm underline">
              Sign out
            </button>
          ) : (
            <button onClick={() => signIn(undefined, { callbackUrl: "/dashboard" })} className="text-sm underline">
              Sign in
            </button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}