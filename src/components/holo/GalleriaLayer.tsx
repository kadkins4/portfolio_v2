import type { Ref } from "react";
import { GALLERIA, type RoofAnim } from "@/lib/cityData";
import css from "./galleria.module.css";

// The projects mall. Renders in world-space at GALLERIA's origin. The roof is a
// separate element whose `data-open` the RAF loop toggles per frame; this
// component only owns the static shell, the roof surface, and its detail.
// Units (the storefronts inside) arrive in T5.
export default function GalleriaLayer({
  anim,
  roofRef,
}: {
  anim: RoofAnim;
  roofRef: Ref<HTMLDivElement>;
}) {
  const { x, y, w, h, wall, gap, walls, kiosk, label } = GALLERIA;

  return (
    <>
      {/* interior floor — revealed when the roof lifts */}
      <div
        style={{
          position: "absolute",
          left: x + wall,
          top: y + wall,
          width: w - wall * 2,
          height: h - wall * 2,
          background:
            "radial-gradient(120% 90% at 50% 0%, #17142880 0%, #0d0b18 70%), #0b0a14",
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(150,140,220,.05) 0 1px, transparent 1px 44px), repeating-linear-gradient(0deg, rgba(150,140,220,.05) 0 1px, transparent 1px 44px)",
          boxShadow: "inset 0 0 60px rgba(0,0,0,.6)",
          zIndex: 3,
        }}
      >
        {/* concourse spine down the middle of the mall */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 24,
            bottom: 24,
            width: 2,
            transform: "translateX(-1px)",
            background:
              "repeating-linear-gradient(0deg, rgba(120,200,235,.22) 0 10px, transparent 10px 26px)",
          }}
        />
      </div>

      {/* perimeter walls — same rects cityCollision reads */}
      {walls.map((wl, i) => (
        <div
          key={`gwall${i}`}
          style={{
            position: "absolute",
            left: wl.x,
            top: wl.y,
            width: wl.w,
            height: wl.h,
            background: "linear-gradient(180deg, #171430, #100e1c)",
            border: "1px solid rgba(150,140,220,.16)",
            boxShadow: "0 0 16px rgba(0,0,0,.5)",
            zIndex: 5,
          }}
        />
      ))}

      {/* entrance gap: cyan glow strip on the wall line + dashed ground apron */}
      <div
        className={css.gapGlow}
        style={{
          left: x,
          top: gap.top,
          width: 10,
          height: gap.bot - gap.top,
          zIndex: 5,
        }}
      />
      <div
        className={css.apron}
        style={{
          left: x - 54,
          top: gap.top + 8,
          width: 54,
          height: gap.bot - gap.top - 16,
          zIndex: 2,
        }}
      />

      {/* kiosk — decorative foreground element outside the entrance */}
      <div
        style={{
          position: "absolute",
          left: kiosk.x,
          top: kiosk.y,
          width: kiosk.w,
          height: kiosk.h,
          background: "linear-gradient(180deg, #17142a, #0e0c1a)",
          border: "1px solid rgba(150,140,220,.18)",
          borderRadius: "8px 8px 4px 4px",
          boxShadow: "0 0 18px rgba(0,0,0,.5)",
          zIndex: 5,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "8px 8px auto 8px",
            height: 22,
            background: "#0a0913",
            border: "1px solid rgba(120,200,235,.3)",
            boxShadow: "inset 0 0 8px rgba(120,200,235,.18)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 10,
            bottom: 8,
            right: 10,
            height: 6,
            background:
              "repeating-linear-gradient(90deg, rgba(150,140,220,.16) 0 2px, transparent 2px 7px)",
          }}
        />
      </div>

      {/* ground label */}
      <div
        style={{
          position: "absolute",
          left: label.x,
          top: label.y,
          font: "700 15px/1 ui-monospace, monospace",
          letterSpacing: "0.34em",
          color: "rgba(120,190,235,.32)",
          pointerEvents: "none",
          zIndex: 2,
        }}
      >
        {label.text}
      </div>

      {/* roof — the RAF loop toggles data-open; data-anim comes from the panel */}
      <div
        ref={roofRef}
        className={css.roof}
        data-anim={anim}
        data-open="0"
        style={{ left: x, top: y, width: w, height: h }}
      >
        <div className={`${css.half} ${css.halfL}`}>
          <div
            className={css.skylight}
            style={{ left: 34, top: 120, width: 120, height: 40 }}
          />
          <div
            className={css.skylight}
            style={{ left: 34, top: 210, width: 120, height: 40 }}
          />
          <div
            className={css.billboard}
            style={{ left: 30, top: 40, width: 150, height: 34 }}
          >
            GALLERIA
          </div>
          <div
            className={css.hvac}
            style={{ left: 60, bottom: 60, width: 44, height: 34 }}
          />
        </div>
        <div className={`${css.half} ${css.halfR}`}>
          <div
            className={css.skylight}
            style={{ right: 34, top: 150, width: 120, height: 46 }}
          />
          <div
            className={css.hvac}
            style={{ right: 44, top: 60, width: 40, height: 40 }}
          />
          <div
            className={css.hvac}
            style={{ right: 96, top: 66, width: 30, height: 30 }}
          />
          <div
            className={css.hvac}
            style={{ right: 50, bottom: 80, width: 60, height: 40 }}
          />
        </div>
      </div>
    </>
  );
}
