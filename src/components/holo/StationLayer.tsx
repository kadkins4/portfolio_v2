"use client";

import type { RefObject } from "react";
import { STATION, DESTINATIONS, hueColor, padRect } from "@/lib/cityData";
// the roof-lift animation is generic; reuse the Galleria's rather than fork it
import roof from "./galleria.module.css";

const D = DESTINATIONS.find((d) => d.key === "resume")!;
const HUE = D.hue;
const accent = hueColor(HUE, 0.85);
const dim = hueColor(HUE, 0.85, 0.13, 0.4);
const S = STATION;

/**
 * Terminal Park Station — the ticket hall you walk into. The roof lifts on
 * entry (NeonCity flips `data-open` per frame from the player position), and
 * the rope line funnels you to the window, where the mat sits.
 */
export default function StationLayer({
  roofRef,
  active,
}: {
  roofRef: RefObject<HTMLDivElement | null>;
  active: boolean;
}) {
  const pr = padRect(D);
  return (
    <>
      {/* concourse floor */}
      <div
        id="nc-station-floor"
        style={{
          position: "absolute",
          left: S.x + S.wall,
          top: S.y + S.wall,
          width: S.w - S.wall * 2,
          height: S.h - S.wall * 2,
          background:
            "repeating-linear-gradient(45deg, #16121f 0 26px, #131020 26px 52px)",
          boxShadow: "inset 0 0 44px rgba(0,0,0,.6)",
        }}
      />
      {/* perimeter walls */}
      {S.walls.map((w, i) => (
        <div
          key={`sw${i}`}
          id={`nc-station-wall-${i}`}
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
      {/* lit threshold across the street door */}
      <div
        id="nc-station-doorway"
        style={{
          position: "absolute",
          left: S.gap.left,
          top: S.y + S.h,
          width: S.gap.right - S.gap.left,
          height: 5,
          background: accent,
          boxShadow: `0 0 16px ${accent}`,
          opacity: 0.9,
        }}
      />

      {/* ---- ticket counter ---- */}
      <div
        id="nc-station-counter"
        style={{
          position: "absolute",
          left: S.counter.x,
          top: S.counter.y,
          width: S.counter.w,
          height: S.counter.h,
          borderRadius: 3,
          background: "linear-gradient(180deg, #1a1630, #121020)",
          border: `1px solid ${dim}`,
          boxShadow: "inset 0 1px 10px rgba(0,0,0,.5)",
        }}
      >
        {/* three glazed windows; the middle one is the one you queue for */}
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            id={`nc-ticket-window-${i}`}
            style={{
              position: "absolute",
              left: 25 + i * 82,
              top: 8,
              width: 58,
              height: 22,
              borderRadius: 2,
              background: hueColor(HUE, 0.8, 0.12, i === 1 ? 0.24 : 0.12),
              border: `1px solid ${dim}`,
              boxShadow:
                i === 1
                  ? `0 0 12px ${hueColor(HUE, 0.85, 0.13, 0.35)}`
                  : "none",
            }}
          >
            {/* the speak-through grille */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                bottom: 4,
                width: 22,
                height: 5,
                marginLeft: -11,
                borderRadius: 2,
                backgroundImage: `repeating-linear-gradient(90deg, ${dim} 0 1px, transparent 1px 4px)`,
              }}
            />
          </div>
        ))}
      </div>

      {/* ---- rope line ---- */}
      {S.rails.map((r) => (
        <div
          key={r.id}
          id={`nc-station-${r.id}`}
          style={{
            position: "absolute",
            left: r.x,
            top: r.y,
            width: r.w,
            height: r.h,
            borderRadius: 3,
            background: hueColor(HUE, 0.85, 0.13, 0.32),
            boxShadow: `0 0 8px ${hueColor(HUE, 0.85, 0.13, 0.22)}`,
          }}
        />
      ))}
      {/* stanchion posts, spaced along each rope so it reads as posts-and-rope
          rather than a floating bar. Scenery — the rope itself is the collider. */}
      {S.rails.flatMap((r) => {
        const along = Math.max(r.w, r.h);
        const horizontal = r.w >= r.h;
        const n = Math.max(2, Math.round(along / 52));
        return Array.from({ length: n + 1 }, (_, i) => {
          const t = (along / n) * i;
          return (
            <div
              key={`${r.id}-post-${i}`}
              id={`nc-station-${r.id}-post-${i}`}
              style={{
                position: "absolute",
                left: (horizontal ? r.x + t : r.x + r.w / 2) - 4,
                top: (horizontal ? r.y + r.h / 2 : r.y + t) - 4,
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#0d0b18",
                border: `1px solid ${accent}`,
              }}
            />
          );
        });
      })}

      {/* ---- lobby seating ---- */}
      {S.benches.map((b) => (
        <div
          key={b.id}
          id={`nc-station-${b.id}`}
          style={{
            position: "absolute",
            left: b.x,
            top: b.y,
            width: b.w,
            height: b.h,
            borderRadius: 3,
            background: "#191428",
            border: "1px solid rgba(150,140,220,.28)",
            backgroundImage:
              b.w > b.h
                ? "repeating-linear-gradient(90deg, rgba(150,140,220,.14) 0 1px, transparent 1px 12px)"
                : "repeating-linear-gradient(180deg, rgba(150,140,220,.14) 0 1px, transparent 1px 12px)",
          }}
        />
      ))}

      {/* Greenery. Every entry in STATION.plants is drawn, so adding another is
          a one-line change in cityData. Swap an entry's w and h to stand a
          trough on its end. */}
      {S.plants.map((p) => {
        // A trough is anything clearly longer than it is deep, in EITHER
        // direction — so swapping w and h rotates the planter rather than
        // turning it into a single round pot.
        const long = Math.max(p.w, p.h) > Math.min(p.w, p.h) * 1.4;
        const vertical = p.h > p.w;
        const crowns = long ? [0.22, 0.5, 0.78] : [0.5];
        return (
          <div
            key={p.id}
            id={`nc-station-${p.id}`}
            style={{
              position: "absolute",
              left: p.x,
              top: p.y,
              width: p.w,
              height: p.h,
              borderRadius: long ? 4 : "3px 3px 50% 50%",
              background: "#241a15",
              border: "1px solid rgba(214,178,120,.35)",
            }}
          >
            {crowns.map((cx, ci) => (
              <div key={ci}>
                {/* fronds, seen from above */}
                {[0, 60, 120, 180, 240, 300].map((deg) => (
                  <div
                    key={deg}
                    style={{
                      position: "absolute",
                      left: vertical ? "50%" : `${cx * 100}%`,
                      top: vertical ? `${cx * 100}%` : "50%",
                      width: 11,
                      height: 5,
                      marginTop: -2.5,
                      borderRadius: 3,
                      transformOrigin: "0 50%",
                      transform: `rotate(${deg + ci * 18}deg)`,
                      background: "rgba(110,190,140,.5)",
                    }}
                  />
                ))}
                <div
                  id={`nc-station-${p.id}-crown-${ci}`}
                  style={{
                    position: "absolute",
                    left: vertical ? "50%" : `${cx * 100}%`,
                    top: vertical ? `${cx * 100}%` : "50%",
                    width: 10,
                    height: 10,
                    marginLeft: -5,
                    marginTop: -5,
                    borderRadius: "50%",
                    background:
                      "radial-gradient(circle at 40% 34%, #2a4a32, #12211a)",
                    border: "1px solid rgba(110,190,140,.45)",
                  }}
                />
              </div>
            ))}
          </div>
        );
      })}

      {/* departures board on the east wall */}
      <div
        id="nc-station-board"
        style={{
          position: "absolute",
          left: S.board.x,
          top: S.board.y,
          width: S.board.w,
          height: S.board.h,
          borderRadius: 2,
          background: "#0a0913",
          border: `1px solid ${dim}`,
          boxShadow: `0 0 12px ${hueColor(HUE, 0.85, 0.13, 0.2)}`,
          padding: 3,
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        {[0.7, 0.45, 0.3, 0.2].map((o, i) => (
          <div
            key={i}
            id={`nc-station-board-row-${i}`}
            style={{
              height: 3,
              borderRadius: 1,
              width: i === 0 ? "100%" : `${86 - i * 18}%`,
              background: hueColor(HUE, 0.85, 0.13, o),
            }}
          />
        ))}
      </div>

      {/* the mat, at the head of the line */}
      <div
        id="nc-pad-resume"
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
        id="nc-station-roof"
        className={roof.roof}
        data-open="0"
        style={{ left: S.x, top: S.y, width: S.w, height: S.h }}
      >
        {/* Rooftop kit kept in the city's own vocabulary — skylights and a
            plant room, same parts the other buildings use. The sign and the lit
            doorway already say this one opens; the roof does not need to. */}
        <div className={`${roof.half} ${roof.halfL}`}>
          <div
            id="nc-station-roof-skylight-0"
            className={roof.skylight}
            style={{ left: 28, top: 46, width: 54, height: 32 }}
          />
          <div
            id="nc-station-roof-hvac"
            className={roof.hvac}
            style={{ left: 30, top: 192, width: 36, height: 30 }}
          />
        </div>
        <div className={`${roof.half} ${roof.halfR}`}>
          <div
            id="nc-station-roof-skylight-1"
            className={roof.skylight}
            style={{ left: 42, top: 46, width: 54, height: 32 }}
          />
          <div
            id="nc-station-roof-vent"
            className={roof.vent}
            style={{ left: 58, top: 196, width: 22, height: 22 }}
          />
        </div>
        {/* name painted on the roof; fades out as the roof lifts */}
        <div
          id="nc-station-sign"
          className={roof.roofSign}
          style={{ fontFamily: "var(--font-mono), monospace" }}
        >
          <div
            id="nc-station-sign-name"
            style={{
              fontSize: 14,
              letterSpacing: ".3em",
              color: accent,
              textShadow: `0 0 16px ${accent}`,
              // the name is long enough to need two lines on this roof
              whiteSpace: "normal",
              maxWidth: S.w - 60,
              textAlign: "center",
              lineHeight: 1.4,
              marginRight: "-.3em",
              animation: "ncFlick 7.5s infinite",
            }}
          >
            {D.sign}
          </div>
          <div
            id="nc-station-sign-sub"
            style={{ fontSize: 10, letterSpacing: ".26em", color: dim }}
          >
            {D.sub}
          </div>
        </div>
      </div>
    </>
  );
}
