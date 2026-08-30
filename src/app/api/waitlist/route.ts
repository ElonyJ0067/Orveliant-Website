import { NextResponse } from "next/server";
import { formatWaitlistAlert, sendTelegramAlert } from "@/lib/telegram";
import { resolveVisitorContext, type VisitorMetaPayload } from "@/lib/visitorContext";

export const runtime = "nodejs";

const ALLOWED_CAPITAL = new Set([
  "Under $50k",
  "$50k – $250k",
  "$250k – $1M",
  "$1M+",
  "Prefer not to say",
]);

const ALLOWED_INTEREST = new Set(["AI Quant Trading", "Staking", "Hybrid Strategy"]);

type Payload = {
  name?: string;
  email?: string;
  capital?: string;
  interest?: string;
  linkedin?: string;
} & VisitorMetaPayload;

function normalizeLinkedIn(value: string): string {
  const v = value.trim().slice(0, 300);
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  return `https://${v}`;
}

function isPlausibleLinkedIn(value: string): boolean {
  if (!value) return true;
  if (value.length < 8) return false;
  return /linkedin\.com/i.test(value) || value.includes(".");
}

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const name = (body.name ?? "").trim().slice(0, 120);
  const email = (body.email ?? "").trim().slice(0, 200);
  const capitalRaw = (body.capital ?? "").trim();
  const interestRaw = (body.interest ?? "").trim();
  const linkedin = normalizeLinkedIn(body.linkedin ?? "");

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailValid) {
    return NextResponse.json({ ok: false, error: "Please enter a valid email." }, { status: 422 });
  }

  const capital = ALLOWED_CAPITAL.has(capitalRaw) ? capitalRaw : "Prefer not to say";
  const interest = ALLOWED_INTEREST.has(interestRaw) ? interestRaw : "";

  if (linkedin && !isPlausibleLinkedIn(linkedin)) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid LinkedIn URL, or leave it blank." },
      { status: 422 },
    );
  }

  const context = await resolveVisitorContext(request, body);

  console.log("[waitlist] new signup", {
    name,
    email,
    capital,
    interest,
    linkedin: linkedin || undefined,
    ip: context.ip,
    location: context.location,
    at: new Date().toISOString(),
  });

  await sendTelegramAlert(
    formatWaitlistAlert({ name, email, capital, interest, linkedin, context }),
  );

  return NextResponse.json({ ok: true });
}
