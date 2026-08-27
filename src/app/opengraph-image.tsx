import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Ocean Park Asset — Built to Act on Opportunity. Engineered to Control Risk.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const logoData = await readFile(join(process.cwd(), "public", "logo.png"));
  const logoSrc = `data:image/png;base64,${logoData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background:
            "radial-gradient(1200px 500px at 85% 0%, rgba(201,162,39,0.22), transparent 60%), linear-gradient(135deg, #08090b 0%, #0e1014 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={72} height={72} alt="" />
          <span style={{ fontSize: 36, fontWeight: 700, color: "#f6f1e6" }}>
            Ocean Park <span style={{ color: "#e8ce78" }}>Asset</span>
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 62, fontWeight: 800, color: "#f6f1e6", lineHeight: 1.05 }}>
            Built to Act on Opportunity.
          </span>
          <span
            style={{
              fontSize: 62,
              fontWeight: 800,
              lineHeight: 1.05,
              background: "linear-gradient(120deg, #f4dd8f, #c9a227)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Engineered to Control Risk.
          </span>
          <span style={{ marginTop: 28, fontSize: 30, color: "#b6bac1" }}>
            AI Quant Trading · Staking · Hybrid
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 24,
            color: "#7d828b",
          }}
        >
          <span
            style={{
              width: 14,
              height: 14,
              background: "#e8ce78",
              transform: "rotate(45deg)",
              display: "flex",
            }}
          />
          Disciplined, risk-controlled AI investing · oceanparkasset.com
        </div>
      </div>
    ),
    { ...size },
  );
}
