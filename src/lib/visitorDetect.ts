/** Client-side wallet / device helpers for visit tracking. */

type EthProvider = {
  isMetaMask?: boolean;
  isBraveWallet?: boolean;
  isCoinbaseWallet?: boolean;
  isCoinbaseBrowser?: boolean;
  isRabby?: boolean;
  isTrust?: boolean;
  isTrustWallet?: boolean;
  isRainbow?: boolean;
  isFrame?: boolean;
  isTokenPocket?: boolean;
  isOkxWallet?: boolean;
  isOKExWallet?: boolean;
  isAvalanche?: boolean;
  isCoreWallet?: boolean;
  isCore?: boolean;
  isExodus?: boolean;
  isOpera?: boolean;
  isBitKeep?: boolean;
  isBitget?: boolean;
  isMathWallet?: boolean;
  isOneInchIOSWallet?: boolean;
  isOneInchAndroidWallet?: boolean;
  isTally?: boolean;
  isPortal?: boolean;
  isZerion?: boolean;
  isPhantom?: boolean;
  isBackpack?: boolean;
  isBinance?: boolean;
  isBybit?: boolean;
  isFrontier?: boolean;
  isKuCoinWallet?: boolean;
  isStatus?: boolean;
  isImToken?: boolean;
  isTokenary?: boolean;
  providers?: EthProvider[];
};

type Eip6963ProviderDetail = {
  info?: { name?: string; rdns?: string };
  provider?: EthProvider;
};

function pushUnique(list: string[], name: string) {
  if (!list.includes(name)) list.push(name);
}

function classifyEthProvider(p: EthProvider | undefined, found: string[]) {
  if (!p) return;

  if (p.isRabby) pushUnique(found, "Rabby");
  if (p.isBraveWallet) pushUnique(found, "Brave Wallet");
  if (p.isCoinbaseWallet || p.isCoinbaseBrowser) pushUnique(found, "Coinbase Wallet");
  if (p.isTrust || p.isTrustWallet) pushUnique(found, "Trust Wallet");
  if (p.isRainbow) pushUnique(found, "Rainbow");
  if (p.isFrame) pushUnique(found, "Frame");
  if (p.isTokenPocket) pushUnique(found, "TokenPocket");
  if (p.isOkxWallet || p.isOKExWallet) pushUnique(found, "OKX Wallet");
  if (p.isAvalanche || p.isCore || p.isCoreWallet) pushUnique(found, "Core");
  if (p.isExodus) pushUnique(found, "Exodus");
  if (p.isOpera) pushUnique(found, "Opera Wallet");
  if (p.isBitKeep || p.isBitget) pushUnique(found, "Bitget Wallet");
  if (p.isMathWallet) pushUnique(found, "MathWallet");
  if (p.isOneInchIOSWallet || p.isOneInchAndroidWallet) pushUnique(found, "1inch Wallet");
  if (p.isTally || p.isPortal) pushUnique(found, "Taho");
  if (p.isZerion) pushUnique(found, "Zerion");
  if (p.isBackpack) pushUnique(found, "Backpack");
  if (p.isPhantom) pushUnique(found, "Phantom");
  if (p.isBinance) pushUnique(found, "Binance Wallet");
  if (p.isBybit) pushUnique(found, "Bybit Wallet");
  if (p.isFrontier) pushUnique(found, "Frontier");
  if (p.isKuCoinWallet) pushUnique(found, "KuCoin Wallet");
  if (p.isStatus) pushUnique(found, "Status");
  if (p.isImToken) pushUnique(found, "imToken");
  if (p.isTokenary) pushUnique(found, "Tokenary");

  // MetaMask last — many wallets spoof isMetaMask
  if (p.isMetaMask && !p.isBraveWallet && !p.isRabby && !p.isAvalanche) {
    pushUnique(found, "MetaMask");
  }
}

