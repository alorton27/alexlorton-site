// =============================
"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Full-page Pong
 * - ArrowUp/ArrowDown OR W/S to move left paddle
 * - Right paddle is simple AI
 * - Space to pause/resume, R to reset
 * - Touch controls on mobile (left/right halves)
 * - Yellow border around the playfield
 */

type Vec = { x: number; y: number };

const BORDER_COLOR = "#FFD60A";
const BG_LIGHT = "#ffffff";
const BG_DARK = "#0a0a0a";

export default function PongPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const rafRef = useRef<number | null>(null);

  // Game state
  const [paused, setPaused] = useState<boolean>(true);
  const [scoreL, setScoreL] = useState(0);
  const [scoreR, setScoreR] = useState(0);

  // Internal mutable state
  const stateRef = useRef({
    width: 0,
    height: 0,
    // virtual canvas size in CSS pixels (we scale for DPR)
    paddleH: 90,
    paddleW: 10,
    padL: { x: 24, y: 0 },
    padR: { x: 0, y: 0 },
    padSpeed: 8,
    ball: { pos: { x: 0, y: 0 }, vel: { x: 6, y: 4 }, r: 7 },
    keys: { up: false, down: false, w: false, s: false },
    dark: false,
  });

  // Fit canvas to available viewport (below the header, above our footer controls)
  useEffect(() => {
    function setupCanvas() {
      const c = canvasRef.current;
      if (!c) return;

      // reserve a little space for header text + footer controls in this page
      const headerReserve = 64; // global site nav
      const controlsReserve = 72;

      const cssWidth = window.innerWidth;
      const cssHeight = Math.max(300, window.innerHeight - headerReserve - controlsReserve);

      const dpr = Math.max(1, window.devicePixelRatio || 1);
      c.width = Math.floor(cssWidth * dpr);
      c.height = Math.floor(cssHeight * dpr);
      c.style.width = `${cssWidth}px`;
      c.style.height = `${cssHeight}px`;

      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      ctxRef.current = ctx;

      // Store logical size in CSS pixels
      stateRef.current.width = cssWidth;
      stateRef.current.height = cssHeight;

      // Layout paddles and ball
      const s = stateRef.current;
      s.paddleH = Math.max(70, Math.floor(cssHeight * 0.18));
      s.paddleW = 10;
      s.padL.x = 24;
      s.padL.y = cssHeight / 2 - s.paddleH / 2;
      s.padR.x = cssWidth - s.paddleW - 24;
      s.padR.y = cssHeight / 2 - s.paddleH / 2;
      s.ball.pos = { x: cssWidth / 2, y: cssHeight / 2 };
      s.ball.vel = { x: 6 * (Math.random() > 0.5 ? 1 : -1), y: (Math.random() * 4 + 2) * (Math.random() > 0.5 ? 1 : -1) };
      s.ball.r = Math.max(6, Math.floor(Math.min(cssWidth, cssHeight) * 0.012));
    }

    setupCanvas();
    const onResize = () => setupCanvas();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Keyboard
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.code === "ArrowUp") stateRef.current.keys.up = true;
      if (e.code === "ArrowDown") stateRef.current.keys.down = true;
      if (e.code === "KeyW") stateRef.current.keys.w = true;
      if (e.code === "KeyS") stateRef.current.keys.s = true;
      if (e.code === "Space") setPaused((p) => !p);
      if (e.code === "KeyR") resetRound();
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.code === "ArrowUp") stateRef.current.keys.up = false;
      if (e.code === "ArrowDown") stateRef.current.keys.down = false;
      if (e.code === "KeyW") stateRef.current.keys.w = false;
      if (e.code === "KeyS") stateRef.current.keys.s = false;
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

  // Pause when tab hidden
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) setPaused(true);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // Touch controls: left half = up, right half = down (simple)
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;

    const onTouchStart = (e: TouchEvent) => {
      if (!c) return;
      const rect = c.getBoundingClientRect();
      for (const t of Array.from(e.touches)) {
        const y = t.clientY - rect.top;
        const topHalf = y < rect.height / 2;
        // on mobile: top = up, bottom = down
        stateRef.current.keys.up = topHalf;
        stateRef.current.keys.down = !topHalf;
      }
    };
    const onTouchEnd = () => {
      stateRef.current.keys.up = false;
      stateRef.current.keys.down = false;
    };

    c.addEventListener("touchstart", onTouchStart);
    c.addEventListener("touchmove", onTouchStart);
    c.addEventListener("touchend", onTouchEnd);
    c.addEventListener("touchcancel", onTouchEnd);
    return () => {
      c.removeEventListener("touchstart", onTouchStart);
      c.removeEventListener("touchmove", onTouchStart);
      c.removeEventListener("touchend", onTouchEnd);
      c.removeEventListener("touchcancel", onTouchEnd);
    };
  }, []);

  function resetRound(scoredLeft?: boolean) {
    const s = stateRef.current;
    s.ball.pos = { x: s.width / 2, y: s.height / 2 };
    s.ball.vel = {
      x: (scoredLeft ? -1 : 1) * (6 + Math.random() * 2) * (Math.random() > 0.5 ? 1 : -1),
      y: (Math.random() * 4 + 2) * (Math.random() > 0.5 ? 1 : -1),
    };
    s.padL.y = s.height / 2 - s.paddleH / 2;
    s.padR.y = s.height / 2 - s.paddleH / 2;
  }

  // Main loop
  useEffect(() => {
    function step() {
      const ctx = ctxRef.current;
      if (!ctx) return;

      const s = stateRef.current;

      // Clear
      ctx.fillStyle = s.dark ? BG_DARK : BG_LIGHT;
      ctx.fillRect(0, 0, s.width, s.height);

      // Midline
      ctx.strokeStyle = "rgba(0,0,0,0.08)";
      if (s.dark) ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.setLineDash([6, 10]);
      ctx.beginPath();
      ctx.moveTo(s.width / 2, 0);
      ctx.lineTo(s.width / 2, s.height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Update paddles (left: human, right: simple AI)
      const moveUp = s.keys.up || s.keys.w;
      const moveDown = s.keys.down || s.keys.s;
      if (!paused) {
        if (moveUp) s.padL.y -= s.padSpeed;
        if (moveDown) s.padL.y += s.padSpeed;
        s.padL.y = clamp(s.padL.y, 0, s.height - s.paddleH);

        // AI tries to track ball with slight easing
        const target = s.ball.pos.y - s.paddleH / 2;
        s.padR.y += (target - s.padR.y) * 0.08;
        s.padR.y = clamp(s.padR.y, 0, s.height - s.paddleH);

        // Move ball
        s.ball.pos.x += s.ball.vel.x;
        s.ball.pos.y += s.ball.vel.y;

        // Collide top/bottom
        if (s.ball.pos.y - s.ball.r < 0 || s.ball.pos.y + s.ball.r > s.height) {
          s.ball.vel.y *= -1;
          s.ball.pos.y = clamp(s.ball.pos.y, s.ball.r, s.height - s.ball.r);
        }

        // Collide paddles
        // Left
        if (
          s.ball.pos.x - s.ball.r < s.padL.x + s.paddleW &&
          s.ball.pos.y > s.padL.y &&
          s.ball.pos.y < s.padL.y + s.paddleH &&
          s.ball.vel.x < 0
        ) {
          s.ball.vel.x *= -1;
          // add some "english" based on where it hits the paddle
          const hit = (s.ball.pos.y - (s.padL.y + s.paddleH / 2)) / (s.paddleH / 2);
          s.ball.vel.y += hit * 3;
        }
        // Right
        if (
          s.ball.pos.x + s.ball.r > s.padR.x &&
          s.ball.pos.y > s.padR.y &&
          s.ball.pos.y < s.padR.y + s.paddleH &&
          s.ball.vel.x > 0
        ) {
          s.ball.vel.x *= -1;
          const hit = (s.ball.pos.y - (s.padR.y + s.paddleH / 2)) / (s.paddleH / 2);
          s.ball.vel.y += hit * 3;
        }

        // Score
        if (s.ball.pos.x < -30) {
          setScoreR((n) => n + 1);
          resetRound(true);
          setPaused(true);
        } else if (s.ball.pos.x > s.width + 30) {
          setScoreL((n) => n + 1);
          resetRound(false);
          setPaused(true);
        }
      }

      // Draw paddles
      ctx.fillStyle = s.dark ? "#e5e7eb" : "#111827";
      ctx.fillRect(s.padL.x, s.padL.y, s.paddleW, s.paddleH);
      ctx.fillRect(s.padR.x, s.padR.y, s.paddleW, s.paddleH);

      // Draw ball
      ctx.beginPath();
      ctx.arc(s.ball.pos.x, s.ball.pos.y, s.ball.r, 0, Math.PI * 2);
      ctx.fill();

      // Draw score
      ctx.font = "bold 28px ui-sans-serif, system-ui, -apple-system, Segoe UI";
      ctx.textAlign = "center";
      ctx.fillText(`${scoreL}`, s.width / 2 - 40, 40);
      ctx.fillText(`${scoreR}`, s.width / 2 + 40, 40);

      // Help text when paused
      if (paused) {
        ctx.font = "16px ui-sans-serif, system-ui, -apple-system, Segoe UI";
        ctx.textAlign = "center";
        ctx.fillText("Press Space to start / pause — R to reset — W/S or ↑/↓ to move", s.width / 2, s.height - 18);
      }

      rafRef.current = requestAnimationFrame(step);
    }

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [paused, scoreL, scoreR]);

  function resetMatch() {
    setScoreL(0);
    setScoreR(0);
    resetRound();
    setPaused(true);
  }

  return (
    <div className="w-full min-h-[calc(100vh-64px)] flex flex-col bg-white dark:bg-neutral-950">
      {/* Keep your global nav above; page header below */}
      <header className="px-4 sm:px-6 py-3 border-b bg-white/80 dark:bg-neutral-900/70">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <h1 className="text-xl font-semibold">Pong</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setPaused((p) => !p)}
              className="rounded border px-3 py-1 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
              aria-pressed={!paused}
            >
              {paused ? "Start" : "Pause"}
            </button>
            <button
              onClick={resetMatch}
              className="rounded border px-3 py-1 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Reset
            </button>
          </div>
        </div>
      </header>

      {/* Playfield with yellow border */}
      <div className="relative flex-1 border-4" style={{ borderColor: BORDER_COLOR }}>
        <canvas ref={canvasRef} className="absolute inset-0 block touch-none" />
      </div>

      {/* Footer spacer (keeps controls visible if you add more later) */}
      <div className="h-[72px] flex items-center justify-center text-xs text-neutral-500">
        ↑/↓ or W/S to move • Space to pause • R to reset
      </div>
    </div>
  );
}

// Helpers
function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}
