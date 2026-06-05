import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NotFoundMessage from "@/components/NotFoundMessage";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <div className={styles.wrapper}>
      <Header />
      <main className={styles.container}>
        <Image
          src="/images/404-illustration.svg"
          alt=""
          width={280}
          height={200}
          className={styles.illustration}
          priority
        />
        <h1 className={styles.heading}>404</h1>
        <NotFoundMessage className={styles.message} />
        <Link href="/" className={styles.backLink}>
          Back to Home
        </Link>
      </main>
      <Footer />
    </div>
  );
}
