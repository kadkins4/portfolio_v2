import { createReader } from "@keystatic/core/reader";
import config from "../../../../keystatic.config";
import WorkCard from "@/components/WorkCard";
import styles from "./page.module.css";

export default async function WorkPage() {
  const reader = createReader(process.cwd(), config);
  const workItems = await reader.collections.work.all();

  const sortedItems = workItems.sort((a, b) => {
    const dateA = a.entry.date ? new Date(a.entry.date).getTime() : 0;
    const dateB = b.entry.date ? new Date(b.entry.date).getTime() : 0;
    return dateB - dateA;
  });

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Projects, Hobbies, and Writing</h1>
      <div className={styles.grid}>
        {sortedItems.map((item) => (
          <WorkCard
            key={item.slug}
            slug={item.slug}
            title={item.entry.title}
            description={item.entry.description}
            type={item.entry.type}
            image={item.entry.image ?? null}
            externalUrl={item.entry.externalUrl ?? null}
          />
        ))}
      </div>
    </div>
  );
}