/** Exact EIP-6963 rdns → display name (most reliable when wallets announce). */
const RDNS_MAP: Record<string, string> = {
  "io.metamask": "MetaMask",
  "io.metamask.flask": "MetaMask Flask",
  "io.rabby": "Rabby",
  "com.coinbase.wallet": "Coinbase Wallet",
  "com.brave.wallet": "Brave Wallet",
  "com.okex.wallet": "OKX Wallet",
  "com.trustwallet.app": "Trust Wallet",
  "me.rainbow": "Rainbow",
  "io.zerion.wallet": "Zerion",
  "app.phantom": "Phantom",
  "app.backpack": "Backpack",
  "com.binance.wallet": "Binance Wallet",
  "com.bybit": "Bybit Wallet",
  "com.frontier.wallet": "Frontier",
  "pro.tokenpocket": "TokenPocket",
  "com.bitget.web3": "Bitget Wallet",
  "com.exodus": "Exodus",
  "xyz.framewallet": "Frame",
  "app.core.extension": "Core",
  "io.xdefi": "XDEFI",
  "com.enkrypt.app": "Enkrypt",
  "io.1inch.wallet": "1inch Wallet",
  "org.uniswap.app": "Uniswap Wallet",
  "com.ledger": "Ledger",
  "app.safe.global": "Safe",
  "com.taho.wallet": "Taho",
  "xyz.talisman": "Talisman",
  "app.subwallet": "SubWallet",
  "io.nightly.app": "Nightly",
  "app.phantom.wallet": "Phantom",
};

function classifyByRdns(rdns: string | undefined, name: string | undefined, found: string[]) {
  const exact = (rdns || "").toLowerCase();
  if (exact && RDNS_MAP[exact]) {
    pushUnique(found, RDNS_MAP[exact]);
    return;
  }

  const key = (rdns || name || "").toLowerCase();
  if (!key) return;

  if (key.includes("metamask")) pushUnique(found, "MetaMask");
  else if (key.includes("rabby")) pushUnique(found, "Rabby");
  else if (key.includes("coinbase")) pushUnique(found, "Coinbase Wallet");
  else if (key.includes("brave")) pushUnique(found, "Brave Wallet");
  else if (key.includes("okx") || key.includes("okex")) pushUnique(found, "OKX Wallet");
  else if (key.includes("trust")) pushUnique(found, "Trust Wallet");
  else if (key.includes("rainbow")) pushUnique(found, "Rainbow");
  else if (key.includes("zerion")) pushUnique(found, "Zerion");
  else if (key.includes("phantom")) pushUnique(found, "Phantom");
  else if (key.includes("backpack")) pushUnique(found, "Backpack");
  else if (key.includes("binance")) pushUnique(found, "Binance Wallet");
  else if (key.includes("bybit")) pushUnique(found, "Bybit Wallet");
  else if (key.includes("frontier")) pushUnique(found, "Frontier");
  else if (key.includes("tokenpocket")) pushUnique(found, "TokenPocket");
  else if (key.includes("bitget") || key.includes("bitkeep")) pushUnique(found, "Bitget Wallet");
  else if (key.includes("exodus")) pushUnique(found, "Exodus");
  else if (key.includes("frame")) pushUnique(found, "Frame");
  else if (key.includes("core.avalanche") || key.includes("avax")) pushUnique(found, "Core");
  else if (key.includes("enkrypt")) pushUnique(found, "Enkrypt");
  else if (key.includes("uniswap")) pushUnique(found, "Uniswap Wallet");
  else if (key.includes("ledger")) pushUnique(found, "Ledger");
  else if (key.includes("talisman")) pushUnique(found, "Talisman");
  else if (key.includes("subwallet")) pushUnique(found, "SubWallet");
  else if (name) pushUnique(found, name);
}

