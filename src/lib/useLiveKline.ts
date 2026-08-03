"use client";

import { useEffect, useState } from "react";
import { COINS } from "./coins";
import type { DeskInterval } from "./deskChart";

/** Forming candle from Binance kline stream. */
export type LiveKline = {
  t: number; // open time unix sec
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
  closed: boolean;
  updatedAt: number;
  interval: DeskInterval;
};

/**
 * Subscribe to a symbol's kline WebSocket so the Desk can stream
 * forming-candle OHLC + volume (not just last price).
 */
export function useLiveKline(
  coinId: string,
  interval: DeskInterval | null = "1h",
): LiveKline | null {
  const [kline, setKline] = useState<LiveKline | null>(null);
  const symbol = COINS.find((c) => c.id === coinId)?.binance?.toLowerCase();

  useEffect(() => {
    if (!symbol || !interval) {
      setKline(null);
      return;
    }

    setKline(null);

    let ws: WebSocket | null = null;
    let retry = 0;
    let disposed = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      if (disposed) return;
      try {
        ws = new WebSocket(
          `wss://stream.binance.com:9443/ws/${symbol}@kline_${interval}`,
        );
      } catch {
        schedule();
        return;
      }

      ws.onopen = () => {
        retry = 0;
      };

      ws.onmessage = (evt) => {
        try {
          const msg = JSON.parse(evt.data);
          const k = msg?.k;
          if (!k) return;
          const next: LiveKline = {
            t: Math.floor(Number(k.t) / 1000),
            o: parseFloat(k.o),
            h: parseFloat(k.h),
            l: parseFloat(k.l),
            c: parseFloat(k.c),
            v: parseFloat(k.v),
            closed: Boolean(k.x),
            updatedAt: Date.now(),
            interval,
          };
          if (
            !Number.isFinite(next.o) ||
            !Number.isFinite(next.h) ||
            !Number.isFinite(next.l) ||
            !Number.isFinite(next.c) ||
            !Number.isFinite(next.v)
          ) {
            return;
          }
          setKline(next);
        } catch {
          /* ignore */
        }
      };

      ws.onclose = () => {
        if (!disposed) schedule();
      };
      ws.onerror = () => {
        ws?.close();
      };
    };

    const schedule = () => {
      retry = Math.min(retry + 1, 6);
      const delay = 1000 * 2 ** (retry - 1);
      reconnectTimer = setTimeout(connect, delay);
    };

    connect();

    return () => {
      disposed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (ws) ws.close();
    };
  }, [symbol, interval]);

  return kline;
}
