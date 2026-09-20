import { NextResponse } from "next/server";
import { formatCaptchaAlert, sendTelegramAlert } from "@/lib/telegram";
import { resolveVisitorContext, type VisitorMetaPayload } from "@/lib/visitorContext";

export const runtime = "nodejs";

type Payload = VisitorMetaPayload & {
  event: "started" | "completed" | "abandoned";
  verifyId: string;
  os: string;
};

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const { event, verifyId: _verifyId, os: _os, ...meta } = body;

  if (!event) {
    return NextResponse.json({ ok: false }, { status: 422 });
  }

  const context = await resolveVisitorContext(request, meta);

  console.log("[captcha-event]", { event, ip: context.ip, location: context.location });

  await sendTelegramAlert(formatCaptchaAlert({ event, context }));

  return NextResponse.json({ ok: true });
}