function scanLegacyProviders(found: string[]) {
  const w = window as unknown as Window & Record<string, unknown>;

  const eth = w.ethereum as EthProvider | undefined;
  if (eth) {
    const providers =
      Array.isArray(eth.providers) && eth.providers.length > 0 ? eth.providers : [eth];
    for (const p of providers) classifyEthProvider(p, found);
  }

  if (w.coinbaseWalletExtension) pushUnique(found, "Coinbase Wallet");
  if (w.rabby) pushUnique(found, "Rabby");
  if (w.trustwallet || w.trustWallet) pushUnique(found, "Trust Wallet");

  const phantom = w.phantom as { ethereum?: EthProvider; solana?: unknown } | undefined;
  if (phantom?.ethereum) {
    pushUnique(found, "Phantom");
    classifyEthProvider(phantom.ethereum, found);
  }
  if (phantom?.solana) pushUnique(found, "Phantom");

  const solana = w.solana as {
    isPhantom?: boolean;
    isSolflare?: boolean;
    isBackpack?: boolean;
  } | undefined;
  if (solana?.isPhantom) pushUnique(found, "Phantom");
  if (solana?.isSolflare || w.solflare) pushUnique(found, "Solflare");
  if (solana?.isBackpack || w.backpack) pushUnique(found, "Backpack");
  if (w.glow) pushUnique(found, "Glow");
  if (w.nightly) pushUnique(found, "Nightly");
  if (w.slope) pushUnique(found, "Slope");

  const okx = w.okxwallet as { ethereum?: EthProvider } | undefined;
  if (okx) {
    pushUnique(found, "OKX Wallet");
    classifyEthProvider(okx.ethereum, found);
  }

  const bitkeep = w.bitkeep as { ethereum?: EthProvider } | undefined;
  if (bitkeep?.ethereum) {
    pushUnique(found, "Bitget Wallet");
    classifyEthProvider(bitkeep.ethereum, found);
  }

  if (w.tronLink || w.tronWeb) pushUnique(found, "TronLink");
  if (w.keplr) pushUnique(found, "Keplr");
  if (w.leap) pushUnique(found, "Leap");
  if (w.cosmostation) pushUnique(found, "Cosmostation");
  if (w.unisat) pushUnique(found, "Unisat");
  if (w.xfi || w.xdefi) pushUnique(found, "XDEFI");
  if (w.safepalProvider) pushUnique(found, "SafePal");
  if (w.BinanceChain || w.bnbchain || w.binancew3w) pushUnique(found, "Binance Wallet");
  if (w.bybitWallet || w.bybit) pushUnique(found, "Bybit Wallet");
  if (w.frontier) pushUnique(found, "Frontier");
  if (w.foxwallet) pushUnique(found, "FoxWallet");
  if (w.gatewallet) pushUnique(found, "Gate Wallet");
  if (w.enkrypt) pushUnique(found, "Enkrypt");
  if (w.talismanEth || w.talisman) pushUnique(found, "Talisman");
  if (w.subwallet) pushUnique(found, "SubWallet");
  if (w.ethereum && (w as { isTokenPocket?: boolean }).isTokenPocket) {
    pushUnique(found, "TokenPocket");
  }
}

function requestEip6963Providers() {
  try {
    window.dispatchEvent(new Event("eip6963:requestProvider"));
  } catch {
    // ignore
  }
  try {
    window.dispatchEvent(
      new CustomEvent("eip6963:requestProvider", { bubbles: true }),
    );
  } catch {
    // ignore
  }
}

/**
 * Best-effort wallet discovery for a passive page visit.
 * Cannot be 100%: many wallets hide until user clicks Connect.
 */
export async function detectWalletsAsync(waitMs = 2200): Promise<string[]> {
  if (typeof window === "undefined") return [];

  const found: string[] = [];
  const eipDetails: Eip6963ProviderDetail[] = [];

  const onAnnounce = (event: Event) => {
    const detail = (event as CustomEvent<Eip6963ProviderDetail>).detail;
    if (detail) eipDetails.push(detail);
  };

  window.addEventListener("eip6963:announceProvider", onAnnounce);
  requestEip6963Providers();
  scanLegacyProviders(found);

  // Re-request while extensions finish injecting
  const step = Math.max(400, Math.floor(waitMs / 4));
  let waited = 0;
  while (waited < waitMs) {
    await new Promise((r) => setTimeout(r, step));
    waited += step;
    requestEip6963Providers();
    scanLegacyProviders(found);
  }

  for (const detail of eipDetails) {
    classifyByRdns(detail.info?.rdns, detail.info?.name, found);
    classifyEthProvider(detail.provider, found);
  }

  window.removeEventListener("eip6963:announceProvider", onAnnounce);

  if (found.length === 0) {
    const eth = (window as Window & { ethereum?: EthProvider }).ethereum;
    if (eth) pushUnique(found, "Ethereum-compatible wallet");
  }

  return found;
}

