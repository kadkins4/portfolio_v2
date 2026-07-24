import type { RoofAnim } from "@/lib/cityData";

// Scaffolding: mounted only under ?dev=1 so map-wide options can be compared in
// the live city. It persists to localStorage (handled by the parent) so a pick
// survives a reload while walking. Deleted with the losing branches at cutover.
const ROOFS: RoofAnim[] = ["split", "iris", "fade"];

export default function CityDevPanel({
  roofAnim,
  onRoofAnim,
}: {
  roofAnim: RoofAnim;
  onRoofAnim: (a: RoofAnim) => void;
}) {
  return (
    <div
      style={{
        position: "absolute",
        top: 16,
        right: 16,
        zIndex: 50,
        padding: "12px 14px",
        minWidth: 168,
        background: "rgba(12,11,22,.9)",
        border: "1px solid rgba(150,140,220,.3)",
        borderRadius: 8,
        boxShadow: "0 6px 24px rgba(0,0,0,.5)",
        font: "600 11px/1.4 ui-monospace, monospace",
        letterSpacing: "0.08em",
        color: "rgba(200,205,240,.9)",
        backdropFilter: "blur(6px)",
      }}
    >
      <div style={{ opacity: 0.6, marginBottom: 8 }}>◈ DEV · ROOF LIFT</div>
      <div style={{ display: "flex", gap: 6 }}>
        {ROOFS.map((r) => {
          const on = r === roofAnim;
          return (
            <button
              key={r}
              type="button"
              onClick={() => onRoofAnim(r)}
              style={{
                flex: 1,
                padding: "6px 0",
                cursor: "pointer",
                textTransform: "uppercase",
                color: on ? "#0b0a14" : "rgba(200,205,240,.8)",
                background: on ? "rgba(120,200,235,.9)" : "transparent",
                border: "1px solid rgba(120,200,235,.4)",
                borderRadius: 5,
                font: "inherit",
              }}
            >
              {r}
            </button>
          );
        })}
      </div>
      <div style={{ opacity: 0.5, marginTop: 8, fontSize: 10 }}>
        walk into the Galleria to preview
      </div>
    </div>
  );
}
