// Simple wrapper for consistent spacing/max-width
// =============================
export function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
return <section className={`mx-auto max-w-5xl px-4 sm:px-6 ${className}`}>{children}</section>;
}