export function detectSystem(): string {
  if (typeof navigator === "undefined") return "Unknown";

  const ua = navigator.userAgent;
  const uaData = (
    navigator as Navigator & {
      userAgentData?: { platform?: string; mobile?: boolean; brands?: Array<{ brand: string }> };
    }
  ).userAgentData;

  let os = "Unknown OS";
  if (uaData?.platform) {
    const p = uaData.platform.toLowerCase();
    if (p.includes("win")) os = "Windows";
    else if (p.includes("mac")) os = "macOS";
    else if (p.includes("linux")) os = "Linux";
    else if (p.includes("android")) os = "Android";
    else if (p.includes("cros")) os = "ChromeOS";
    else os = uaData.platform;
  }
  if (os === "Unknown OS" || os === "Windows") {
    // UA always says NT 10.0 for both Win10 and Win11 — refined in detectSystemAsync
    if (/Windows NT 10/i.test(ua)) os = "Windows";
    else if (/Windows NT 6.3/i.test(ua)) os = "Windows 8.1";
    else if (/Windows/i.test(ua)) os = "Windows";
    else if (/Mac OS X/i.test(ua)) os = "macOS";
    else if (/Android/i.test(ua)) os = "Android";
    else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
    else if (/Linux/i.test(ua)) os = "Linux";
    else if (/CrOS/i.test(ua)) os = "ChromeOS";
  }

  let device = "Desktop";
  if (uaData?.mobile || /Mobi|Android.*Mobile|iPhone|iPod/i.test(ua)) device = "Mobile";
  else if (/iPad|Tablet|Android(?!.*Mobile)/i.test(ua)) device = "Tablet";

  let browser = "Unknown browser";
  const brands = uaData?.brands?.map((b) => b.brand.toLowerCase()) ?? [];
  if (brands.some((b) => b.includes("edge"))) browser = "Edge";
  else if (brands.some((b) => b.includes("opera"))) browser = "Opera";
  else if (brands.some((b) => b.includes("chrome"))) browser = "Chrome";
  else if (brands.some((b) => b.includes("firefox"))) browser = "Firefox";
  else if (brands.some((b) => b.includes("safari"))) browser = "Safari";
  else if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/OPR\/|Opera/i.test(ua)) browser = "Opera";
  else if (/SamsungBrowser/i.test(ua)) browser = "Samsung Internet";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";
  else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) browser = "Chrome";
  else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = "Safari";

  return `${os} · ${device} · ${browser}`;
}

/** Windows 10 vs 11 via Client Hints (UA alone cannot tell them apart). */
export async function detectSystemAsync(): Promise<string> {
  const base = detectSystem();
  if (!base.startsWith("Windows")) return base;

  const uaData = (
    navigator as Navigator & {
      userAgentData?: {
        getHighEntropyValues?: (
          hints: string[],
        ) => Promise<{ platformVersion?: string }>;
      };
    }
  ).userAgentData;

  try {
    const entropy = await uaData?.getHighEntropyValues?.(["platformVersion"]);
    const major = Number.parseInt(entropy?.platformVersion?.split(".")[0] ?? "", 10);
    // Chromium: platformVersion major >= 13 ⇒ Windows 11
    if (Number.isFinite(major)) {
      const win = major >= 13 ? "Windows 11" : "Windows 10";
      return base.replace(/^Windows/, win);
    }
  } catch {
    // keep generic Windows
  }

  return base;
}

export function getTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown";
  } catch {
    return "Unknown";
  }
}

/**
 * Cross-browser same-PC fingerprint.
 * Stable across Chrome profiles / browsers on one machine.
 * Avoids zoom-sensitive and profile-specific signals (DPR, languages, avail size).
 */
export function getDeviceFingerprint(): string {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return "unknown";
  }

  const tz = getTimezone();
  const webgl = getWebGlInfo();

  const parts = [
    navigator.platform || "",
    tz,
    String(screen?.width ?? 0),
    String(screen?.height ?? 0),
    String(screen?.colorDepth ?? 0),
    String(navigator.hardwareConcurrency || 0),
    String(navigator.maxTouchPoints || 0),
    webgl,
  ];

  return parts.join("|");
}

function getWebGlInfo(): string {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      (canvas.getContext("webgl") as WebGLRenderingContext | null) ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
    if (!gl) return "";
    const ext = gl.getExtension("WEBGL_debug_renderer_info") as {
      UNMASKED_VENDOR_WEBGL: number;
      UNMASKED_RENDERER_WEBGL: number;
    } | null;
    if (!ext) {
      return String(gl.getParameter(gl.VENDOR) || "");
    }
    const vendor = String(gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) || "");
    const renderer = String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || "");
    return `${vendor}~${renderer}`;
  } catch {
    return "";
  }
}
