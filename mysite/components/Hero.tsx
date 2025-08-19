// Rotating hero background with 15s per image and 3s crossfade
// =============================
"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { HERO_IMAGES } from "@/lib/heroImages";

const DISPLAY_MS = 15000; // 15s per image
export default function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % HERO_IMAGES.length);
    }, DISPLAY_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-[46vh] sm:h-[54vh] md:h-[62vh] w-full overflow-hidden">
      {/* All images stacked; active one fades in */}
      {HERO_IMAGES.map((img, i) => (
        <Image
          key={img.src}
          src={img.src}
          alt={img.alt}
          fill
          priority={i === 0}
          className={`absolute inset-0 object-cover transition-opacity duration-[3000ms] ease-in-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* Overlay gradient to ensure contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/35 to-transparent" />

      {/* Headline & copy */}
      <div className="absolute inset-0 flex items-end pb-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 w-full">
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            Alex Lorton
          </h1>
          <p className="mt-3 text-white/95 text-xl sm:text-2xl max-w-3xl drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
            Hi, I’m Alex. I’m an entrepreneur, runner, dad, New Yorker, Ohioan and more. This is my place to build personal tools and experiments. Drop me a line to connect.
          </p>
          <div className="mt-5 flex gap-3">
            <a href="/projects" className="rounded-xl bg-white text-black px-4 py-2 text-sm font-medium hover:opacity-90">Explore Projects</a>
            <a href="/dashboard" className="rounded-xl border border-white/80 text-white px-4 py-2 text-sm font-medium hover:bg-white/10">Go to Dashboard</a>
          </div>
        </div>
      </div>
    </section>
  );
}
