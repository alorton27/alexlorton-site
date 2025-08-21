// =============================
"use client";

import NextImage from "next/image";
import { useEffect, useState } from "react";

type Topping = { key: string; label: string; src: string; alt: string };

// Map each topping to an image path in /public/pizza/ (PNG versions)
const TOPPINGS: Topping[] = [
  { key: "pepperoni", label: "Pepperoni", src: "/pizza/pepperoni.png", alt: "Pepperoni pizza" },
  { key: "sausage", label: "Sausage", src: "/pizza/sausage.png", alt: "Sausage pizza" },
  { key: "sausage-magic", label: "Sausage and Magic", src: "/pizza/sausage-magic.png", alt: "Sausage and Magic pizza" },
  { key: "mystery", label: "Mystery", src: "/pizza/mystery.png", alt: "Mystery pizza" },
  { key: "pizza", label: "Pizza", src: "/pizza/pizza.png", alt: "Pizza on pizza" },
  { key: "pisa", label: "Pisa", src: "/pizza/pisa.png", alt: "Leaning Tower of Pisa themed pizza" },
  { key: "patriotism", label: "Patriotism", src: "/pizza/patriotism.png", alt: "Patriotic pizza" },
  { key: "ultra-patriotism", label: "ULTRA Patriotism", src: "/pizza/ultra-patriotism.png", alt: "Ultra patriotic pizza" },
  { key: "peppy-pepperoni", label: "Peppy Pepperoni", src: "/pizza/peppy-pepperoni.png", alt: "Extra peppy pepperoni pizza" },
  { key: "preppy-peppy-pepperoni", label: "Preppy Peppy Pepperoni", src: "/pizza/preppy-peppy-pepperoni.png", alt: "Preppy Peppy Pepperoni pizza" },
  { key: "peppers", label: "Peppers", src: "/pizza/peppers.png", alt: "Pizza with peppers" },
  { key: "peepers", label: "Peepers", src: "/pizza/peepers.png", alt: "Pizza with peepers" },
  { key: "puppers", label: "Puppers", src: "/pizza/puppers.png", alt: "Puppers themed pizza" },
  { key: "preppers", label: "Preppers", src: "/pizza/preppers.png", alt: "Preppers themed pizza" },
  { key: "papers", label: "Papers", src: "/pizza/papers.png", alt: "Papers themed pizza" },
];

// Default base pizza (plain cheese)
const BASE_PIZZA: Topping = {
  key: "cheese",
  label: "Plain Cheese",
  src: "/pizza/cheese.png",
  alt: "Plain cheese pizza",
};

export default function PizzaPartyPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [current, setCurrent] = useState<Topping>(BASE_PIZZA);

  // Preload images (browser-only)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const all = [BASE_PIZZA, ...TOPPINGS];
    all.forEach((t) => {
      const img = new window.Image();
      img.src = t.src;
    });
  }, []);

  function selectTopping(t: Topping) {
    setCurrent(t);
    setMobileOpen(false);
  }

  const Sidebar = (
    <nav className="h-full w-64 shrink-0 border-r bg-white/95 dark:bg-neutral-900/95 p-4 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-3">Toppings</h2>
      <button
        onClick={() => setCurrent(BASE_PIZZA)}
        className={`w-full text-left px-3 py-2 rounded-lg mb-2 border ${
          current.key === BASE_PIZZA.key
            ? "bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700"
            : "hover:bg-neutral-100 dark:hover:bg-neutral-800 border-transparent"
        }`}
      >
        {BASE_PIZZA.label}
      </button>
      <ul className="space-y-2">
        {TOPPINGS.map((t) => (
          <li key={t.key}>
            <button
              onClick={() => selectTopping(t)}
              className={`w-full text-left px-3 py-2 rounded-lg border ${
                current.key === t.key
                  ? "bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700"
                  : "hover:bg-neutral-100 dark:hover:bg-neutral-800 border-transparent"
              }`}
            >
              {t.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );

  return (
    <main className="min-h-[calc(100vh-64px)]">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-neutral-900/70">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex items-center gap-3">
          {/* Mobile drawer toggle */}
          <button
            className="md:hidden rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-controls="pizza-sidebar"
          >
            Toppings
          </button>
          <h1 className="text-xl sm:text-2xl font-semibold">
            Welcome to the Pizza Party! Pick your toppings and enjoy!
          </h1>
        </div>
      </header>

      {/* Layout */}
      <div className="mx-auto max-w-6xl flex">
        {/* Desktop sidebar (sticky) */}
        <aside id="pizza-sidebar" className="hidden md:block sticky top-[64px] h-[calc(100vh-64px)]">
          {Sidebar}
        </aside>

        {/* Mobile drawer */}
        <div
          className={`md:hidden fixed top-[64px] bottom-0 left-0 z-40 transform transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          aria-hidden={!mobileOpen}
        >
          <div className="h-full w-72 shadow-xl">{Sidebar}</div>
        </div>
        {/* Backdrop */}
        {mobileOpen && (
          <button
            className="md:hidden fixed inset-0 top-[64px] bg-black/30 z-30"
            onClick={() => setMobileOpen(false)}
            aria-label="Close toppings"
          />
        )}

        {/* Image stage */}
        <section className="flex-1 p-4 sm:p-6">
          <div className="relative w-full aspect-square sm:aspect-[4/3] rounded-2xl bg-white dark:bg-neutral-950 overflow-hidden">
            <NextImage
              key={current.src}
              src={current.src}
              alt={current.alt}
              fill
              className="object-contain"
              priority
            />
          </div>
        </section>
      </div>
    </main>
  );
}
