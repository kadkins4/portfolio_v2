import type { Ref } from "react";
import { GALLERIA, hueColor, centerRect, type RoofAnim } from "@/lib/cityData";
import type { GalleriaUnit } from "@/lib/galleriaUnits";
import css from "./galleria.module.css";

// The projects mall. Renders in world-space at GALLERIA's origin. The roof is a
// separate element whose `data-open` the RAF loop toggles per frame; this
// component owns the static shell, the roof surface + detail, and the
// storefront units (occupancy derived from the project list upstream).
export default function GalleriaLayer({
  anim,
  roofRef,
  units,
  onPad,
}: {
  anim: RoofAnim;
  roofRef: Ref<HTMLDivElement>;
  units: GalleriaUnit[];
  onPad: string | null;
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

      {/* storefront units (sit on the interior floor, hidden under the roof) */}
      {units.map((u) => (
        <Unit key={u.id} u={u} lit={onPad === u.id} />
      ))}

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

// One storefront. Rendered by state: a lit unit routes to its project, an
// in-progress unit shows a hoarding + permit board (still routes, since the
// detail page stays reachable), a vacant unit shows FOR LEASE and has no pad.
function Unit({ u, lit }: { u: GalleriaUnit; lit: boolean }) {
  const { rect, hue, state, anchor } = u;
  const accent = hueColor(hue, 0.82, 0.13);
  const vacant = state === "vacant";
  const building = state === "in-progress";
  const pad = u.pad ? centerRect(u.pad) : null;

  return (
    <>
      {/* the storefront box */}
      <div
        style={{
          position: "absolute",
          left: rect.x,
          top: rect.y,
          width: rect.w,
          height: rect.h,
          zIndex: 4,
          borderRadius: 4,
          background: vacant
            ? "linear-gradient(180deg, #131120, #0d0b16)"
            : "linear-gradient(180deg, #1a1730, #110f1e)",
          border: `1px solid ${vacant ? "rgba(150,140,220,.14)" : hueColor(hue, 0.7, 0.1, 0.5)}`,
          boxShadow: vacant
            ? "inset 0 0 18px rgba(0,0,0,.5)"
            : `inset 0 0 18px rgba(0,0,0,.45), 0 0 ${anchor ? 22 : 14}px ${hueColor(hue, 0.7, 0.12, anchor ? 0.28 : 0.18)}`,
          display: "grid",
          placeItems: "center",
        }}
      >
        {vacant ? (
          <div
            style={{
              font: "700 9px/1.3 ui-monospace, monospace",
              letterSpacing: "0.18em",
              textAlign: "center",
              color: "rgba(170,180,225,.5)",
            }}
          >
            FOR
            <br />
            LEASE
          </div>
        ) : building ? (
          <>
            {/* hoarding stripes */}
            <div
              style={{
                position: "absolute",
                inset: 5,
                borderRadius: 3,
                backgroundImage:
                  "repeating-linear-gradient(45deg, rgba(240,200,90,.16) 0 10px, rgba(20,18,10,.5) 10px 20px)",
                border: "1px solid rgba(240,200,90,.3)",
              }}
            />
            {/* permit board */}
            <div
              style={{
                position: "relative",
                padding: "3px 6px",
                font: "700 8px/1.3 ui-monospace, monospace",
                letterSpacing: "0.12em",
                color: "rgba(245,220,150,.95)",
                background: "#0c0b16",
                border: "1px solid rgba(240,200,90,.4)",
                textAlign: "center",
              }}
            >
              BUILDING
              <br />
              PERMIT
            </div>
          </>
        ) : (
          <>
            {/* lit sign strip */}
            <div
              style={{
                position: "absolute",
                left: 6,
                right: 6,
                top: 6,
                height: 10,
                borderRadius: 2,
                background: hueColor(hue, 0.55, 0.12, 0.22),
                border: `1px solid ${hueColor(hue, 0.75, 0.13, 0.6)}`,
                boxShadow: `0 0 10px ${hueColor(hue, 0.7, 0.13, 0.4)}`,
              }}
            />
            {/* windows */}
            <div
              style={{
                position: "absolute",
                inset: "24px 8px 8px 8px",
                backgroundImage:
                  "repeating-linear-gradient(90deg, rgba(150,140,220,.1) 0 1px, transparent 1px 16px)",
              }}
            />
          </>
        )}
      </div>

      {/* entrance pad — glows brighter when the player is standing on it */}
      {pad && (
        <div
          style={{
            position: "absolute",
            left: pad.x,
            top: pad.y,
            width: pad.w,
            height: pad.h,
            zIndex: 4,
            borderRadius: 6,
            background: hueColor(hue, 0.7, 0.13, lit ? 0.3 : 0.12),
            border: `1px solid ${hueColor(hue, 0.75, 0.13, lit ? 0.9 : 0.4)}`,
            boxShadow: lit
              ? `0 0 16px ${hueColor(hue, 0.7, 0.13, 0.5)}`
              : "none",
            transition: "background .15s, box-shadow .15s",
          }}
        />
      )}
    </>
  );
}
