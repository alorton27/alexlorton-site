// =============================
import { Section } from "@/components/Section";
import { Lock } from "lucide-react";


const projects = [
{ title: "Spanish Drills", desc: "Spaced repetition vocab + listening.", status: "In progress" },
{ title: "Family Dinner Log", desc: "Meals, ingredients, ratings.", status: "Planned" },
{ title: "Race Time Predictor", desc: "Age-graded predictions.", status: "Planned" },
];


export default function Projects() {
return (
<main className="py-10">
<Section>
<h1 className="text-3xl font-semibold mb-6">Projects</h1>
<p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
Previews below. Full tools available when signed in.
</p>
<div className="grid gap-4 sm:grid-cols-2">
{projects.map((p) => (
<div key={p.title} className="rounded-2xl border p-5 bg-white/80 dark:bg-neutral-900/60">
<div className="flex items-center justify-between">
<h3 className="font-medium">{p.title}</h3>
<Lock size={16} className="opacity-70" />
</div>
<p className="text-sm text-neutral-600 dark:text-neutral-400">{p.desc}</p>
<div className="mt-3 inline-block text-xs rounded-full border px-2 py-1">{p.status}</div>
</div>
))}
</div>
</Section>
</main>
);
}