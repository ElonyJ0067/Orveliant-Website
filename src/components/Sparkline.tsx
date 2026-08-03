const STABLES = new Set(["tether", "usd-coin", "USDT", "USDC"]);

export function Sparkline({
  data,
  up,
  id = "spark",
  width = 120,
  height = 36,
}: {
  data: number[];
  up: boolean;
  /** Unique id so gradient defs don't clash across table rows. */
  id?: string;
  width?: number;
  height?: number;
}) {
  if (!data || data.length < 2) {
    return <div style={{ width, height }} />;
  }

  const stable = STABLES.has(id);
  let min = Math.min(...data);
  let max = Math.max(...data);

  // Pegged assets: fixed band around $1 so noise doesn't look like a crash/rally.
  if (stable) {
    const mid = 1;
    const pad = 0.005; // ±0.5%
    min = mid - pad;
    max = mid + pad;
  }

  const range = max - min || 1;
  const step = width / (data.length - 1);
  const points = data.map((d, i) => {
    const x = i * step;
    const clamped = Math.min(max, Math.max(min, d));
    const y = height - ((clamped - min) / range) * (height - 4) - 2;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });

  // Soft curve (CMC-like) via Catmull-Rom → cubic bezier.
  const path = smoothPath(points.map((p) => p.split(",").map(Number) as [number, number]));
  const color = up ? "#35c07a" : "#e5544b";
  const gradId = `sg-${id.replace(/[^a-z0-9_-]/gi, "")}-${up ? "u" : "d"}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`${path} L${width},${height} L0,${height} Z`}
        fill={`url(#${gradId})`}
        stroke="none"
      />
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function smoothPath(pts: [number, number][]): string {
  if (pts.length < 2) return "";
  if (pts.length === 2) {
    return `M${pts[0][0]},${pts[0][1]} L${pts[1][0]},${pts[1][1]}`;
  }

  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]}`;
  }
  return d;
}
