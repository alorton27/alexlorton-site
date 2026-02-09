"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * alexlorton.com (mysite/) — Fun → Timer
 *
 * Drop this file in:
 *   mysite/app/fun/timer/page.tsx
 *
 * Assets:
 *   mysite/public/fun-timer/bgs/01.jpg ... 30.jpg
 *   mysite/public/fun-timer/audio/01.mp3 ... 30.mp3
 */

type BlockType =
  | "Work"
  | "Deep Work"
  | "Email"
  | "Admin"
  | "Plan"
  | "Creative"
  | "Break"
  | "Eat"
  | "Move"
  | "Reset";

type IntervalBlock = {
  id: string;
  label: BlockType;
  minutes: number;
  bgId: number; // 1..ASSET_COUNT
  tuneId: number; // 1..ASSET_COUNT
  notes?: string;
};

type RunState = {
  isRunning: boolean;
  startedAtMs: number | null;
  elapsedBeforeStartMs: number;
  activeIndex: number;
};

const STORAGE_KEY = "alx_fun_timer_v1";
const YELLOW = "#FFD60A";

// ✅ You currently have 30 backgrounds + 30 tunes
const ASSET_COUNT = 30;

const LABELS: BlockType[] = [
  "Deep Work",
  "Work",
  "Email",
  "Admin",
  "Plan",
  "Creative",
  "Break",
  "Eat",
  "Move",
  "Reset",
];

