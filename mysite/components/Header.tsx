// components/Header.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef } from "react";
import { ChevronDown, Menu, X } from "lucide-react";

/** Shared link styling */
const NavLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <Link
    href={href}
    className="px-3 py-2 rounded-lg text-sm font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800"
  >
    {children}
  </Link>
);

/** Desktop Fun dropdown with hover bridge and gentle close delay */
function FunMenu() {
  const [open, setOpen] = useState(false);
  const closeT = useRef<number | null>(null);

  const openNow = () => {
    if (closeT.current) window.clearTimeout(closeT.current);
    setOpen(true);
  };
  const closeSoon = () => {
    if (closeT.current) window.clearTimeout(closeT.current);
    closeT.current = window.setTimeout(() => setOpen(false), 140);
  };

  return (
    <div
      className="relative"
      onMouseEnter={openNow}
      onMouseLeave={closeSoon}
    >
      <button
        type="button"
        className="px-3 py-2 rounded-lg text-sm font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 inline-flex items-center gap-1"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        Fun
        <ChevronDown
          size={16}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        // pt-2 = small "hover bridge" so there's no dead zone between button and menu
        <div className="absolute left-0 top-full pt-2">
          <div className="rounded-xl border bg-white dark:bg-neutral-900 shadow-lg p-2 w-48">
            <Link
              href="/fun/relax"
              role="menuitem"
              className="block px-3 py-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
              onClick={() => setOpen(false)}
            >
              Relax
            </Link>
            <Link
              href="/fun/whiteboard"
              role="menuitem"
              className="block px-3 py-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
              onClick={() => setOpen(false)}
            >
              White Board
            </Link>
            <Link
              href="/fun/game"
              role="menuitem"
              className="block px-3 py-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
              onClick={() => setOpen(false)}
            >
              Game
            </Link>
            <Link
              href="/fun/pizza-party"
              role="menuitem"
              className="block px-3 py-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
              onClick={() => setOpen(false)}
            >
              Pizza Party
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur dark:bg-neutral-900/70">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 h-20 flex items-center justify-between">
        {/* Logo (light/dark variants) */}
        <Link href="/" className="flex items-center" aria-label="Go to home">
          {/* Show colored/dark-ink logo on LIGHT mode */}
          <Image
            src="/logo-light.png"
            alt="Alex Lorton Logo"
            width={360}
            height={200}
            priority
            className="block dark:hidden h-20 w-auto"
          />
          {/* Show white logo on DARK mode */}
          <Image
            src="/logo-dark.png"
            alt="Alex Lorton Logo (Dark Mode)"
            width={360}
            height={200}
            priority
            className="hidden dark:block h-20 w-auto"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLink href="/about">About</NavLink>
          <NavLink href="/contact">Contact</NavLink>
          <FunMenu />
          <NavLink href="/login">Sign In</NavLink>
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t bg-white dark:bg-neutral-900">
          <div className="mx-auto max-w-5xl px-4 py-3 grid gap-2">
            <NavLink href="/about">About</NavLink>
            <NavLink href="/contact">Contact</NavLink>

            {/* Mobile Fun group */}
            <details className="[&_summary]:list-none">
              <summary className="px-3 py-2 rounded-lg text-sm font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 inline-flex items-center gap-1 cursor-pointer">
                Fun <ChevronDown size={16} />
              </summary>
              <div className="ml-2 grid gap-1 py-1">
                <Link
                  href="/fun/relax"
                  className="px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  onClick={() => setOpen(false)}
                >
                  Relax
                </Link>
                <Link
                  href="/fun/whiteboard"
                  className="px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  onClick={() => setOpen(false)}
                >
                  White Board
                </Link>
                <Link
                  href="/fun/game"
                  className="px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  onClick={() => setOpen(false)}
                >
                  Game
                </Link>
                <Link
                  href="/fun/pizza-party"
                  className="px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  onClick={() => setOpen(false)}
                >
                  Pizza Party
                </Link>
              </div>
            </details>

            <NavLink href="/login">Sign In</NavLink>
          </div>
        </div>
      )}
    </header>
  );
}
