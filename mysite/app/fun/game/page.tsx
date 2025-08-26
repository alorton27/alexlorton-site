// app/fun/game/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";

type Vec = { x: number; y: number };

const BORDER_COLOR = "#FFD60A";
const BG_LIGHT = "#ffffff";
const BG_DARK = "#0a0a0a";

export default function PongPage() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const rafRef = useRef<number | null>(null);

  // UI state
  const [paused, setPaused] = useState<boolean>(true);
  const [scoreL, setScoreL] = useState(0);
  const [scoreR, setScoreR] = useState(0);

  // Game state (mutable)
  const stateRef = useRef({
    width: 0,                 // logical (CSS) canvas size
    height: 0,
    dpr: 1,

    paddleH: 90,
    paddleW: 10,
    padL: { x: 24, y: 0 },
    padR: { x: 0, y: 0 },
    padSpeed: 8,

    ball: { pos: { x: 0, y: 0 }, vel: { x: 6, y: 4 }, r: 7 },
    maxBallSpeed: 20,
    speedBoost: 1.05,

    keys: { up: false, down: false, w: false, s: false },
    dark: false,
    inited: false,
  });

  /** Size canvas to the wrapper (between page header and help bar). */
  useEffect(() => {
    function measureAndSetup() {
      const wrap = wrapRef.current;
      const c = canvasRef.current;
      if (!wrap || !c) return;

      // Measure available size from wrapper
      const rect = wrap.getBoundingClientRect();
      const cssWidth = Math.max(320, Math.floor(rect.width));
      const cssHeight = Math.max(240, Math.floor(rect.height));

      const dpr = Math.max(1, window.devicePixelRatio || 1);

      const prevW = stateRef.current.width || cssWidth;
      const prevH = stateRef.current.height || cssHeight;
      const scaleX = cssWidth / prevW;
      const scaleY = cssHeight / prevH;

      c.width = Math.floor(cssWidth * dpr);
      c.height = Math.floor(cssHeight * dpr);
      c.style.width = `${cssWidth}px`;
      c.style.height = `${cssHeight}px`;

      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctxRef.current = ctx;

      const s = stateRef.current;
      s.width = cssWidth;
      s.height = cssHeight;
      s.dpr = dpr;

      // Resize paddles/ball proportionally (preserve state)
      s.paddleH = Math.max(70, Math.floor(cssHeight * 0.18));
      s.paddleW = 10;

      s.padL.x = 24;
      s.padL.y = clamp(s.padL.y * scaleY, 0, cssHeight - s.paddleH);

      s.padR.x = cssWidth - s.paddleW - 24;
      s.padR.y = clamp(s.padR.y * scaleY, 0, cssHeight - s.paddleH);

      s.ball.r = Math.max(6, Math.floor(Math.min(cssWidth, cssHeight) * 0.012));

      // On FIRST init, center the ball
      if (!s.inited || (s.ball.pos.x === 0 && s.ball.pos.y === 0)) {
        s.ball.pos = { x: cssWidth / 2, y: cssHeight / 2 };
        s.inited = true;
      } else {
        // Otherwise scale current ball position into new size
        s.ball.pos.x = clamp(s.ball.pos.x * scaleX, s.ball.r, cssWidth - s.ball.r);
        s.ball.pos.y = clamp(s.ball.pos.y * scaleY, s.ball.r, cssHeight - s.ball.r);
      }
    }

    measureAndSetup();
    const onResize = () => measureAndSetup();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /** Match light/dark */
  useEffect(() => {
    const mql = window.matchMedia?.("(prefers-color-scheme: dark)");
    const apply = () => (stateRef.current.dark = !!mql?.matches);
    apply();
    mql?.addEventListener?.("change", apply);
    return () => mql?.removeEventListener?.("change", apply);
  }, []);

  /** Keyboard */
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

  /** Touch */
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;

    const onTouch = (e: TouchEvent) => {
      const rect = c.getBoundingClientRect();
      const y = e.touches[0]?.clientY ?? rect.top;
      const topHalf = y - rect.top < rect.height / 2;
      stateRef.current.keys.up = topHalf;
      stateRef.current.keys.down = !topHalf;
    };
    const stop = () => {
      stateRef.current.keys.up = false;
      stateRef.current.keys.down = false;
    };

    c.addEventListener("touchstart", onTouch);
    c.addEventListener("touchmove", onTouch);
    c.addEventListener("touchend", stop);
    c.addEventListener("touchcancel", stop);
    return () => {
      c.removeEventListener("touchstart", onTouch);
      c.removeEventListener("touchmove", onTouch);
      c.removeEventListener("touchend", stop);
      c.removeEventListener("touchcancel", stop);
    };
  }, []);

  /** Pause when tab hidden */
  useEffect(() => {
    const onVis = () => { if (document.hidden) setPaused(true); };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  function resetRound(scoredLeft?: boolean) {
    const s = stateRef.current;
    s.ball.pos = { x: s.width / 2, y: s.height / 2 };

    const base = 6 + Math.random() * 2;
    const dirX = scoredLeft ? -1 : 1;
    const vx = dirX * base * (Math.random() > 0.5 ? 1 : -1);
    const vy = (Math.random() * 4 + 2) * (Math.random() > 0.5 ? 1 : -1);

    const sp = clamp(Math.hypot(vx, vy), 8, 10);
    const nx = vx / Math.hypot(vx, vy);
    const ny = vy / Math.hypot(vx, vy);
    s.ball.vel = { x: nx * sp, y: ny * sp };

    s.padL.y = s.height / 2 - s.paddleH / 2;
    s.padR.y = s.height / 2 - s.paddleH / 2;
  }

  useEffect(() => {
    function step() {
      const ctx = ctxRef.current;
      if (!ctx) return;
      const s = stateRef.current;

      // BG
      ctx.fillStyle = s.dark ? BG_DARK : BG_LIGHT;
      ctx.fillRect(0, 0, s.width, s.height);

      // Midline
      ctx.strokeStyle = s.dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";
      ctx.setLineDash([6, 10]);
      ctx.beginPath();
      ctx.moveTo(s.width / 2, 0);
      ctx.lineTo(s.width / 2, s.height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Update paddles/ball
      const moveUp = s.keys.up || s.keys.w;
      const moveDown = s.keys.down || s.keys.s;

      if (!paused) {
        if (moveUp) s.padL.y -= s.padSpeed;
        if (moveDown) s.padL.y += s.padSpeed;
        s.padL.y = clamp(s.padL.y, 0, s.height - s.paddleH);

        const aiEase = 0.08 + Math.min(0.06, (Math.abs(s.ball.vel.x) - 6) * 0.01);
        const target = s.ball.pos.y - s.paddleH / 2;
        s.padR.y += (target - s.padR.y) * aiEase;
        s.padR.y = clamp(s.padR.y, 0, s.height - s.paddleH);

        s.ball.pos.x += s.ball.vel.x;
        s.ball.pos.y += s.ball.vel.y;

        // Bounce walls
        if (s.ball.pos.y - s.ball.r < 0 || s.ball.pos.y + s.ball.r > s.height) {
          s.ball.vel.y *= -1;
          s.ball.pos.y = clamp(s.ball.pos.y, s.ball.r, s.height - s.ball.r);
        }

        // Paddle hits (speed up)
        // Left
        if (
          s.ball.pos.x - s.ball.r < s.padL.x + s.paddleW &&
          s.ball.pos.y > s.padL.y &&
          s.ball.pos.y < s.padL.y + s.paddleH &&
          s.ball.vel.x < 0
        ) {
          s.ball.vel.x *= -1;
          const hit = (s.ball.pos.y - (s.padL.y + s.paddleH / 2)) / (s.paddleH / 2);
          s.ball.vel.y += hit * 3;
          speedUpBall(s);
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
          speedUpBall(s);
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

      // Draw paddles & ball
      ctx.fillStyle = s.dark ? "#e5e7eb" : "#111827";
      ctx.fillRect(s.padL.x, s.padL.y, s.paddleW, s.paddleH);
      ctx.fillRect(s.padR.x, s.padR.y, s.paddleW, s.paddleH);

      ctx.beginPath();
      ctx.arc(s.ball.pos.x, s.ball.pos.y, s.ball.r, 0, Math.PI * 2);
      ctx.fill();

      // Score
      ctx.font = "bold 28px ui-sans-serif, system-ui, -apple-system, Segoe UI";
      ctx.textAlign = "center";
      ctx.fillText(`${scoreL}`, s.width / 2 - 40, 40);
      ctx.fillText(`${scoreR}`, s.width / 2 + 40, 40);

      // Yellow frame INSIDE canvas so all 4 edges are obvious
      ctx.strokeStyle = BORDER_COLOR;
      ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, s.width - 4, s.height - 4);

      // Help text
      if (paused) {
        ctx.font = "16px ui-sans-serif, system-ui, -apple-system, Segoe UI";
        ctx.textAlign = "center";
        ctx.fillText("Press Space to start/pause — R to reset — W/S or ↑/↓ to move", s.width / 2, s.height - 18);
      }

      rafRef.current = requestAnimationFrame(step);
    }

    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [paused, scoreL, scoreR]);

  function resetMatch() {
    setScoreL(0);
    setScoreR(0);
    resetRound();
    setPaused(true);
  }

  return (
    <div className="w-full min-h-[calc(100vh-64px)] flex flex-col bg-white dark:bg-neutral-950">
      {/* Page header */}
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

      {/* Playfield: fills all remaining space, no scrollbars */}
      <div ref={wrapRef} className="relative flex-1 overflow-hidden">
        {/* Canvas covers wrapper; ring overlay would also work, but we now draw the border IN the canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 block touch-none" />
      </div>

      {/* Help bar (height used implicitly in layout calc above) */}
      <div className="h-14 flex items-center justify-center text-xs text-neutral-500">
        ↑/↓ or W/S to move • Space to pause • R to reset
      </div>
    </div>
  );
}

/** Helpers */
function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function speedUpBall(s: {
  ball: { pos: Vec; vel: Vec; r: number };
  speedBoost: number;
  maxBallSpeed: number;
}) {
  const { vel } = s.ball;
  const speed = Math.hypot(vel.x, vel.y);
  const next = Math.min(s.maxBallSpeed, speed * s.speedBoost);
  const nx = vel.x / speed;
  const ny = vel.y / speed;
  s.ball.vel.x = nx * next;
  s.ball.vel.y = ny * next;
}
