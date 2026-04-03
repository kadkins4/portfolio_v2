import { ImageResponse } from "next/og";

export const alt = "Kendall Adkins — Senior Software Engineer";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        background: "#0d0b09",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      {/* Subtle glow effect */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          right: "10%",
          width: 300,
          height: 300,
          background:
            "radial-gradient(circle, rgba(160,128,96,0.15) 0%, transparent 70%)",
          borderRadius: "50%",
        }}
      />

      {/* Name */}
      <div
        style={{
          display: "flex",
          fontSize: 72,
          fontFamily: "system-ui, sans-serif",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          marginBottom: 16,
        }}
      >
        <span style={{ color: "#ebe6e0" }}>Kendall&nbsp;</span>
        <span
          style={{
            color: "#a08060",
          }}
        >
          Adkins
        </span>
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: 32,
          color: "#6a645c",
          fontFamily: "monospace",
          fontWeight: 400,
        }}
      >
        Senior Software Engineer
      </div>
    </div>,
    {
      ...size,
    }
  );
}
