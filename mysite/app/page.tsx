// =============================
import Hero from "@/components/Hero";
import { Section } from "@/components/Section";


export default function Home() {
return (
<main>
<Hero />


<Section className="py-10">
<h2 className="text-xl font-semibold mb-4">What’s here</h2>
<div className="grid gap-4 sm:grid-cols-2">
<div className="rounded-2xl border p-5 bg-white/80 dark:bg-neutral-900/60">
<h3 className="font-medium">Writing & Notes</h3>
<p className="text-sm text-neutral-600 dark:text-neutral-400">Short essays and build logs. (Soon)</p>
</div>
<div className="rounded-2xl border p-5 bg-white/80 dark:bg-neutral-900/60">
<h3 className="font-medium">Projects</h3>
<p className="text-sm text-neutral-600 dark:text-neutral-400">Spanish drills, dinner log, race predictor.</p>
</div>
</div>
</Section>
</main>
);
}