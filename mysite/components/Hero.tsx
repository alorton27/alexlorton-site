// Rotating hero background with 15s per image and 3s crossfade
// =============================
"use client";

import { useEffect, useState } from "react";

// If you already have your images array, keep it; this is a minimal stub:
const HERO_IMAGES = [
  "/hero/nyc.jpg",
  "/hero/ohio-stadium.jpg",
  "/hero/marathon.jpg",
  "/hero/entrepreneurship.jpg",
  "/hero/fatherhood.jpg",
];

export default function Hero() {
  const [index, setIndex] = useState(0);

  // 15s display, 3s crossfade handled via CSS utility classes
  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % HERO_IMAGES.length);
    }, 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative h-[calc(100vh-64px)] w-full overflow-hidden">
      {/* Backgrounds */}
      {HERO_IMAGES.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[3000ms] ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* Dark scrim for readability */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Copy */}
      <div className="relative z-10 h-full flex items-center justify-center text-center px-6">
        <div className="max-w-3xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.65)]">
            Hi, I’m Alex. I’m an entrepreneur, runner, dad, New Yorker, Ohioan and more. This is my place to build personal tools and experiments. Drop me a line to connect.
          </h1>
        </div>
      </div>
    </section>
  );
}
