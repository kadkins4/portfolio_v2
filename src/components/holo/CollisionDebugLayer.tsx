"use client";

import { CIRCLES, SOLIDS } from "@/lib/cityCollision";
import { CHAR_R } from "@/lib/cityData";

/**
 * `?dev=1` overlay that draws the collision world on top of the rendered one.
 *
 * Solid outlines are the raw colliders; the dashed halo around each is the
 * same shape grown by CHAR_R — the line the player actually stops at. If a
 * building looks solid but has no box here, it has no collider; if the box sits
 * somewhere other than the art, render and collision have drifted apart.
 */
export default function CollisionDebugLayer() {
  return (
    <div
      id="nc-collision-debug"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 80,
      }}
    >
      {SOLIDS.map((s, i) => (
        <div key={`cs${i}`}>
          <div
            style={{
              position: "absolute",
              left: s.x - CHAR_R,
              top: s.y - CHAR_R,
              width: s.w + CHAR_R * 2,
              height: s.h + CHAR_R * 2,
              border: "1px dashed rgba(255,90,120,.35)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: s.x,
              top: s.y,
              width: s.w,
              height: s.h,
              border: "1px solid rgba(255,90,120,.85)",
              background: "rgba(255,90,120,.1)",
            }}
          />
        </div>
      ))}
      {CIRCLES.map((c, i) => (
        <div key={`cc${i}`}>
          <div
            style={{
              position: "absolute",
              left: c.x - c.r - CHAR_R,
              top: c.y - c.r - CHAR_R,
              width: (c.r + CHAR_R) * 2,
              height: (c.r + CHAR_R) * 2,
              borderRadius: "50%",
              border: "1px dashed rgba(120,230,160,.4)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: c.x - c.r,
              top: c.y - c.r,
              width: c.r * 2,
              height: c.r * 2,
              borderRadius: "50%",
              border: "1px solid rgba(120,230,160,.9)",
              background: "rgba(120,230,160,.12)",
            }}
          />
        </div>
      ))}
    </div>
  );
}
