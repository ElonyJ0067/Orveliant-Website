/**
 * Telegram alerts for Contact / Waitlist / Careers / Chat / Visitors.
 * Configure in `.env.local`:
 *   TELEGRAM_BOT_TOKEN=...
 *   TELEGRAM_CHAT_ID=...
 */

const TELEGRAM_SAFE_LENGTH = 3900;

function escapeTelegramHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function isTelegramConfigured(): boolean {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim() ?? "";
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim() ?? "";
  return token.length > 10 && chatId.length > 0;
}

export async function sendTelegramAlert(text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim() ?? "";
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim() ?? "";

  if (!token || !chatId) {
    console.warn(
      "[telegram] not configured — set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env.local",
    );
    return false;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    if (!res.ok) {
      console.error("[telegram] send failed", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("[telegram] request failed", err);
    return false;
  }
}

export function formatContactAlert(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): string {
  return [
    "<b>📩 New Contact message</b>",
    "",
    `<b>Name:</b> ${escapeTelegramHtml(data.name) || "—"}`,
    `<b>Email:</b> ${escapeTelegramHtml(data.email)}`,
    `<b>Subject:</b> ${escapeTelegramHtml(data.subject) || "—"}`,
    "",
    "<b>Message:</b>",
    escapeTelegramHtml(data.message),
  ].join("\n");
}

export function formatWaitlistAlert(data: {
  name: string;
  email: string;
  interest: string;
}): string {
  return [
    "<b>🚀 New Request Access signup</b>",
    "",
    `<b>Name:</b> ${escapeTelegramHtml(data.name) || "—"}`,
    `<b>Email:</b> ${escapeTelegramHtml(data.email)}`,
    `<b>Interest:</b> ${escapeTelegramHtml(data.interest) || "—"}`,
  ].join("\n");
}

export async function sendTelegramDocument(
  file: Blob,
  filename: string,
  caption?: string,
): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim() ?? "";
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim() ?? "";

  if (!token || !chatId) {
    console.warn(
      "[telegram] not configured — set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env.local",
    );
    return false;
  }

  try {
    const body = new FormData();
    body.append("chat_id", chatId);
    body.append("document", file, filename);
    if (caption) body.append("caption", caption);

    const res = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
      method: "POST",
      body,
    });

    if (!res.ok) {
      console.error("[telegram] document send failed", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("[telegram] document request failed", err);
    return false;
  }
}

export function formatCareersAlert(data: {
  name: string;
  email: string;
  roleTitle: string;
  team: string;
  path: string;
  commitment?: string;
  compensation: string;
  compensationNote?: string;
  location: string;
  experience: string;
  linkedin: string;
  githubOrPortfolio: string;
  secondLinkLabel?: string;
  resumeName?: string;
  message: string;
}): string {
  const roleLabel = `${data.roleTitle} · ${data.team}`;
  const comp = data.compensationNote
    ? `${data.compensation} · ${data.compensationNote}`
    : data.compensation;

  return [
    "<b>💼 New Careers application</b>",
    "",
    `<b>Name:</b> ${escapeTelegramHtml(data.name)}`,
    `<b>Email:</b> ${escapeTelegramHtml(data.email)}`,
    `<b>Role:</b> ${escapeTelegramHtml(roleLabel)}`,
    `<b>Page:</b> oceanparkasset.com${escapeTelegramHtml(data.path)}`,
    `<b>Commitment:</b> ${escapeTelegramHtml(data.commitment || "Full-time")}`,
    `<b>Comp band:</b> ${escapeTelegramHtml(comp)}`,
    `<b>Location:</b> ${escapeTelegramHtml(data.location) || "—"}`,
    `<b>Experience:</b> ${escapeTelegramHtml(data.experience) || "—"}`,
    `<b>LinkedIn:</b> ${escapeTelegramHtml(data.linkedin) || "—"}`,
    `<b>${escapeTelegramHtml(data.secondLinkLabel || "GitHub / Portfolio")}:</b> ${escapeTelegramHtml(data.githubOrPortfolio) || "—"}`,
    `<b>Resume:</b> ${escapeTelegramHtml(data.resumeName || "—")}`,
    "",
    "<b>Note:</b>",
    escapeTelegramHtml(data.message),
  ].join("\n");
}

const PUBLIC_HOST = "oceanparkasset.com";

/** Display path as oceanparkasset.com[/route] instead of a bare pathname. */
function formatPublicPage(path?: string): string {
  const raw = (path ?? "/").trim() || "/";
  const [pathnamePart, search = ""] = raw.split("?");
  let pathname = pathnamePart.replace(/^https?:\/\/[^/]+/i, "") || "/";
  if (!pathname.startsWith("/")) pathname = `/${pathname}`;
  if (pathname.length > 1 && pathname.endsWith("/")) {
    pathname = pathname.slice(0, -1);
  }

  const query = search ? `?${search}` : "";
  if (pathname === "/") return `${PUBLIC_HOST}${query}`;
  return `${PUBLIC_HOST}${pathname}${query}`;
}

type ChatTranscriptMessage = {
  role: "user" | "assistant";
  content: string;
};

function formatChatBlock(msg: ChatTranscriptMessage): string {
  const label = msg.role === "user" ? "Visitor" : "Assistant";
  return `<b>${label}:</b>\n${escapeTelegramHtml(msg.content)}`;
}

function fitTelegramLength(header: string[], blocks: string[]): string {
  const omitted = "<i>…earlier turns omitted</i>";
  let slice = blocks;

  while (slice.length > 0) {
    const prefix = slice.length < blocks.length ? [omitted, ""] : [];
    const text = [...header, ...prefix, slice.join("\n\n")].join("\n");
    if (text.length <= TELEGRAM_SAFE_LENGTH) return text;
    slice = slice.slice(1);
  }

  const last = blocks[blocks.length - 1] ?? "";
  const headerText = [...header, omitted, ""].join("\n");
  const budget = TELEGRAM_SAFE_LENGTH - headerText.length - 20;
  if (budget < 80) return headerText.slice(0, TELEGRAM_SAFE_LENGTH);

  const truncated = last.slice(0, budget) + "…";
  return [...header, omitted, "", truncated].join("\n");
}

export function formatChatAlert(data: {
  messages: ChatTranscriptMessage[];
  path?: string;
}): string {
  const header = ["<b>💬 Assistant chat transcript</b>", ""];

  if (data.path?.trim()) {
    header.push(`<b>Page:</b> ${escapeTelegramHtml(formatPublicPage(data.path))}`);
    header.push("");
  }

  const blocks = data.messages.map(formatChatBlock);
  return fitTelegramLength(header, blocks);
}

export function formatVisitorAlert(data: {
  visitorType: "New user" | "Returning user";
  location: string;
  ip: string;
  system: string;
  wallets: string;
  timezone: string;
  path?: string;
}): string {
  const ipLine =
    data.ip && data.ip !== "unknown"
      ? `<b>🌐 IP:</b> <a href="https://ipinfo.io/${escapeTelegramHtml(data.ip)}">${escapeTelegramHtml(data.ip)}</a>`
      : `<b>🌐 IP:</b> —`;

  const page = formatPublicPage(data.path);
  const pageHref = `https://${page}`;
  const pageLine = `<b>📄 Page:</b> <a href="${escapeTelegramHtml(pageHref)}">${escapeTelegramHtml(page)}</a>`;

  return [
    "<b>📥 Visitor on Ocean Park Asset</b>",
    "\u200c",
    `<b>👤 Visitor:</b> ${escapeTelegramHtml(data.visitorType)}`,
    `<b>💳 Wallets:</b> ${escapeTelegramHtml(data.wallets)}`,
    pageLine,
    `<b>📍 Location:</b> ${escapeTelegramHtml(data.location)}`,
    ipLine,
    `<b>💻 System:</b> ${escapeTelegramHtml(data.system)}`,
    `<b>🕒 Timezone:</b> ${escapeTelegramHtml(data.timezone)}`,
  ]
    .filter((line) => line !== "")
    .join("\n");
}
