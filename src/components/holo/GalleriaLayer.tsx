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
  const { x, y, w, h, wall, gap, walls, kiosk, fountain, directory, label } =
    GALLERIA;

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
            "radial-gradient(120% 90% at 50% 0%, #17142880 0%, #0d0b18 70%), #0e0c18",
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(150,140,220,.06) 0 1px, transparent 1px 34px), repeating-linear-gradient(0deg, rgba(150,140,220,.06) 0 1px, transparent 1px 34px)",
          boxShadow: "inset 0 0 60px rgba(0,0,0,.6)",
          zIndex: 3,
        }}
      />

      {/* courtyard fountain (collidable centerpiece) */}
      <div
        style={{
          position: "absolute",
          left: fountain.x,
          top: fountain.y,
          width: fountain.w,
          height: fountain.h,
          borderRadius: "50%",
          border: "2px dashed rgba(120,200,235,.4)",
          background:
            "radial-gradient(circle at 50% 45%, rgba(120,200,235,.18), rgba(20,30,45,.35) 70%)",
          boxShadow: "inset 0 0 14px rgba(120,200,235,.2)",
          zIndex: 4,
        }}
      >
        <div
          className={css.ripple}
          style={{
            position: "absolute",
            inset: "34%",
            borderRadius: "50%",
            border: "1px solid rgba(140,210,240,.5)",
          }}
        />
      </div>

      {/* directory board — "YOU ARE HERE" (render-only) */}
      <div
        style={{
          position: "absolute",
          left: directory.x,
          top: directory.y,
          width: directory.w,
          height: directory.h,
          zIndex: 4,
          background: "#0c0b16",
          border: "1px solid rgba(120,200,235,.4)",
          boxShadow: "0 0 8px rgba(120,200,235,.2)",
          borderRadius: 2,
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(120,200,235,.16) 0 1px, transparent 1px 5px)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 3,
            right: 3,
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: "oklch(0.7 0.19 25)",
            boxShadow: "0 0 5px oklch(0.7 0.19 25)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -6,
            bottom: -12,
            width: 38,
            textAlign: "center",
            font: "700 5.5px/1 ui-monospace, monospace",
            letterSpacing: "0.14em",
            color: "rgba(120,200,235,.7)",
          }}
        >
          YOU ARE HERE
        </div>
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

// door strip on the side the unit faces, relative to its box (top-left origin)
function doorStyle(face: GalleriaUnit["face"], w: number, h: number) {
  switch (face) {
    case "S":
      return { left: w / 2 - 10, top: h - 4, width: 20, height: 4 };
    case "N":
      return { left: w / 2 - 10, top: 0, width: 20, height: 4 };
    case "W":
      return { left: 0, top: h / 2 - 10, width: 4, height: 20 };
    case "E":
      return { left: w - 4, top: h / 2 - 10, width: 4, height: 20 };
  }
}

// One storefront, backed flush to a wall with its door facing the courtyard.
// live → lit box with the project's name on the sign; in-progress → caution
// hoarding + building-permit board (still routes, the detail page stays
// reachable); vacant → dimmed box with a FOR LEASE placard, no pad.
function Unit({ u, lit }: { u: GalleriaUnit; lit: boolean }) {
  const { rect, hue, state, anchor, code, name } = u;
  const vacant = state === "vacant";
  const building = state === "in-progress";
  const live = state === "live";
  const pad = u.pad ? centerRect(u.pad) : null;
  const door = doorStyle(u.face, rect.w, rect.h);

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
          borderRadius: 3,
          background: "#131120",
          border: `1px solid ${live ? hueColor(hue, 0.85, 0.13, 0.45) : "rgba(150,140,220,.3)"}`,
          boxShadow: live
            ? `inset 0 0 16px rgba(0,0,0,.45), 0 0 ${anchor ? 20 : 13}px ${hueColor(hue, 0.7, 0.13, anchor ? 0.26 : 0.14)}`
            : "inset 0 0 16px rgba(0,0,0,.5)",
        }}
      >
        {/* faint inset window grid (shared building vocabulary) */}
        <div
          style={{
            position: "absolute",
            inset: 8,
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(150,140,220,.09) 0 1px, transparent 1px 12px), repeating-linear-gradient(0deg, rgba(150,140,220,.09) 0 1px, transparent 1px 12px)",
            pointerEvents: "none",
          }}
        />

        {/* sign: live shows the project name, in-progress shows UNIT code */}
        {(live || building) && (
          <div
            style={{
              position: "absolute",
              left: 4,
              right: 4,
              top: 6,
              textAlign: "center",
              font: "700 6.5px/1.1 ui-monospace, monospace",
              letterSpacing: "0.14em",
              color: live ? hueColor(hue, 0.85, 0.13) : "rgba(200,205,240,.7)",
              textShadow: live
                ? `0 0 6px ${hueColor(hue, 0.7, 0.13, 0.7)}`
                : "none",
              zIndex: 2,
            }}
          >
            {live ? name!.toUpperCase() : `UNIT ${code}`}
            {anchor && (
              <div
                style={{
                  marginTop: 2,
                  font: "700 5px/1 ui-monospace, monospace",
                  letterSpacing: "0.2em",
                  color: "rgba(243,237,226,.4)",
                }}
              >
                ANCHOR
              </div>
            )}
          </div>
        )}

        {/* construction overlay: caution stripes + building-permit board */}
        {building && (
          <>
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 3,
                backgroundImage:
                  "repeating-linear-gradient(45deg, oklch(0.8 0.12 46 / .22) 0 7px, rgba(14,12,25,.85) 7px 14px)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%,-50%)",
                padding: "3px 5px",
                maxWidth: rect.w - 12,
                font: "700 6px/1.25 ui-monospace, monospace",
                letterSpacing: "0.08em",
                textAlign: "center",
                color: "#3a3020",
                background: "#e8dcc2",
                border: "1px solid #9a8a60",
              }}
            >
              BUILDING PERMIT
              <div style={{ color: "#5a4d2e", marginTop: 1 }}>{u.permit}</div>
            </div>
          </>
        )}

        {/* for-lease overlay: scrim + rotated placard */}
        {vacant && (
          <>
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 3,
                background: "rgba(10,9,19,.55)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%,-50%) rotate(-4deg)",
                padding: "3px 6px",
                font: "700 7px/1.3 ui-monospace, monospace",
                letterSpacing: "0.16em",
                textAlign: "center",
                color: "rgba(200,205,240,.72)",
                background: "#0c0b16",
                border: "1px solid rgba(150,140,220,.3)",
              }}
            >
              FOR LEASE
              <div
                style={{ fontSize: 5, opacity: 0.6, letterSpacing: "0.1em" }}
              >
                INQUIRE WITHIN
              </div>
            </div>
          </>
        )}

        {/* door strip on the facing side */}
        <div
          style={{
            position: "absolute",
            ...door,
            borderRadius: 1,
            background: hueColor(hue, 0.8, 0.13, live ? 0.9 : 0.25),
            boxShadow: live
              ? `0 0 6px ${hueColor(hue, 0.7, 0.13, 0.6)}`
              : "none",
            zIndex: 3,
          }}
        />
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
            borderRadius: 4,
            background: hueColor(hue, 0.85, 0.13, lit ? 0.3 : 0.12),
            border: `1px solid ${hueColor(hue, 0.85, 0.13, lit ? 0.9 : 0.4)}`,
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