function pad2(n: number) {
  return String(n).padStart(2, "0");
}
function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}
function uid() {
  return Math.random().toString(16).slice(2) + "_" + Date.now().toString(16);
}
function rand1toN(n: number) {
  return Math.floor(Math.random() * n) + 1;
}
function fmtMMSS(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${mm}:${String(ss).padStart(2, "0")}`;
}

function bgUrl(bgId: number) {
  return `/fun-timer/bgs/${pad2(bgId)}.jpg`;
}
function tuneUrl(tuneId: number) {
  return `/fun-timer/audio/${pad2(tuneId)}.mp3`;
}

function totalPlanSeconds(blocks: IntervalBlock[]) {
  return blocks.reduce((acc, b) => acc + b.minutes * 60, 0);
}
function sumPrevSeconds(blocks: IntervalBlock[], idx: number) {
  return blocks.slice(0, idx).reduce((acc, b) => acc + b.minutes * 60, 0);
}
function inferActiveIndexFromElapsed(blocks: IntervalBlock[], elapsedSec: number) {
  let t = 0;
  for (let i = 0; i < blocks.length; i++) {
    t += blocks[i].minutes * 60;
    if (elapsedSec < t) return i;
  }
  return Math.max(0, blocks.length - 1);
}
function currentBlockRemainingSeconds(
  blocks: IntervalBlock[],
  idx: number,
  elapsedTotalSec: number
) {
  const prev = sumPrevSeconds(blocks, idx);
  const curLen = blocks[idx]?.minutes ? blocks[idx].minutes * 60 : 0;
  const intoCur = elapsedTotalSec - prev;
  return Math.max(0, curLen - intoCur);
}

// Gentle bell between intervals (no extra asset needed)
function playBell() {
  try {
    const AudioCtx =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const o = ctx.createOscillator();
    const g = ctx.createGain();

    o.type = "sine";
    o.frequency.setValueAtTime(784, ctx.currentTime); // G5-ish
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);

    o.connect(g);
    g.connect(ctx.destination);

    o.start();
    o.stop(ctx.currentTime + 0.85);

    o.onended = () => ctx.close().catch(() => {});
  } catch {
    // ignore
  }
}

const DEFAULT_BLOCKS: IntervalBlock[] = [
  {
    id: uid(),
    label: "Deep Work",
    minutes: 30,
    bgId: 1,
    tuneId: 1,
    notes: "One thing only.",
  },
  { id: uid(), label: "Break", minutes: 5, bgId: 2, tuneId: 2, notes: "Stand up + water." },
  { id: uid(), label: "Work", minutes: 30, bgId: 3, tuneId: 3, notes: "Keep rolling." },
  { id: uid(), label: "Move", minutes: 15, bgId: 4, tuneId: 4, notes: "Walk the block." },
];

export default function TimerPage() {
  const [blocks, setBlocks] = useState<IntervalBlock[]>(DEFAULT_BLOCKS);
  const [runState, setRunState] = useState<RunState>({
    isRunning: false,
    startedAtMs: null,
    elapsedBeforeStartMs: 0,
    activeIndex: 0,
  });

  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryMode, setLibraryMode] = useState<"bg" | "tune">("bg");
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);

  // ✅ Fix: default to unmuted; user can mute any time
  const [muted, setMuted] = useState(false);
  const [vol, setVol] = useState(0.5);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ✅ Fix: drive countdown from stateful time so UI updates live
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  // Bell trigger on interval transitions
  const prevActiveIndexRef = useRef<number>(0);

  // Load saved blocks
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.blocks)) setBlocks(parsed.blocks);
    } catch {
      // ignore
    }
  }, []);

  // Persist blocks
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ blocks }));
    } catch {
      // ignore
    }
  }, [blocks]);

  // UI tick while running (updates countdown + transitions)
  useEffect(() => {
    if (!runState.isRunning) return;
    setNowMs(Date.now());
    const id = window.setInterval(() => setNowMs(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [runState.isRunning]);

  const planSec = useMemo(() => totalPlanSeconds(blocks), [blocks]);

  const elapsedMs = useMemo(() => {
    if (!runState.startedAtMs) return runState.elapsedBeforeStartMs;
    if (!runState.isRunning) return runState.elapsedBeforeStartMs;
    return runState.elapsedBeforeStartMs + (nowMs - runState.startedAtMs);
  }, [runState, nowMs]);

  const elapsedSec = Math.floor(elapsedMs / 1000);

  // Keep active index aligned to elapsed
  useEffect(() => {
    if (!runState.isRunning) return;
    const idx = inferActiveIndexFromElapsed(blocks, elapsedSec);
    if (idx !== runState.activeIndex) setRunState((s) => ({ ...s, activeIndex: idx }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsedSec, blocks, runState.isRunning]);

  // Ring bell on interval transitions (only while running)
  useEffect(() => {
    const prev = prevActiveIndexRef.current;
    const next = runState.activeIndex;
    if (runState.isRunning && next !== prev) {
      if (next > prev) playBell();
    }
    prevActiveIndexRef.current = next;
  }, [runState.activeIndex, runState.isRunning]);

  // Stop at end
  useEffect(() => {
    if (!runState.isRunning) return;
    if (elapsedSec >= planSec) {
      setRunState((s) => ({
        ...s,
        isRunning: false,
        startedAtMs: null,
        elapsedBeforeStartMs: planSec * 1000,
        activeIndex: Math.max(0, blocks.length - 1),
      }));
      if (audioRef.current) audioRef.current.pause();
    }
  }, [elapsedSec, planSec, runState.isRunning, blocks.length]);

  const active = blocks[runState.activeIndex] ?? blocks[0];
  const activeBg = active ? bgUrl(active.bgId) : bgUrl(1);
  const activeTune = active ? tuneUrl(active.tuneId) : tuneUrl(1);

  const remainingCurSec = active
    ? currentBlockRemainingSeconds(blocks, runState.activeIndex, elapsedSec)
    : 0;
  const totalRemainingSec = Math.max(0, planSec - elapsedSec);
  const progress = planSec === 0 ? 0 : clamp(elapsedSec / planSec, 0, 1);

  // Keep audio properties current (mute/vol)
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.loop = true;
    a.muted = muted;
    a.volume = vol;
  }, [muted, vol]);

  // ✅ Fix: Swap tune + ensure play/pause state follows runState/mute
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    const shouldPlay = runState.isRunning && !muted;

    a.loop = true;
    a.muted = muted;
    a.volume = vol;

    if (!a.src || !a.src.endsWith(activeTune)) {
      a.src = activeTune;
      a.currentTime = 0;
      if (shouldPlay) a.play().catch(() => {});
      return;
    }

    if (shouldPlay && a.paused) {
      a.play().catch(() => {});
    }
    if (!shouldPlay && !a.paused) {
      a.pause();
    }
  }, [activeTune, runState.isRunning, muted, vol]);

  function hardReset() {
    setRunState({ isRunning: false, startedAtMs: null, elapsedBeforeStartMs: 0, activeIndex: 0 });
    prevActiveIndexRef.current = 0;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }

  async function start() {
    setNowMs(Date.now());
    setRunState((s) => {
      const computedElapsed =
        s.elapsedBeforeStartMs + (s.startedAtMs ? Date.now() - s.startedAtMs : 0);
      const atEnd = Math.floor(computedElapsed / 1000) >= planSec;
      const baseElapsed = atEnd ? 0 : s.elapsedBeforeStartMs;

      const nextState: RunState = {
        ...s,
        isRunning: true,
        startedAtMs: Date.now(),
        elapsedBeforeStartMs: baseElapsed,
        activeIndex: atEnd ? 0 : s.activeIndex,
      };

      // keep bell logic consistent on "fresh start"
      if (atEnd) prevActiveIndexRef.current = 0;
      return nextState;
    });

    // Autoplay rules: this click is the gesture, so play is usually allowed.
    const a = audioRef.current;
    if (a) {
      if (!a.src || !a.src.endsWith(activeTune)) a.src = activeTune;
      a.loop = true;
      a.muted = muted;
      a.volume = vol;
      a.currentTime = 0;
      if (!muted) a.play().catch(() => {});
    }
  }

  function pause() {
    setRunState((s) => {
      const elapsed = s.startedAtMs
        ? s.elapsedBeforeStartMs + (Date.now() - s.startedAtMs)
        : s.elapsedBeforeStartMs;
      return { ...s, isRunning: false, startedAtMs: null, elapsedBeforeStartMs: elapsed };
    });
    if (audioRef.current) audioRef.current.pause();
  }

  function skipTo(index: number) {
    const idx = clamp(index, 0, Math.max(0, blocks.length - 1));
    const newElapsedMs = sumPrevSeconds(blocks, idx) * 1000;
    setRunState((s) => ({
      ...s,
      activeIndex: idx,
      startedAtMs: s.isRunning ? Date.now() : null,
      elapsedBeforeStartMs: newElapsedMs,
    }));
  }

  function skipNext() {
    const idx = inferActiveIndexFromElapsed(blocks, elapsedSec);
    skipTo(idx + 1);
  }

  function skipPrev() {
    const idx = inferActiveIndexFromElapsed(blocks, elapsedSec);
    skipTo(idx - 1);
  }

  function randomizeBlock(id: string) {
    updateBlock(id, {
      bgId: rand1toN(ASSET_COUNT),
      tuneId: rand1toN(ASSET_COUNT),
    });
  }

  function addBlock() {
    setBlocks((b) => [
      ...b,
      {
        id: uid(),
        label: "Work",
        minutes: 25,
        bgId: rand1toN(ASSET_COUNT),
        tuneId: rand1toN(ASSET_COUNT),
      },
    ]);
    hardReset();
  }

  function deleteBlock(id: string) {
    setBlocks((b) => b.filter((x) => x.id !== id));
    hardReset();
  }

  function moveBlock(id: string, dir: -1 | 1) {
    setBlocks((b) => {
      const idx = b.findIndex((x) => x.id === id);
      const j = idx + dir;
      if (idx < 0 || j < 0 || j >= b.length) return b;
      const copy = [...b];
      const tmp = copy[idx];
      copy[idx] = copy[j];
      copy[j] = tmp;
      return copy;
    });
    hardReset();
  }

  function updateBlock(id: string, patch: Partial<IntervalBlock>) {
    setBlocks((b) => b.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    hardReset();
  }

  function openLibrary(mode: "bg" | "tune", blockId: string) {
    setLibraryMode(mode);
    setEditingBlockId(blockId);
    setShowLibrary(true);
  }

  function chooseFromLibrary(assetId: number) {
    if (!editingBlockId) return;
    if (libraryMode === "bg") updateBlock(editingBlockId, { bgId: assetId });
    else updateBlock(editingBlockId, { tuneId: assetId });
    setShowLibrary(false);
    setEditingBlockId(null);
  }

  return (
    <div className="w-full min-h-[calc(100vh-64px)] flex flex-col bg-black">
      {/* Page header */}
      <header className="px-4 sm:px-6 py-3 border-b bg-white/80 dark:bg-neutral-900/70">
        <div className="mx-auto max-w-6xl flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">Timer</h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              Build your day from intervals: pick a scene + a loop, press Start.
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={addBlock}
              className="rounded border px-3 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              + Add
            </button>
            <button
              onClick={() => {
                setBlocks(DEFAULT_BLOCKS);
                hardReset();
              }}
              className="rounded border px-3 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              title="Reset to starter plan"
            >
              Reset
            </button>
          </div>
        </div>
      </header>

      {/* Stage */}
      <div className="relative flex-1 border-4" style={{ borderColor: YELLOW }}>
        {/* Background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${activeBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        {/* Readability overlay */}
        <div className="absolute inset-0 bg-black/45" />

        {/* Overall progress bar */}
        <div className="absolute left-0 right-0 top-0 h-1 bg-white/20">
          <div className="h-full bg-white/75" style={{ width: `${progress * 100}%` }} />
        </div>

        {/* Content */}
        <div className="relative mx-auto max-w-6xl px-4 py-5 grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Now panel */}
          <section className="rounded-2xl border border-white/15 bg-black/35 backdrop-blur p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest text-white/70">Now</div>
                <div className="mt-1 text-3xl font-semibold text-white">
                  {active?.label ?? "(No intervals)"}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-white/90">
                    Remaining: {fmtMMSS(remainingCurSec)}
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-white/90">
                    Total left: {fmtMMSS(totalRemainingSec)}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={skipPrev}
                  className="rounded border border-white/20 bg-white/10 px-3 py-1 text-sm text-white hover:bg-white/15"
                  title="Previous"
                >
                  ◀︎
                </button>
                {!runState.isRunning ? (
                  <button
                    onClick={start}
                    className="rounded border border-white/20 bg-white/90 px-4 py-1 text-sm font-semibold text-black hover:bg-white"
                  >
                    Start
                  </button>
                ) : (
                  <button
                    onClick={pause}
                    className="rounded border border-white/20 bg-white/90 px-4 py-1 text-sm font-semibold text-black hover:bg-white"
                  >
                    Pause
                  </button>
                )}
                <button
                  onClick={skipNext}
                  className="rounded border border-white/20 bg-white/10 px-3 py-1 text-sm text-white hover:bg-white/15"
                  title="Next"
                >
                  ▶︎
                </button>
                <button
                  onClick={hardReset}
                  className="rounded border border-white/20 bg-white/10 px-3 py-1 text-sm text-white hover:bg-white/15"
                  title="Reset to start"
                >
                  ⟲
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-white/15 bg-white/5 p-3">
                <div className="text-xs uppercase tracking-widest text-white/70">Background</div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="text-sm text-white/85">Scene #{active?.bgId ?? 1}</div>
                  <button
                    onClick={() => active && openLibrary("bg", active.id)}
                    className="rounded border border-white/20 bg-white/10 px-3 py-1 text-sm text-white hover:bg-white/15"
                  >
                    Choose
                  </button>
                </div>
                <div className="mt-3 overflow-hidden rounded-xl border border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={activeBg} alt="Background preview" className="h-32 w-full object-cover" />
                </div>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/5 p-3">
                <div className="text-xs uppercase tracking-widest text-white/70">Music</div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="text-sm text-white/85">Tune #{active?.tuneId ?? 1}</div>
                  <button
                    onClick={() => active && openLibrary("tune", active.id)}
                    className="rounded border border-white/20 bg-white/10 px-3 py-1 text-sm text-white hover:bg-white/15"
                  >
                    Choose
                  </button>
                </div>

                <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setMuted((m) => {
                            const next = !m;
                            // ✅ Fix: if unmuting while running, start audio immediately
                            if (!next && runState.isRunning && audioRef.current) {
                              const a = audioRef.current;
                              a.muted = false;
                              a.volume = vol;
                              a.play().catch(() => {});
                            }
                            // if muting, pause for cleanliness (optional)
                            if (next && audioRef.current) {
                              audioRef.current.pause();
                            }
                            return next;
                          });
                        }}
                        className="rounded border border-white/20 bg-white/10 px-3 py-1 text-sm text-white hover:bg-white/15"
                        aria-pressed={!muted}
                      >
                        {muted ? "Unmute" : "Mute"}
                      </button>

                      <label className="flex items-center gap-2 text-xs text-white/75">
                        Vol
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.05}
                          value={vol}
                          onChange={(e) => setVol(Number(e.target.value))}
                          className="accent-white"
                        />
                      </label>
                    </div>
                    <div className="text-xs text-white/60">
                      Tip: if your browser blocks audio, click Start once.
                    </div>
                  </div>

                  <audio ref={audioRef} src={activeTune} loop preload="auto" className="hidden" />
                </div>
              </div>
            </div>

            {/* Up next */}
            <div className="mt-4 rounded-2xl border border-white/15 bg-white/5 p-3">
              <div className="text-xs uppercase tracking-widest text-white/70">Up next</div>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {blocks.slice(runState.activeIndex + 1, runState.activeIndex + 5).map((b) => (
                  <div key={b.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-white">{b.label}</div>
                      <div className="text-sm text-white/70">{b.minutes}m</div>
                    </div>
                    <div className="mt-1 text-xs text-white/60">
                      Scene #{b.bgId} • Tune #{b.tuneId}
                    </div>
                  </div>
                ))}
                {blocks.length <= runState.activeIndex + 1 && (
                  <div className="text-sm text-white/70">Nothing queued. Add an interval to keep going.</div>
                )}
              </div>
            </div>
          </section>

          {/* Planner panel */}
          <section className="rounded-2xl border border-white/15 bg-black/35 backdrop-blur p-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-widest text-white/70">Plan</div>
                <div className="mt-1 text-xl font-semibold text-white">Intervals</div>
                <div className="mt-1 text-sm text-white/70">
                  Total: {Math.round(planSec / 60)} minutes
                </div>
              </div>
              <div className="text-xs text-white/60">Edits reset the timer.</div>
            </div>

            <div className="mt-3 space-y-3">
              {blocks.map((b, i) => (
                <div
                  key={b.id}
                  className={`rounded-2xl border p-3 ${
                    i === runState.activeIndex ? "border-white/40 bg-white/10" : "border-white/10 bg-white/5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={b.label}
                          onChange={(e) => updateBlock(b.id, { label: e.target.value as BlockType })}
                          className="rounded border border-white/20 bg-black/40 px-3 py-1 text-sm text-white outline-none"
                        >
                          {LABELS.map((lbl) => (
                            <option key={lbl} value={lbl} className="bg-black">
                              {lbl}
                            </option>
                          ))}
                        </select>

                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            max={180}
                            value={b.minutes}
                            onChange={(e) =>
                              updateBlock(b.id, {
                                minutes: clamp(parseInt(e.target.value || "0", 10), 1, 180),
                              })
                            }
                            className="w-20 rounded border border-white/20 bg-black/40 px-3 py-1 text-sm text-white outline-none"
                          />
                          <span className="text-sm text-white/70">min</span>
                        </div>

                        <button
                          onClick={() => openLibrary("bg", b.id)}
                          className="rounded border border-white/20 bg-white/10 px-3 py-1 text-sm text-white hover:bg-white/15"
                          title="Pick background"
                        >
                          🖼️ {pad2(b.bgId)}
                        </button>
                        <button
                          onClick={() => openLibrary("tune", b.id)}
                          className="rounded border border-white/20 bg-white/10 px-3 py-1 text-sm text-white hover:bg-white/15"
                          title="Pick music"
                        >
                          🎵 {pad2(b.tuneId)}
                        </button>
                        <button
                          onClick={() => randomizeBlock(b.id)}
                          className="rounded border border-white/20 bg-white/10 px-3 py-1 text-sm text-white hover:bg-white/15"
                          title="Randomize both"
                        >
                          🎲 Random
                        </button>
                      </div>

                      <textarea
                        value={b.notes ?? ""}
                        onChange={(e) => updateBlock(b.id, { notes: e.target.value })}
                        placeholder="Optional note… (e.g., ‘Draft investor memo’ / ‘Walk loop’)"
                        className="mt-2 w-full resize-none rounded-xl border border-white/15 bg-black/35 p-2 text-sm text-white outline-none placeholder:text-white/35"
                        rows={2}
                      />
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => moveBlock(b.id, -1)}
                          className="rounded border border-white/20 bg-white/10 px-3 py-1 text-sm text-white hover:bg-white/15"
                          title="Move up"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveBlock(b.id, 1)}
                          className="rounded border border-white/20 bg-white/10 px-3 py-1 text-sm text-white hover:bg-white/15"
                          title="Move down"
                        >
                          ↓
                        </button>
                      </div>
                      <button
                        onClick={() => deleteBlock(b.id)}
                        className="rounded border border-white/20 bg-white/10 px-3 py-1 text-sm text-white hover:bg-white/15"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {blocks.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white/70">
                  No intervals yet. Add one, pick a vibe, press Start.
                </div>
              )}
            </div>

            {/* ✅ Fix #1: removed "Asset library" box from UI */}
          </section>
        </div>
      </div>

      {/* Library modal */}
      {showLibrary && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
          <div className="w-full max-w-5xl rounded-2xl border border-white/10 bg-black/70 backdrop-blur">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div>
                <div className="text-xs uppercase tracking-widest text-white/70">Library</div>
                <div className="text-lg font-semibold text-white">
                  Choose {libraryMode === "bg" ? "a background" : "a tune"}
                </div>
              </div>
              <button
                onClick={() => {
                  setShowLibrary(false);
                  setEditingBlockId(null);
                }}
                className="rounded border border-white/20 bg-white/10 px-3 py-1 text-sm text-white hover:bg-white/15"
              >
                Close
              </button>
            </div>

            <div className="max-h-[70vh] overflow-auto p-4">
              {libraryMode === "bg" ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {Array.from({ length: ASSET_COUNT }).map((_, idx) => {
                    const id = idx + 1;
                    const url = bgUrl(id);
                    return (
                      <button
                        key={id}
                        onClick={() => chooseFromLibrary(id)}
                        className="group overflow-hidden rounded-xl border border-white/10 bg-white/5 text-left hover:border-white/30"
                        title={`Scene #${id}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={`Scene ${id}`}
                          className="h-24 w-full object-cover opacity-95 group-hover:opacity-100"
                        />
                        <div className="px-3 py-2 text-sm text-white/80">Scene #{id}</div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: ASSET_COUNT }).map((_, idx) => {
                    const id = idx + 1;
                    const url = tuneUrl(id);
                    return (
                      <div key={id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-white">Tune #{id}</div>
                          <button
                            onClick={() => chooseFromLibrary(id)}
                            className="rounded border border-white/20 bg-white/10 px-3 py-1 text-sm text-white hover:bg-white/15"
                          >
                            Use
                          </button>
                        </div>
                        <div className="mt-2">
                          <audio src={url} controls className="w-full" />
                        </div>
                        <div className="mt-2 text-xs text-white/60">
                          Seamless looping works best with audio authored for loops (or loop points + crossfade).
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
