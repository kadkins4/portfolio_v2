import { ImageResponse } from "next/og";
import { createReader } from "@keystatic/core/reader";
import config from "../../../../../keystatic.config";

export const alt = "Note by Kendall Adkins";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const getReader = () => createReader(process.cwd(), config);

export async function generateStaticParams() {
  const reader = getReader();
  const items = await reader.collections.notes.all();
  return items.map((item) => ({ slug: item.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const reader = getReader();
  const { slug } = await params;
  const note = await reader.collections.notes.read(slug);
  const title = note?.title ?? "Note";

  return new ImageResponse(
    <div
      style={{
        background: "#0d0b09",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        position: "relative",
      }}
    >
      {/* Subtle glow effect */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          right: "8%",
          width: 320,
          height: 320,
          background:
            "radial-gradient(circle, rgba(160,128,96,0.15) 0%, transparent 70%)",
          borderRadius: "50%",
        }}
      />

      {/* Eyebrow + title */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            fontSize: 24,
            fontFamily: "monospace",
            letterSpacing: "0.2em",
            color: "#a08060",
            marginBottom: 28,
          }}
        >
          NOTE
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 68,
            fontFamily: "system-ui, sans-serif",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            color: "#ebe6e0",
            maxWidth: 900,
          }}
        >
          {title}
        </div>
      </div>

      {/* Wordmark */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 30,
            fontFamily: "system-ui, sans-serif",
            fontWeight: 700,
          }}
        >
          <span style={{ color: "#ebe6e0" }}>Kendall&nbsp;</span>
          <span style={{ color: "#a08060" }}>Adkins</span>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 24,
            fontFamily: "monospace",
            color: "#6a645c",
          }}
        >
          kendalladkins.dev
        </div>
      </div>
    </div>,
    {
      ...size,
    }
  );
}
