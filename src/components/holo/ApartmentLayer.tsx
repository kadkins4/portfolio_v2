"use client";

import type { RefObject } from "react";
import { APARTMENT, DESTINATIONS, hueColor, padRect } from "@/lib/cityData";
import type { RoofAnim } from "@/lib/cityData";
// the roof-lift animation is generic; reuse the Galleria's rather than fork it
import roof from "./galleria.module.css";

const D = DESTINATIONS.find((d) => d.key === "about")!;
const HUE = D.hue;
const accent = hueColor(HUE, 0.85);
const dim = hueColor(HUE, 0.85, 0.13, 0.4);
const A = APARTMENT;

// furnishings are keyed by the same ids the collider list uses
const FURN = Object.fromEntries(A.furniture.map((f) => [f.id, f]));

/**
 * Unit 4B — a studio you walk into. The roof lifts on entry (same trigger
 * pattern as the Galleria: NeonCity flips `data-open` per frame from the player
 * position), revealing the apartment and the mat on the floor at the desk.
 */
export default function ApartmentLayer({
  anim,
  roofRef,
  active,
}: {
  anim: RoofAnim;
  roofRef: RefObject<HTMLDivElement | null>;
  active: boolean;
}) {
  const pr = padRect(D);
  return (
    <>
      {/* interior floor */}
      <div
        id="nc-apartment-floor"
        style={{
          position: "absolute",
          left: A.x + A.wall,
          top: A.y + A.wall,
          width: A.w - A.wall * 2,
          height: A.h - A.wall * 2,
          background:
            "repeating-linear-gradient(90deg, #17131f 0 22px, #141020 22px 44px)",
          boxShadow: "inset 0 0 40px rgba(0,0,0,.6)",
        }}
      />
      {/* rug — scenery, walk right over it */}
      <div
        id="nc-apartment-rug"
        style={{
          position: "absolute",
          left: A.rug.x,
          top: A.rug.y,
          width: A.rug.w,
          height: A.rug.h,
          borderRadius: 6,
          background: `repeating-linear-gradient(45deg, ${hueColor(
            HUE,
            0.6,
            0.09,
            0.16
          )} 0 10px, rgba(20,16,32,.5) 10px 20px)`,
          border: `1px solid ${hueColor(HUE, 0.7, 0.1, 0.22)}`,
        }}
      />
      {/* perimeter walls */}
      {A.walls.map((w, i) => (
        <div
          key={`aw${i}`}
          id={`nc-apartment-wall-${i}`}
          style={{
            position: "absolute",
            left: w.x,
            top: w.y,
            width: w.w,
            height: w.h,
            background: "#110f1e",
            border: `1px solid ${dim}`,
            boxShadow: "inset 0 0 12px rgba(0,0,0,.6)",
          }}
        />
      ))}
      {/* lit doorway threshold on the west wall */}
      <div
        id="nc-apartment-doorway"
        style={{
          position: "absolute",
          left: A.x,
          top: A.gap.top,
          width: 5,
          height: A.gap.bot - A.gap.top,
          background: accent,
          boxShadow: `0 0 16px ${accent}`,
          opacity: 0.9,
        }}
      />

      {/* ---- furnishings ---- */}
      {/* bed: frame, mattress, pillow */}
      <div
        id="nc-apartment-bed"
        style={{
          position: "absolute",
          left: FURN.bed.x,
          top: FURN.bed.y,
          width: FURN.bed.w,
          height: FURN.bed.h,
          borderRadius: 4,
          background: "#191428",
          border: "1px solid rgba(150,140,220,.28)",
        }}
      >
        <div
          id="nc-apartment-bed-mattress"
          style={{
            position: "absolute",
            inset: 6,
            borderRadius: 3,
            background: `linear-gradient(160deg, ${hueColor(
              HUE,
              0.5,
              0.08,
              0.35
            )}, rgba(20,16,32,.9))`,
          }}
        />
        <div
          id="nc-apartment-bed-pillow"
          style={{
            position: "absolute",
            left: 10,
            top: 10,
            width: 22,
            height: 16,
            borderRadius: 3,
            background: "rgba(236,232,246,.5)",
          }}
        />
      </div>
      {/* day bed — the couch, made up as a bed */}
      <div
        id="nc-apartment-daybed"
        style={{
          position: "absolute",
          left: FURN.daybed.x,
          top: FURN.daybed.y,
          width: FURN.daybed.w,
          height: FURN.daybed.h,
          borderRadius: 4,
          background: "#191428",
          border: "1px solid rgba(150,140,220,.28)",
        }}
      >
        <div
          id="nc-apartment-daybed-mattress"
          style={{
            position: "absolute",
            inset: 5,
            borderRadius: 3,
            background: `linear-gradient(160deg, ${hueColor(
              HUE,
              0.5,
              0.08,
              0.3
            )}, rgba(20,16,32,.9))`,
          }}
        />
        <div
          id="nc-apartment-daybed-pillow"
          style={{
            position: "absolute",
            left: 9,
            top: 9,
            width: 20,
            height: 14,
            borderRadius: 3,
            background: "rgba(236,232,246,.45)",
          }}
        />
      </div>
      {/* kitchenette counter + burners */}
      <div
        id="nc-apartment-counter"
        style={{
          position: "absolute",
          left: FURN.counter.x,
          top: FURN.counter.y,
          width: FURN.counter.w,
          height: FURN.counter.h,
          borderRadius: 3,
          background: "#141122",
          border: "1px solid rgba(150,140,220,.28)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          paddingLeft: 10,
        }}
      >
        {[0, 1].map((i) => (
          <div
            key={i}
            id={`nc-apartment-burner-${i}`}
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              border: "1px solid rgba(255,140,120,.4)",
              background: "rgba(255,120,90,.14)",
            }}
          />
        ))}
        <div
          id="nc-apartment-microwave"
          style={{
            width: 22,
            height: 14,
            borderRadius: 2,
            background: "#0c0b16",
            border: "1px solid rgba(150,140,220,.25)",
          }}
        />
      </div>
      {/* desk chair — scenery, so you can stand at the desk */}
      <div
        id="nc-apartment-chair"
        style={{
          position: "absolute",
          left: A.chair.x,
          top: A.chair.y,
          width: A.chair.w,
          height: A.chair.h,
          borderRadius: "50% 50% 4px 4px",
          background: "radial-gradient(circle at 40% 34%, #1d3324, #0d1712)",
          border: "1px solid rgba(110,190,140,.3)",
        }}
      >
        <div
          id="nc-apartment-chair-back"
          style={{
            position: "absolute",
            left: 4,
            top: 2,
            right: 4,
            height: 6,
            borderRadius: 3,
            background: "rgba(110,190,140,.28)",
          }}
        />
      </div>
      {/* desk + the computer that is the reason you came in */}
      <div
        id="nc-apartment-desk"
        style={{
          position: "absolute",
          left: FURN.desk.x,
          top: FURN.desk.y,
          width: FURN.desk.w,
          height: FURN.desk.h,
          borderRadius: 3,
          background: "#141122",
          border: "1px solid rgba(150,140,220,.3)",
        }}
      >
        {/* monitor, glowing whether or not you are standing there */}
        <div
          id="nc-apartment-computer"
          style={{
            position: "absolute",
            left: 30,
            top: 4,
            width: 34,
            height: 18,
            borderRadius: 2,
            background: `linear-gradient(180deg, ${hueColor(
              HUE,
              0.8,
              0.12,
              active ? 0.85 : 0.5
            )}, rgba(12,11,22,.9))`,
            border: `1px solid ${accent}`,
            boxShadow: `0 0 ${active ? 18 : 10}px ${hueColor(
              HUE,
              0.85,
              0.13,
              active ? 0.7 : 0.35
            )}`,
            animation: "ncFlick 6.5s infinite",
          }}
        />
      </div>
      {/* the mat, on the floor at the desk */}
      <div
        id="nc-pad-about"
        style={{
          position: "absolute",
          left: pr.x,
          top: pr.y,
          width: pr.w,
          height: pr.h,
          background: hueColor(HUE, 0.85, 0.13, active ? 0.3 : 0.16),
          border: `1px solid ${accent}`,
          borderRadius: 4,
          animation: "ncPulse 2s ease-in-out infinite",
          boxShadow: active
            ? `0 0 26px ${hueColor(HUE, 0.85, 0.13, 0.3)}`
            : "none",
        }}
      />

      {/* roof — lifts when you step in (NeonCity flips data-open per frame) */}
      <div
        ref={roofRef}
        id="nc-apartment-roof"
        className={roof.roof}
        data-anim={anim}
        data-open="0"
        style={{ left: A.x, top: A.y, width: A.w, height: A.h }}
      >
        <div className={`${roof.half} ${roof.halfL}`}>
          <div
            className={roof.skylight}
            style={{ left: 22, top: 40, width: 54, height: 34 }}
          />
          <div
            className={roof.hvac}
            style={{ left: 26, top: 210, width: 40, height: 30 }}
          />
        </div>
        <div className={`${roof.half} ${roof.halfR}`}>
          <div
            className={roof.skylight}
            style={{ left: 40, top: 54, width: 48, height: 30 }}
          />
          <div
            className={roof.hvac}
            style={{ left: 22, top: 206, width: 44, height: 32 }}
          />
        </div>
        {/* name painted on the roof; fades out as the roof lifts */}
        <div
          id="nc-apartment-sign"
          className={roof.roofSign}
          style={{ fontFamily: "var(--font-mono), monospace" }}
        >
          <div
            id="nc-apartment-sign-name"
            style={{
              fontSize: 15,
              letterSpacing: ".34em",
              color: accent,
              textShadow: `0 0 16px ${accent}`,
              animation: "ncFlick 7.5s infinite",
            }}
          >
            {D.sign}
          </div>
          <div
            id="nc-apartment-sign-sub"
            style={{ fontSize: 10, letterSpacing: ".26em", color: dim }}
          >
            {D.sub}
          </div>
        </div>
      </div>
    </>
  );
}
