// =============================
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Nav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const links = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/fun", label: "Fun" },
    { href: "/login", label: "Sign In" },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur dark:bg-neutral-900/70">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-semibold">alexlorton.com</Link>

        <div className="flex items-center gap-4">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm hover:underline ${pathname === l.href ? "font-medium" : ""}`}
            >
              {l.label}
            </Link>
          ))}

          {/* Projects only when signed in */}
          {session?.user && (
            <Link
              href="/projects"
              className={`text-sm hover:underline ${pathname === "/projects" ? "font-medium" : ""}`}
            >
              Projects
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
