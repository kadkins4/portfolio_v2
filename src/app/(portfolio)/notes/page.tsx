import type { Metadata } from "next";
import { createReader } from "@keystatic/core/reader";
import config from "../../../../keystatic.config";
import NoteCard from "@/components/NoteCard";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Notes",
  description:
    "Notes and writing by Kendall Adkins — software engineering, developer tools, and things worth writing down.",
  alternates: { canonical: "/notes" },
  openGraph: {
    title: "Notes — Kendall Adkins",
    description: "Notes and writing by Kendall Adkins.",
  },
};

export default async function NotesPage() {
  const reader = createReader(process.cwd(), config);
  const notes = await reader.collections.notes.all();

  const sorted = [...notes].sort((a, b) =>
    (b.entry.date ?? "").localeCompare(a.entry.date ?? "")
  );

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Notes</h1>
      <p className={styles.subtitle}>
        Software engineering, developer tools, and things worth writing down.
      </p>
      <div className={styles.grid}>
        {sorted.map((note) => (
          <NoteCard
            key={note.slug}
            slug={note.slug}
            title={note.entry.title}
            summary={note.entry.summary}
            tags={[...(note.entry.tags ?? [])]}
            date={note.entry.date ?? null}
            image={note.entry.image ?? null}
          />
        ))}
      </div>
    </div>
  );
}
