import { useEffect, useState } from "react";

/** True on touch-capable / coarse-pointer devices. SSR-safe: false until mount. */
export function useIsTouch(): boolean {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    const coarse =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(pointer: coarse)").matches;
    const touch = navigator.maxTouchPoints > 0;
    setIsTouch(coarse || touch);
  }, []);
  return isTouch;
}
