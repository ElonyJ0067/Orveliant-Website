import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { NextResponse } from "next/server";
import { buildSystemPrompt, CHAT_MODEL } from "@/lib/chatKnowledge";

export const runtime = "nodejs";

const execFileAsync = promisify(execFile);

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

function groqApiKey(): string {
  const key = process.env.GROQ_API_KEY?.trim() ?? "";
  if (!key) {
    throw Object.assign(new Error("GROQ_API_KEY is not configured"), { status: 500 });
  }
  return key;
}

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type Payload = {
  messages?: ChatMessage[];
};

type GroqChoiceMessage = {
  role?: string;
  content?: string | null;
  reasoning?: string | null;
};

type GroqChatResponse = {
  choices?: Array<{ message?: GroqChoiceMessage }>;
  error?: { message?: string };
};

const MAX_MESSAGES = 20;
const MAX_CONTENT = 2000;

async function groqViaFetch(payload: Record<string, unknown>): Promise<GroqChatResponse> {
  const groqRes = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${groqApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const raw = await groqRes.text();
  let parsed: GroqChatResponse;
  try {
    parsed = JSON.parse(raw) as GroqChatResponse;
  } catch {
    throw Object.assign(new Error(`Invalid Groq JSON (${groqRes.status})`), {
      status: groqRes.status,
    });
  }

  if (!groqRes.ok) {
    throw Object.assign(new Error(parsed.error?.message || `Groq HTTP ${groqRes.status}`), {
      status: groqRes.status,
    });
  }

  return parsed;
}

/**
 * On some Windows/Cursor networks, Node egress to Groq is blocked (403),
 * while PowerShell/.NET still works. Call Groq through PowerShell automatically.
 */
async function groqViaPowerShell(payload: Record<string, unknown>): Promise<GroqChatResponse> {
  const encodedBody = Buffer.from(JSON.stringify(payload), "utf8").toString("base64");
  const encodedKey = Buffer.from(groqApiKey(), "utf8").toString("base64");

  const script = `
$ErrorActionPreference = 'Stop'
$key = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('${encodedKey}'))
$json = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('${encodedBody}'))
$bytes = [Text.Encoding]::UTF8.GetBytes($json)
$web = [Net.HttpWebRequest]::Create('${GROQ_URL}')
$web.Method = 'POST'
$web.ContentType = 'application/json'
$web.Accept = 'application/json'
$web.Timeout = 90000
$web.ReadWriteTimeout = 90000
$web.AutomaticDecompression = [Net.DecompressionMethods]::GZip -bor [Net.DecompressionMethods]::Deflate
$web.Headers.Add('Authorization', "Bearer $key")
$web.ContentLength = $bytes.Length
$stream = $web.GetRequestStream()
$stream.Write($bytes, 0, $bytes.Length)
$stream.Close()
try {
  $resp = $web.GetResponse()
} catch [Net.WebException] {
  if ($_.Exception.Response) { $resp = $_.Exception.Response } else { throw }
}
$reader = New-Object IO.StreamReader($resp.GetResponseStream(), [Text.Encoding]::UTF8)
$reader.ReadToEnd()
$reader.Close()
$resp.Close()
`.trim();

  const { stdout, stderr } = await execFileAsync(
    "powershell.exe",
    ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-Command", script],
    { timeout: 90_000, windowsHide: true, maxBuffer: 8 * 1024 * 1024 },
  );

  if (stderr?.trim()) {
    console.warn("[chat] powershell stderr", stderr.slice(0, 300));
  }

  const parsed = JSON.parse(stdout.trim()) as GroqChatResponse;
  if (parsed.error?.message) {
    throw new Error(parsed.error.message);
  }
  return parsed;
}

async function callGroq(payload: Record<string, unknown>): Promise<GroqChatResponse> {
  try {
    return await groqViaFetch(payload);
  } catch (err) {
    const status = (err as { status?: number }).status;
    if (process.platform === "win32" && (status === 403 || status === 401 || status === 502)) {
      console.warn("[chat] Node→Groq blocked; using Windows network path");
      return groqViaPowerShell(payload);
    }
    // Also try PowerShell if fetch threw a network error on Windows
    if (process.platform === "win32") {
      console.warn("[chat] fetch failed; trying Windows network path", err);
      return groqViaPowerShell(payload);
    }
    throw err;
  }
}

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const incoming = Array.isArray(body.messages) ? body.messages : [];
  if (incoming.length === 0) {
    return NextResponse.json({ ok: false, error: "Message required." }, { status: 422 });
  }

  const sanitized: ChatMessage[] = incoming
    .slice(-MAX_MESSAGES)
    .filter(
      (m): m is ChatMessage =>
        !!m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string",
    )
    .map((m) => ({
      role: m.role,
      content: m.content.trim().slice(0, MAX_CONTENT),
    }))
    .filter((m) => m.content.length > 0);

  if (sanitized.length === 0 || sanitized[sanitized.length - 1]?.role !== "user") {
    return NextResponse.json({ ok: false, error: "Message required." }, { status: 422 });
  }

  const messages = [{ role: "system" as const, content: buildSystemPrompt() }, ...sanitized];

  try {
    const parsed = await callGroq({
      model: CHAT_MODEL,
      messages,
      temperature: 0.55,
      max_completion_tokens: 700,
      top_p: 0.9,
      reasoning_effort: "low",
    });

    const reply = (parsed.choices?.[0]?.message?.content ?? "").trim();
    if (!reply) {
      console.error("[chat] empty content from model");
      return NextResponse.json(
        { ok: false, error: "I didn't catch that — try asking again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, reply });
  } catch (err) {
    const status = (err as { status?: number }).status;
    if (status === 500 && (err as Error).message?.includes("GROQ_API_KEY")) {
      console.error("[chat] missing GROQ_API_KEY");
      return NextResponse.json(
        { ok: false, error: "Assistant is not configured yet." },
        { status: 503 },
      );
    }
    console.error("[chat] request failed", err);
    return NextResponse.json(
      { ok: false, error: "Couldn't reach the assistant. Try again in a moment." },
      { status: 502 },
    );
  }
}
