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

const LOCAL_STORE_PATH = path.join(process.cwd(), ".data", "devices.json");
const BLOB_STORE_NAME = "visitors";

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

function hashKey(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 32);
}

export function visitorDeviceKey(fingerprint: string): string {
  return hashKey(fingerprint);
}

async function loadLocalStore(): Promise<Store> {
  try {
    const raw = await readFile(LOCAL_STORE_PATH, "utf8");
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
  await mkdir(path.dirname(LOCAL_STORE_PATH), { recursive: true });
  await writeFile(
    LOCAL_STORE_PATH,
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

function blobsConfigured(): boolean {
  // Netlify injects site context in Functions / `netlify dev`.
  return Boolean(
    process.env.NETLIFY ||
      process.env.NETLIFY_BLOBS_CONTEXT ||
      process.env.SITE_ID ||
      process.env.NETLIFY_SITE_ID,
  );
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

/**
 * Persist + classify visit.
 * Prefers Netlify Blobs (persists across Netlify function invocations).
 * Falls back to local `.data` file for plain `next dev` / `next start`.
 */
export async function markVisitorSeen(
  deviceKey: string,
  ipKey: string | null,
): Promise<VisitSeenResult> {
  try {
    return await markSeenBlobs(deviceKey, ipKey);
  } catch (err) {
    if (blobsConfigured()) {
      console.error("[visit] Netlify Blobs failed", err);
      throw err;
    }
    // Local Next without Netlify Blobs context
    return markSeenLocal(deviceKey, ipKey);
  }
}
