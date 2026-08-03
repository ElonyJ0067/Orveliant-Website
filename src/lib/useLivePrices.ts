"use client";

import { useEffect, useState } from "react";
import { COINS } from "./coins";

export type LiveTick = {
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
};
export type LiveMap = Record<string, LiveTick>; // keyed by CoinGecko id

const SYMBOL_TO_ID = new Map(
  COINS.filter((c) => c.binance).map((c) => [c.binance!.toUpperCase(), c.id]),
);

const STREAMS = COINS.filter((c) => c.binance)
  .map((c) => `${c.binance!.toLowerCase()}@ticker`)
  .join("/");

/**
 * Module-level singleton: one Binance WebSocket connection shared across the app
 * for sub-second updates, PLUS a same-origin REST polling fallback that kicks in
 * whenever the WebSocket isn't delivering (e.g. blocked by a browser extension,
 * proxy, or restrictive network). Reference-counted with reconnection.
 */
let socket: WebSocket | null = null;
let latest: LiveMap = {};
let retry = 0;
let refCount = 0;
let lastWsMsgAt = 0;
let pollTimer: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<(m: LiveMap) => void>();

function emit() {
  for (const fn of listeners) fn(latest);
}

function connect() {
  if (typeof window === "undefined") return;
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) return;

  let ws: WebSocket;
  try {
    ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${STREAMS}`);
  } catch {
    scheduleReconnect();
    return;
  }
  socket = ws;

  ws.onopen = () => {
    retry = 0;
  };

  ws.onmessage = (evt) => {
    try {
      const msg = JSON.parse(evt.data);
      const d = msg?.data;
      if (!d || !d.s) return;
      const id = SYMBOL_TO_ID.get(String(d.s).toUpperCase());
      if (!id) return;
      const price = parseFloat(d.c);
      if (!Number.isFinite(price)) return;
      lastWsMsgAt = Date.now();
      const next: LiveMap = {
        ...latest,
        [id]: {
          price,
          change24h: parseFloat(d.P),
          high24h: parseFloat(d.h),
          low24h: parseFloat(d.l),
        },
      };
      latest = next;
      emit();
    } catch {
      /* ignore malformed frames */
    }
  };

  ws.onclose = () => {
    if (refCount > 0) scheduleReconnect();
  };

  ws.onerror = () => {
    ws.close();
  };
}

function scheduleReconnect() {
  retry = Math.min(retry + 1, 6);
  const delay = 1000 * 2 ** (retry - 1); // 1s → up to ~32s
  setTimeout(() => {
    if (refCount > 0) connect();
  }, delay);
}

async function pollOnce() {
  // Only poll when the WebSocket hasn't produced data recently.
  if (Date.now() - lastWsMsgAt < 6000) return;
  try {
    const res = await fetch("/api/ticker", { cache: "no-store" });
    const json = await res.json();
    if (json?.ticks && Object.keys(json.ticks).length) {
      latest = { ...latest, ...json.ticks };
      emit();
    }
  } catch {
    /* keep last values */
  }
}

function startPolling() {
  if (pollTimer) return;
  pollOnce();
  pollTimer = setInterval(pollOnce, 3000);
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

export function useLivePrices(): LiveMap {
  const [prices, setPrices] = useState<LiveMap>(latest);

  useEffect(() => {
    refCount += 1;
    listeners.add(setPrices);
    setPrices(latest);
    connect();
    startPolling();

    return () => {
      listeners.delete(setPrices);
      refCount -= 1;
      if (refCount <= 0) {
        stopPolling();
        if (socket) {
          socket.close();
          socket = null;
        }
      }
    };
  }, []);

  return prices;
}
