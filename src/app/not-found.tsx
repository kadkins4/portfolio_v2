import Link from "next/link";
import HoloFrame from "@/components/holo/HoloFrame";
import NotFoundMessage from "@/components/NotFoundMessage";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <HoloFrame>
      <main className={styles.wrap}>
        <div className={styles.crumb}>
          <span className={styles.ps}>kendall@adkins</span>:~$ cd ./missing-page
        </div>
        <p className={styles.err}>cd: no such file or directory</p>
        <h1 className={styles.code}>404</h1>
        <NotFoundMessage className={styles.message} />
        <Link href="/" className={styles.back}>
          → cd ~/home
        </Link>
      </main>
    </HoloFrame>
  );
}
