// =============================
import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";


export const metadata: Metadata = {
title: "Alex Lorton",
description: "Operator, investor, runner — personal site & projects.",
metadataBase: new URL("https://alexlorton.com"),
openGraph: { title: "Alex Lorton", description: "Operator, investor, runner — personal site & projects.", url: "https://alexlorton.com", siteName: "Alex Lorton" },
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
return (
<html lang="en">
<body className="bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
<Header />
<div className="min-h-[calc(100vh-56px)]">{children}</div>
<footer className="border-t mt-16">
<div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 text-sm text-neutral-600 dark:text-neutral-400 flex items-center justify-between">
<p>© {new Date().getFullYear()} Alex Lorton</p>
<div className="flex gap-4">
<a href="/privacy" className="underline">Privacy</a>
<a href="mailto:alex@alexlorton.com" className="underline">Contact</a>
</div>
</div>
</footer>
</body>
</html>
);
}