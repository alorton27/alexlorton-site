// =============================
"use client";

import { useEffect, useRef, useState } from "react";

export default function RelaxPage() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(true);
  const [vol, setVol] = useState(0.4);
  const [isPlaying, setIsPlaying] = useState(false);

  // Respect reduced-motion (pause video/GIF animation via CSS + keep audio muted)
  const [prefersReduced, setPrefersReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
    const onChange = () => setPrefersReduced(mq.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  // Keep audio element in sync with controls
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.muted = muted;
    audioRef.current.volume = vol;
    if (isPlaying && !muted) audioRef.current.play().catch(() => {});
    else audioRef.current.pause();
  }, [muted, vol, isPlaying]);

  // Mobile autoplay restrictions → start paused & muted; user can enable
  useEffect(() => {
    setIsPlaying(false);
    setMuted(true);
  }, []);

  return (
    <div className="w-full min-h-[calc(100vh-64px)] flex flex-col bg-black">
      {/* Header stays from your site layout; this is page header */}
      <header className="px-4 sm:px-6 py-3 border-b bg-white/80 dark:bg-neutral-900/70">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <h1 className="text-xl font-semibold">Relax</h1>
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => setIsPlaying((p) => !p)}
              className="rounded border px-3 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              {isPlaying ? "Pause" : "Play"} music
            </button>
            <button
              onClick={() => setMuted((m) => !m)}
              className="rounded border px-3 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              aria-pressed={!muted}
            >
              {muted ? "Unmute" : "Mute"}
            </button>
            <label className="hidden sm:flex items-center gap-2 ml-2">
              Vol
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={vol}
                onChange={(e) => setVol(Number(e.target.value))}
                className="accent-black dark:accent-white"
              />
            </label>
          </div>
        </div>
      </header>

      {/* Stage with yellow border like White Board */}
      <div className="relative flex-1 border-4" style={{ borderColor: "#FFD60A" }}>
        {/* Animated background (video preferred; GIF fallback). 
            Place files under /public/relax: scene.webm, scene.mp4, scene.gif */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Video if present (browsers will just show nothing if missing; GIF below still visible) */}
          <video
            className={`absolute inset-0 h-full w-full object-cover [image-rendering:pixelated] ${prefersReduced ? "opacity-0" : "opacity-100"}`}
            autoPlay
            loop
            muted
            playsInline
          >
            <source src="/relax/scene.webm" type="video/webm" />
            <source src="/relax/scene.mp4" type="video/mp4" />
          </video>

          {/* GIF fallback (always visible; we can visually hide if video active via stacking) */}
          <img
            src="/relax/scene.gif"
            alt="Relaxing retro nature scene"
            className="absolute inset-0 h-full w-full object-cover [image-rendering:pixelated]"
            aria-hidden
          />

          {/* Soft overlay to keep header text readable */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20 pointer-events-none" />
        </div>

        {/* Center message */}
        <div className="absolute inset-0 grid place-items-center pointer-events-none">
          <div className="text-center px-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.6)]">
              Breathe in, breathe out.
            </h2>
            <p className="mt-2 text-white/90 drop-shadow-[0_1px_8px_rgba(0,0,0,0.6)]">
              Sit back for a minute. You earned it.
            </p>
          </div>
        </div>
      </div>

      {/* Hidden/controlled audio element */}
      <audio ref={audioRef} loop preload="auto">
        <source src="/relax/music.mp3" type="audio/mpeg" />
        <source src="/relax/music.ogg" type="audio/ogg" />
      </audio>
    </div>
  );
}
