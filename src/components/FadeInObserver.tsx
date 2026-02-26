"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function FadeInObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const els = document.querySelectorAll(".fade-in");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("visible");
      }),
      { threshold: 0.1 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [pathname]);
  return null;
}
