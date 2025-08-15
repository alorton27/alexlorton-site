// =============================
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ThemeProvider from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Alex Lorton",
  description: "Operator, investor, runner — personal site & projects.",
  openGraph: {
    title: "Alex Lorton",
    description: "Operator, investor, runner — personal site & projects.",
    url: "https://alexlorton.com",
    siteName: "Alex Lorton",
    type: "website",
  },
  metadataBase: new URL("https://alexlorton.com"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-950 dark:to-neutral-900 text-neutral-900 dark:text-neutral-100`}>
        <ThemeProvider>
          <Nav />
          <div className="mx-auto max-w-4xl px-4 sm:px-6">{children}</div>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}