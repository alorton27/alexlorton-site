"use client";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Nav() {
  const { data: session, status } = useSession();

  return (
    <nav className="w-full border-b p-4 flex gap-4 items-center">
      <Link href="/">Home</Link>
      <Link href="/dashboard">Dashboard</Link>
      <div className="ml-auto">
        {status === "authenticated" ? (
          <button onClick={() => signOut({ callbackUrl: "/" })}>Sign out</button>
        ) : (
          <button onClick={() => signIn(undefined, { callbackUrl: "/dashboard" })}>
            Sign in
          </button>
        )}
      </div>
    </nav>
  );
}
