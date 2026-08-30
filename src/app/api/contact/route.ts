import { NextResponse } from "next/server";
import { formatContactAlert, sendTelegramAlert } from "@/lib/telegram";
import { resolveVisitorContext, type VisitorMetaPayload } from "@/lib/visitorContext";

export const runtime = "nodejs";

type Payload = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
} & VisitorMetaPayload;

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const name = (body.name ?? "").trim().slice(0, 120);
  const email = (body.email ?? "").trim().slice(0, 200);
  const subject = (body.subject ?? "").trim().slice(0, 160);
  const message = (body.message ?? "").trim().slice(0, 4000);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailValid || message.length < 5) {
    return NextResponse.json(
      { ok: false, error: "Please provide a valid email and a message." },
      { status: 422 },
    );
  }

  const context = await resolveVisitorContext(request, body);

  console.log("[contact] message received", {
    name,
    email,
    subject,
    ip: context.ip,
    location: context.location,
    at: new Date().toISOString(),
  });

  await sendTelegramAlert(
    formatContactAlert({ name, email, subject, message, context }),
  );

  return NextResponse.json({ ok: true });
}
