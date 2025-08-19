// =============================
import { Section } from "@/components/Section";
export default function Contact() {
return (
<main className="py-10">
<Section>
<h1 className="text-3xl font-semibold mb-4">Contact</h1>
<p className="text-neutral-700 dark:text-neutral-300">Email: <a className="underline" href="mailto:alex@alexlorton.com">alex@alexlorton.com</a></p>
</Section>
</main>
);
}