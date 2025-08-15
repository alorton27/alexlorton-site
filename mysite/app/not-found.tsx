// =============================
import Link from "next/link";
export default function NotFound() {
  return (
    <main className="py-24 text-center space-y-3">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="text-neutral-600 dark:text-neutral-400">Let’s get you back on track.</p>
      <Link href="/" className="underline">Go home</Link>
    </main>
  );
}