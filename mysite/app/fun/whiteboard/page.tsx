"use client";

import { useEffect, useRef, useState } from "react";

const COLORS = [
  "#111827", // almost-black
  "#EF4444", // red
  "#1E88E5", // blue
  "#00C853", // green
  "#FFD60A", // yellow
  "#8E24AA", // purple
  "#FF7F50", // coral
  "#FFFFFF", // white (eraser)
];

export default function WhiteboardPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const drawingRef = useRef(false);
  const lastRef = useRef<{ x: number; y: number } | null>(null);

  const [color, setColor] = useState<string>("#111827");
  const [lineWidth, setLineWidth] = useState<number>(4);

  const cssSizeRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 });

  /** Set up and preserve drawings on resize */
  useEffect(() => {
    function setup() {
      const c = canvasRef.current;
      if (!c) return;

      const cssWidth = window.innerWidth;
      const cssHeight = window.innerHeight - 64 - 100; // subtract header + controls estimate

      // store previous drawing if any
      let prev: ImageData | null = null;
      if (ctxRef.current) {
        prev = ctxRef.current.getImageData(0, 0, c.width, c.height);
      }

      cssSizeRef.current = { width: cssWidth, height: cssHeight };

      const dpr = Math.max(1, window.devicePixelRatio || 1);
      c.width = Math.floor(cssWidth * dpr);
      c.height = Math.floor(cssHeight * dpr);
      c.style.width = `${cssWidth}px`;
      c.style.height = `${cssHeight}px`;

      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;

      // restore previous drawing
      if (prev) {
        const tmp = document.createElement("canvas");
        tmp.width = prev.width;
        tmp.height = prev.height;
        tmp.getContext("2d")?.putImageData(prev, 0, 0);
        ctx.drawImage(tmp, 0, 0, c.width / dpr, c.height / dpr);
      }

      ctxRef.current = ctx;
    }

    setup();
    const onResize = () => setup();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update style when color or width changes
  useEffect(() => {
    if (!ctxRef.current) return;
    ctxRef.current.strokeStyle = color;
    ctxRef.current.lineWidth = lineWidth;
  }, [color, lineWidth]);

  function getPos(e: React.PointerEvent<HTMLCanvasElement>) {
    const c = canvasRef.current!;
    const rect = c.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const c = canvasRef.current!;
    c.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    lastRef.current = getPos(e);
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current || !ctxRef.current) return;
    const p = getPos(e);
    const last = lastRef.current ?? p;

    const ctx = ctxRef.current;
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();

    lastRef.current = p;
  }

  function onPointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    try {
      canvasRef.current?.releasePointerCapture(e.pointerId);
    } catch {}
    drawingRef.current = false;
    lastRef.current = null;
  }

  function clearCanvas() {
    const c = canvasRef.current;
    const ctx = ctxRef.current;
    if (!c || !ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
  }

  function downloadPNG() {
    const c = canvasRef.current;
    if (!c) return;

    const { width: cssW, height: cssH } = cssSizeRef.current;
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = cssW;
    exportCanvas.height = cssH;
    const exportCtx = exportCanvas.getContext("2d");
    if (!exportCtx) return;
    exportCtx.drawImage(c, 0, 0, cssW, cssH);

    const link = document.createElement("a");
    link.download = "whiteboard.png";
    link.href = exportCanvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div className="w-full min-h-[calc(100vh-64px)] flex flex-col bg-white dark:bg-neutral-950">
      <header className="p-4 text-center text-xl font-semibold border-b bg-white/80 dark:bg-neutral-900/70 sticky top-0 z-10">
        All ideas welcome
      </header>

      {/* Drawing surface */}
      <div className="relative flex-1 border-4 border-[#FFD60A] overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 touch-none cursor-crosshair bg-white dark:bg-neutral-950"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={onPointerUp}
        />
      </div>

      {/* Controls fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-20 flex flex-col items-center gap-3 pb-4">
        <div className="flex flex-wrap items-center justify-center gap-2 rounded-full bg-white/95 dark:bg-neutral-800/95 px-3 py-2 shadow border">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`h-7 w-7 rounded-full border ${
                c.toLowerCase() === color.toLowerCase()
                  ? "ring-2 ring-offset-2 ring-black/60 dark:ring-white/80"
                  : ""
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
          <div className="mx-2 h-6 w-px bg-neutral-300 dark:bg-neutral-700" />
          <label className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300">
            Size
            <input
              type="range"
              min={1}
              max={24}
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="accent-black dark:accent-white"
            />
          </label>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-white/95 dark:bg-neutral-800/95 px-3 py-2 shadow border">
          <button
            onClick={clearCanvas}
            className="rounded-full border px-4 py-1.5 text-sm bg-white hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700"
          >
            Clear
          </button>
          <button
            onClick={downloadPNG}
            className="rounded-full border px-4 py-1.5 text-sm bg-white hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700"
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
