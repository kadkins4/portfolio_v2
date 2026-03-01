import { NextResponse } from "next/server";
import { Resend } from "resend";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const contactEmail = process.env.CONTACT_EMAIL;
  const resendKey = process.env.RESEND_API_KEY;

  if (!contactEmail || !resendKey) {
    console.error("Missing required env vars: CONTACT_EMAIL or RESEND_API_KEY");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  const resend = new Resend(resendKey);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const name = String(body.name ?? "");
  const email = String(body.email ?? "");
  const message = String(body.message ?? "");
  const website = body.website;

  // Honeypot — bots fill hidden fields
  if (website) {
    return NextResponse.json({ ok: true });
  }

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  if (name.trim().length > 100 || email.trim().length > 254 || message.trim().length > 5000) {
    return NextResponse.json({ error: "Input too long" }, { status: 400 });
  }

  const fromAddress = process.env.FROM_EMAIL ?? "onboarding@resend.dev";

  const { error } = await resend.emails.send({
    from: `Portfolio Contact <${fromAddress}>`,
    to: contactEmail,
    subject: `New message from ${name}`,
    text: `From: ${name} <${email}>\n\n${message}`,
  });

  if (error) {
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
