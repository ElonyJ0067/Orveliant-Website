"use client";

import { useEffect, useRef, useState } from "react";
import { fmtPrice } from "@/lib/coins";

export function LivePrice({ value }: { value: number }) {
  const prev = useRef(value);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    const prevVal = prev.current;
    if (value === prevVal) return;
    setFlash(value > prevVal ? "up" : "down");
    prev.current = value;
    const t = setTimeout(() => setFlash(null), 1100);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <span
      className={`inline-block rounded px-1 tabular-nums transition-colors duration-500 ${
        flash === "up"
          ? "bg-up/20 text-up"
          : flash === "down"
            ? "bg-down/20 text-down"
            : "text-ink"
      }`}
    >
      {fmtPrice(value)}
    </span>
  );
}
