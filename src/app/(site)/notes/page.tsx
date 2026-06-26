import type { Metadata } from "next";
import { createReader } from "@keystatic/core/reader";
import config from "../../../../keystatic.config";
import HoloFrame from "@/components/holo/HoloFrame";
import TypedReveal from "@/components/holo/TypedReveal";
import FieldNotes, { type NoteItem } from "@/components/holo/FieldNotes";
import page from "@/components/holo/holoPage.module.css";

export const metadata: Metadata = {
  title: "Field Notes",
  description:
    "Field notes by Kendall Adkins — essays and the occasional reference, short and honest.",
  alternates: { canonical: "/notes" },
  openGraph: {
    title: "Field Notes — Kendall Adkins",
    description: "Essays and the occasional reference, short and honest.",
  },
};

export default async function NotesPage() {
  const reader = createReader(process.cwd(), config);
  const [home, notes] = await Promise.all([
    reader.singletons.home.read(),
    reader.collections.notes.all(),
  ]);

  const sorted = [...notes].sort((a, b) => {
    const af = a.entry.featured ? 1 : 0;
    const bf = b.entry.featured ? 1 : 0;
    if (af !== bf) return bf - af;
    return (b.entry.date ?? "").localeCompare(a.entry.date ?? "");
  });

  const items: NoteItem[] = sorted.map((note) => ({
    slug: note.slug,
    title: note.entry.title,
    summary: note.entry.summary,
    tags: [...(note.entry.tags ?? [])],
    side: note.entry.side === "life" ? "life" : "craft",
    date: note.entry.date ?? null,
  }));

  const name = home?.title ?? "Kendall Adkins";

  return (
    <HoloFrame name={name}>
      <TypedReveal
        wide
        name={name}
        head={
          <div className={page.head}>
            <h1 className={page.title}>
              Field <i>Notes</i>
            </h1>
            <span className={page.entries}>
              <span className={page.dot} aria-hidden="true" />
              {items.length} PUBLISHED
            </span>
          </div>
        }
        steps={[
          { kind: "command", text: "ls notes/" },
          { kind: "reveal", node: <FieldNotes items={items} /> },
        ]}
      />
    </HoloFrame>
  );
}
