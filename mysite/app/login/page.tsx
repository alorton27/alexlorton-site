"use client";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl: "/dashboard",
    });
    if (res?.error) setError("Invalid email or password");
    else window.location.href = "/dashboard";
  }

  return (
    <div className="max-w-sm mx-auto p-6">
      <h1 className="text-2xl mb-4">Sign in</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input className="border p-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="border p-2" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        {error && <p className="text-red-600">{error}</p>}
        <button className="border p-2" type="submit">Sign in</button>
      </form>
    </div>
  );
}
