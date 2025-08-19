import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Force Node.js runtime (Nodemailer doesn't work on the Edge runtime)
export const runtime = "nodejs";

type Body = {
  firstName?: string;
  lastName?: string;
  email?: string;
  subject?: string;
  message?: string;
  company?: string; // honeypot
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    // Honeypot: if filled, likely a bot
    if (body.company && body.company.trim() !== "") {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const firstName = body.firstName?.trim();
    const lastName = body.lastName?.trim();
    const fromEmail = body.email?.trim();
    const subject = body.subject?.trim();
    const message = body.message?.trim();

    if (!firstName || !lastName || !fromEmail || !subject || !message) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // Env vars
    const user = process.env.GMAIL_USER;           // your Gmail address (sender)
    const pass = process.env.GMAIL_APP_PASSWORD;   // Gmail App Password (not your normal password)
    const to   = process.env.TO_EMAIL || "alorton@gmail.com";

    if (!user || !pass) {
      return NextResponse.json({ error: "Email is not configured." }, { status: 500 });
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });

    // IMPORTANT: Use your own mailbox in "from" for DMARC alignment; put the visitor in replyTo
    const info = await transporter.sendMail({
      from: `"Alex Lorton Site" <${user}>`,
      to: to,
      subject: `[Contact] ${subject} — ${firstName} ${lastName}`,
      text: `From: ${firstName} ${lastName} <${fromEmail}>\n\n${message}`,
      html: `
        <p><strong>From:</strong> ${firstName} ${lastName} &lt;${fromEmail}&gt;</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr />
        <pre style="white-space:pre-wrap;font-family:inherit">${escapeHtml(message)}</pre>
      `,
      replyTo: `${firstName} ${lastName} <${fromEmail}>`,
    });

    // Optionally log the messageId
    // console.log("Message sent", info.messageId);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    // console.error(err);
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  }
}

// Simple HTML escape for safety
function escapeHtml(s?: string) {
  if (!s) return "";
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}