import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        fontSize: 120,
        background: "#06060e",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, sans-serif",
        fontWeight: 700,
      }}
    >
      <span style={{ color: "#e8e8f0" }}>K</span>
      <span
        style={{
          background: "linear-gradient(135deg, #00d4ff, #7b61ff)",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        A.
      </span>
    </div>,
    {
      ...size,
    }
  );
}
