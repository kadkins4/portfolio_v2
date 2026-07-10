"use client";

import { useRef } from "react";
import { computeStick } from "@/lib/touchVector";
import styles from "./touchJoystick.module.css";

const RADIUS = 46; // px of max knob travel; matches .base size in CSS

export default function TouchJoystick({
  onVector,
  onStart,
}: {
  onVector: (v: { x: number; y: number; mag: number }) => void;
  onStart: () => void;
}) {
  const baseRef = useRef<HTMLDivElement | null>(null);
  const knobRef = useRef<HTMLDivElement | null>(null);
  const activeId = useRef<number | null>(null);
  const center = useRef({ x: 0, y: 0 });

  function moveKnob(dx: number, dy: number) {
    const d = Math.hypot(dx, dy);
    const clamped = d > RADIUS ? RADIUS / d : 1;
    if (knobRef.current) {
      knobRef.current.style.transform = `translate(${dx * clamped}px, ${dy * clamped}px)`;
    }
  }

  function onPointerDown(e: React.PointerEvent) {
    if (activeId.current !== null) return;
    activeId.current = e.pointerId;
    const rect = baseRef.current!.getBoundingClientRect();
    center.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    onStart();
    const dx = e.clientX - center.current.x;
    const dy = e.clientY - center.current.y;
    moveKnob(dx, dy);
    onVector(computeStick(dx, dy, RADIUS));
  }

  function onPointerMove(e: React.PointerEvent) {
    if (e.pointerId !== activeId.current) return;
    const dx = e.clientX - center.current.x;
    const dy = e.clientY - center.current.y;
    moveKnob(dx, dy);
    onVector(computeStick(dx, dy, RADIUS));
  }

  function onPointerUp(e: React.PointerEvent) {
    if (e.pointerId !== activeId.current) return;
    activeId.current = null;
    if (knobRef.current) knobRef.current.style.transform = "translate(0,0)";
    onVector({ x: 0, y: 0, mag: 0 });
  }

  return (
    <div
      ref={baseRef}
      data-hud
      className={styles.base}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      aria-hidden
    >
      <div ref={knobRef} className={styles.knob} />
    </div>
  );
}
