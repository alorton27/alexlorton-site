// =============================
export default function Footer() {
  return (
    <footer className="border-t mt-16">
      <div className="mx-auto max-w-4xl p-6 text-sm text-neutral-600 dark:text-neutral-400 flex flex-col sm:flex-row gap-2 sm:gap-4 items-center justify-between">
        <p>© {new Date().getFullYear()} Alex Lorton</p>
        <div className="flex gap-4">
          <a className="underline" href="/privacy">Privacy</a>
          <a className="underline" href="mailto:alex@alexlorton.com">Contact</a>
        </div>
      </div>
    </footer>
  );
}
