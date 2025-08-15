// =============================
export default function Projects() {
  const items = [
    { title: "Spanish Drills", desc: "Spaced repetition vocab + listening.", status: "In progress" },
    { title: "Family Dinner Log", desc: "Meals, ingredients, ratings.", status: "Planned" },
    { title: "Race Time Predictor", desc: "Age-graded predictions.", status: "Planned" },
  ];
  return (
    <main className="py-12 space-y-6">
      <h1 className="text-3xl font-semibold">Projects</h1>
      <div className="grid sm:grid-cols-2 gap-6">
        {items.map((it) => (
          <div key={it.title} className="rounded-2xl border p-6 bg-white/70 dark:bg-neutral-950/60">
            <h3 className="text-lg font-semibold">{it.title}</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">{it.desc}</p>
            <div className="mt-3 inline-block text-xs rounded-full border px-2 py-1">{it.status}</div>
          </div>
        ))}
      </div>
    </main>
  );
}