// Scaffolding: mounted only under ?dev=1. The roof-lift picker lived here until
// "split" was chosen and the other two branches were deleted; what is left is
// the collider overlay, which is a debugging aid rather than a design choice.
export default function CityDevPanel({
  colliders,
  onColliders,
}: {
  colliders: boolean;
  onColliders: (on: boolean) => void;
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
      <div
        style={{
          opacity: 0.6,
          marginBottom: 8,
          paddingTop: 10,
          borderTop: "1px solid rgba(150,140,220,.2)",
        }}
      >
        ◈ DEV · COLLIDERS
      </div>
      <button
        type="button"
        onClick={() => onColliders(!colliders)}
        style={{
          width: "100%",
          padding: "6px 0",
          cursor: "pointer",
          textTransform: "uppercase",
          color: colliders ? "#0b0a14" : "rgba(200,205,240,.8)",
          background: colliders ? "rgba(255,120,145,.9)" : "transparent",
          border: "1px solid rgba(255,120,145,.45)",
          borderRadius: 5,
          font: "inherit",
        }}
      >
        {colliders ? "shown" : "hidden"}
      </button>
      <div style={{ opacity: 0.5, marginTop: 8, fontSize: 10 }}>
        solid = collider · dashed = stop line
      </div>
    </div>
  );
}
