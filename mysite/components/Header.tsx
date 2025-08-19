// Top navigation with dropdown (Fun) + mobile menu
// =============================
"use client";
import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";


const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
<Link href={href} className="px-3 py-2 rounded-lg text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800">
{children}
</Link>
);


export default function Header() {
const [open, setOpen] = useState(false);


return (
<header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur dark:bg-neutral-900/70">
<div className="mx-auto max-w-5xl px-4 sm:px-6 h-14 flex items-center justify-between">
<Link href="/" className="font-semibold">Alex Lorton</Link>


{/* Desktop nav */}
<nav className="hidden md:flex items-center gap-1">
<NavLink href="/about">About</NavLink>
<NavLink href="/contact">Contact</NavLink>


{/* Fun dropdown */}
<div className="relative group">
<button className="px-3 py-2 rounded-lg text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 inline-flex items-center gap-1">
Fun <ChevronDown size={16} />
</button>
<div className="absolute left-0 mt-2 hidden group-hover:block">
<div className="rounded-xl border bg-white dark:bg-neutral-900 shadow-lg p-2 w-44">
<Link href="/fun/relax" className="block px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">Relax</Link>
<Link href="/fun/whiteboard" className="block px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">White Board</Link>
<Link href="/fun/game" className="block px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">Game</Link>
<Link href="/fun/pizza-party" className="block px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">Pizza Party</Link>
</div>
</div>
</div>


<NavLink href="/projects">Projects</NavLink>
<NavLink href="/login">Sign In</NavLink>
</nav>


{/* Mobile toggle */}
<button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Toggle menu">
{open ? <X /> : <Menu />}
</button>
</div>


{/* Mobile menu */}
{open && (
<div className="md:hidden border-t bg-white dark:bg-neutral-900">
<div className="mx-auto max-w-5xl px-4 py-3 grid gap-2">
<NavLink href="/about">About</NavLink>
<NavLink href="/contact">Contact</NavLink>
<details className="[&_summary]:list-none">
<summary className="px-3 py-2 rounded-lg text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 inline-flex items-center gap-1 cursor-pointer">
Fun <ChevronDown size={16} />
</summary>
<div className="ml-2 grid gap-1 py-1">
<Link href="/fun/relax" className="px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">Relax</Link>
<Link href="/fun/whiteboard" className="px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">White Board</Link>
<Link href="/fun/game" className="px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">Game</Link>
<Link href="/fun/pizza-party" className="px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">Pizza Party</Link>
</div>
</details>
<NavLink href="/projects">Projects</NavLink>
<NavLink href="/login">Sign In</NavLink>
</div>
</div>
)}
</header>
);
}