// =============================
export default function Home() {
  return (
    <main className="py-16 sm:py-24">
      <section className="text-center space-y-6">
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">Alex Lorton</h1>
        <p className="mx-auto max-w-2xl text-lg text-neutral-600 dark:text-neutral-300">
          Operator, investor, runner, and dad. Building personal tools and notes in public.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <a href="/projects" className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800">Explore Projects</a>
          <a href="/dashboard" className="rounded-xl bg-black text-white dark:bg-white dark:text-black px-4 py-2 text-sm font-medium hover:opacity-90">Go to Dashboard</a>
        </div>
      </section>

      <section className="mt-16 grid sm:grid-cols-2 gap-6">
        <div className="rounded-2xl border p-6 bg-white/70 dark:bg-neutral-950/60">
          <h3 className="text-lg font-semibold mb-2">Spanish Drills</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Spaced repetition vocab + tiny listening exercises. (Coming soon)</p>
        </div>
        <div className="rounded-2xl border p-6 bg-white/70 dark:bg-neutral-950/60">
          <h3 className="text-lg font-semibold mb-2">Family Dinner Log</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Track meals, ingredients, ratings, and notes. (Planned)</p>
        </div>
        <div className="rounded-2xl border p-6 bg-white/70 dark:bg-neutral-950/60">
          <h3 className="text-lg font-semibold mb-2">Race Time Predictor</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Age-graded predictions across common distances. (Planned)</p>
        </div>
        <div className="rounded-2xl border p-6 bg-white/70 dark:bg-neutral-950/60">
          <h3 className="text-lg font-semibold mb-2">Writing & Notes</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Short essays and build logs. (Soon)</p>
        </div>
      </section>
    </main>
  );
}
