"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import HoloFrame from "@/components/holo/HoloFrame";
import NotFoundMessage from "@/components/NotFoundMessage";
import TypedReveal from "@/components/holo/TypedReveal";
import styles from "./not-found.module.css";

export default function NotFound() {
  const pathname = usePathname();
  return (
    <HoloFrame>
      <TypedReveal
        steps={[
          { kind: "command", text: `cd .${pathname}` },
          {
            kind: "line",
            text: "cd: no such file or directory",
            tone: "error",
          },
          {
            kind: "reveal",
            node: (
              <div className={styles.block}>
                <h1 className={styles.code} data-rise>
                  404
                </h1>
                <NotFoundMessage className={styles.message} data-rise />
                <Link href="/" className={styles.back} data-rise>
                  ← back to home
                </Link>
              </div>
            ),
          },
        ]}
      />
    </HoloFrame>
  );
}
