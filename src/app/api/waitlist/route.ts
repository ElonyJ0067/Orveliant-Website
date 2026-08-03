import { NextResponse } from "next/server";
import { formatWaitlistAlert, sendTelegramAlert } from "@/lib/telegram";

type Payload = {
  name?: string;
  email?: string;
  interest?: string;
};

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const name = (body.name ?? "").trim().slice(0, 120);
  const email = (body.email ?? "").trim().slice(0, 200);
  const interest = (body.interest ?? "").trim().slice(0, 60);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailValid) {
    return NextResponse.json({ ok: false, error: "Please enter a valid email." }, { status: 422 });
  }

  console.log("[waitlist] new signup", { name, email, interest, at: new Date().toISOString() });

  await sendTelegramAlert(formatWaitlistAlert({ name, email, interest }));

  return NextResponse.json({ ok: true });
}
