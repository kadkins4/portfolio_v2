import { HUES } from "@/lib/cityData";

/** The glowing accent dot next to a fast-travel destination. */
export default function HueDot({
  hue,
  className,
}: {
  hue: number;
  className?: string;
}) {
  return (
    <span
      className={className}
      style={{ background: HUES[hue], boxShadow: `0 0 6px ${HUES[hue]}` }}
    />
  );
}
