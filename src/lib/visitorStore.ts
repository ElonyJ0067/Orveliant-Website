import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type Store = {
  devices: string[];
  ips: string[];
};

export type VisitSeenResult = {
  returning: boolean;
  knownDevice: boolean;
  knownIp: boolean;
};

const BLOB_STORE_NAME = "visitors";
const KV_KEY_PREFIX = "visit:";

const EMPTY_RESULT: VisitSeenResult = {
  returning: false,
  knownDevice: false,
  knownIp: false,
};

/** In-process lock for local file store only (single Node process). */
let localChain: Promise<unknown> = Promise.resolve();

function withLocalLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = localChain.then(fn, fn);
  localChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function isNetlify(): boolean {
  return Boolean(
    process.env.NETLIFY ||
      process.env.NETLIFY_BLOBS_CONTEXT ||
      process.env.NETLIFY_SITE_ID,
  );
}

function isVercel(): boolean {
  return Boolean(process.env.VERCEL);
}

function kvConfigured(): boolean {
  return Boolean(
    process.env.KV_REST_API_URL?.trim() && process.env.KV_REST_API_TOKEN?.trim(),
  );
}

function localStorePath(): string {
  if (isVercel()) {
    return path.join("/tmp", "oceanpark-visitors", "devices.json");
  }
  return path.join(process.cwd(), ".data", "devices.json");
}

function hashKey(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 32);
}

export function visitorDeviceKey(fingerprint: string): string {
  return hashKey(fingerprint);
}

async function loadLocalStore(): Promise<Store> {
  const storePath = localStorePath();
  try {
    const raw = await readFile(storePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<Store>;
    return {
      devices: Array.isArray(parsed.devices) ? parsed.devices : [],
      ips: Array.isArray(parsed.ips) ? parsed.ips : [],
    };
  } catch {
    return { devices: [], ips: [] };
  }
}

async function saveLocalStore(store: Store) {
  const storePath = localStorePath();
  await mkdir(path.dirname(storePath), { recursive: true });
  await writeFile(
    storePath,
    JSON.stringify({
      devices: store.devices.slice(-20_000),
      ips: store.ips.slice(-20_000),
    }),
    "utf8",
  );
}

async function markSeenLocal(deviceKey: string, ipKey: string | null): Promise<VisitSeenResult> {
  return withLocalLock(async () => {
    const store = await loadLocalStore();
    const knownDevice = store.devices.includes(deviceKey);
    const knownIp = ipKey ? store.ips.includes(ipKey) : false;
    const returning = knownDevice || knownIp;

    let changed = false;
    if (!knownDevice) {
      store.devices.push(deviceKey);
      changed = true;
    }
    if (ipKey && !knownIp) {
      store.ips.push(ipKey);
      changed = true;
    }
    if (changed) await saveLocalStore(store);

    return { returning, knownDevice, knownIp };
  });
}

async function markSeenBlobs(deviceKey: string, ipKey: string | null): Promise<VisitSeenResult> {
  const { getStore } = await import("@netlify/blobs");
  const store = getStore({ name: BLOB_STORE_NAME, consistency: "strong" });

  const deviceBlobKey = `device:${deviceKey}`;
  const ipBlobKey = ipKey ? `ip:${ipKey}` : null;

  const [deviceVal, ipVal] = await Promise.all([
    store.get(deviceBlobKey),
    ipBlobKey ? store.get(ipBlobKey) : Promise.resolve(null),
  ]);

  const knownDevice = deviceVal !== null;
  const knownIp = ipBlobKey ? ipVal !== null : false;
  const returning = knownDevice || knownIp;

  const writes: Promise<unknown>[] = [];
  if (!knownDevice) writes.push(store.set(deviceBlobKey, "1"));
  if (ipBlobKey && !knownIp) writes.push(store.set(ipBlobKey, "1"));
  if (writes.length) await Promise.all(writes);

  return { returning, knownDevice, knownIp };
}

async function kvRequest(pathSuffix: string): Promise<{ result: string | null }> {
  const base = process.env.KV_REST_API_URL!.trim().replace(/\/$/, "");
  const token = process.env.KV_REST_API_TOKEN!.trim();
  const res = await fetch(`${base}${pathSuffix}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) {
    throw new Error(`KV ${pathSuffix} failed: ${res.status}`);
  }
  return (await res.json()) as { result: string | null };
}

async function kvGet(key: string): Promise<string | null> {
  const data = await kvRequest(`/get/${encodeURIComponent(key)}`);
  return data.result;
}

async function kvSet(key: string, value: string): Promise<void> {
  await kvRequest(`/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}`);
}

async function markSeenKv(deviceKey: string, ipKey: string | null): Promise<VisitSeenResult> {
  const deviceBlobKey = `${KV_KEY_PREFIX}device:${deviceKey}`;
  const ipBlobKey = ipKey ? `${KV_KEY_PREFIX}ip:${ipKey}` : null;

  const [deviceVal, ipVal] = await Promise.all([
    kvGet(deviceBlobKey),
    ipBlobKey ? kvGet(ipBlobKey) : Promise.resolve(null),
  ]);

  const knownDevice = deviceVal !== null;
  const knownIp = ipBlobKey ? ipVal !== null : false;
  const returning = knownDevice || knownIp;

  const writes: Promise<void>[] = [];
  if (!knownDevice) writes.push(kvSet(deviceBlobKey, "1"));
  if (ipBlobKey && !knownIp) writes.push(kvSet(ipBlobKey, "1"));
  if (writes.length) await Promise.all(writes);

  return { returning, knownDevice, knownIp };
}

/**
 * Persist + classify visit.
 * - Netlify: Netlify Blobs
 * - Vercel: Upstash KV when KV_REST_API_URL + KV_REST_API_TOKEN are set (Vercel KV)
 * - Local dev: `.data/devices.json`
 *
 * Never throws — storage failure must not block visitor Telegram alerts.
 */
export async function markVisitorSeen(
  deviceKey: string,
  ipKey: string | null,
): Promise<VisitSeenResult> {
  if (isNetlify()) {
    try {
      return await markSeenBlobs(deviceKey, ipKey);
    } catch (err) {
      console.error("[visit] Netlify Blobs failed", err);
      return EMPTY_RESULT;
    }
  }

  if (isVercel()) {
    if (kvConfigured()) {
      try {
        return await markSeenKv(deviceKey, ipKey);
      } catch (err) {
        console.error("[visit] Vercel KV failed", err);
      }
    } else {
      console.warn(
        "[visit] Vercel KV not configured — visitor alerts work, but New/Returning may not persist. Add a Vercel KV store and link KV_REST_API_URL + KV_REST_API_TOKEN.",
      );
    }
    return EMPTY_RESULT;
  }

  try {
    return await markSeenLocal(deviceKey, ipKey);
  } catch (err) {
    console.error("[visit] local store failed", err);
    return EMPTY_RESULT;
  }
}
