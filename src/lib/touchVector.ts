/**
 * Convert a joystick touch offset into a movement vector.
 * dx/dy: touch position relative to the stick base center (screen pixels, +y down).
 * radius: max stick travel. Output components are the unit direction times the
 * clamped magnitude, so each is in [-1, 1]; mag is in [0, 1].
 */
export function computeStick(
  dx: number,
  dy: number,
  radius: number
): { x: number; y: number; mag: number } {
  const dist = Math.hypot(dx, dy);
  if (dist === 0 || radius <= 0) return { x: 0, y: 0, mag: 0 };
  const mag = Math.min(1, dist / radius);
  return { x: (dx / dist) * mag, y: (dy / dist) * mag, mag };
}
