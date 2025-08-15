// Simple dark/light toggle for the navbar
// =============================
"use client";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      aria-label="Toggle theme"
      className="rounded-xl border px-3 py-1.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? (
        <div className="flex items-center gap-2"><Sun size={16}/> Light</div>
      ) : (
        <div className="flex items-center gap-2"><Moon size={16}/> Dark</div>
      )}
    </button>
  );
}