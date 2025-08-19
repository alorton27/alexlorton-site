// =============================
"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "sent" | "error";

export default function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [errMsg, setErrMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setErrMsg("");

    const form = e.currentTarget;
    const data = {
      firstName: (form.elements.namedItem("firstName") as HTMLInputElement).value.trim(),
      lastName:  (form.elements.namedItem("lastName") as HTMLInputElement).value.trim(),
      email:     (form.elements.namedItem("email") as HTMLInputElement).value.trim(),
      subject:   (form.elements.namedItem("subject") as HTMLInputElement).value.trim(),
      message:   (form.elements.namedItem("message") as HTMLTextAreaElement).value.trim(),
      // honeypot (should stay empty)
      company:   (form.elements.namedItem("company") as HTMLInputElement).value,
    };

    // Basic validation
    if (!data.firstName || !data.lastName || !data.email || !data.subject || !data.message) {
      setStatus("error");
      setErrMsg("Please fill out all required fields.");
      return;
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setStatus("sent");
        form.reset();
      } else {
        const body = await res.json().catch(() => ({}));
        setStatus("error");
        setErrMsg(body?.error ?? "Something went wrong. Please try again.");
      }
    } catch (err: any) {
      setStatus("error");
      setErrMsg(err?.message ?? "Network error. Please try again.");
    }
  }

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Contact</h1>
        <p className="text-neutral-600 dark:text-neutral-300">
          Drop me a line — I read every message.
        </p>
      </header>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">First Name *</label>
            <input required name="firstName" className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-neutral-900" />
          </div>
          <div>
            <label className="block text-sm mb-1">Last Name *</label>
            <input required name="lastName" className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-neutral-900" />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Email Address *</label>
          <input required type="email" name="email" className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-neutral-900" />
        </div>

        <div>
          <label className="block text-sm mb-1">Subject *</label>
          <input required name="subject" className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-neutral-900" />
        </div>

        <div>
          <label className="block text-sm mb-1">Message *</label>
          <textarea required name="message" rows={6} className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-neutral-900" />
        </div>

        {/* Honeypot (hidden from humans, catches simple bots) */}
        <div className="hidden">
          <label>Company</label>
          <input name="company" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={status === "sending"}
            className="rounded-lg bg-black text-white dark:bg-white dark:text-black px-4 py-2 text-sm font-medium disabled:opacity-60"
          >
            {status === "sending" ? "Sending..." : "Send"}
          </button>
          {status === "sent" && <span className="text-green-600">Thank you! Your message was sent.</span>}
          {status === "error" && <span className="text-red-600">{errMsg}</span>}
        </div>
      </form>

      <div className="text-sm text-neutral-500">
        New York, NY • <a className="underline" href="mailto:alorton@gmail.com">alorton@gmail.com</a>
      </div>
    </main>
  );
}
