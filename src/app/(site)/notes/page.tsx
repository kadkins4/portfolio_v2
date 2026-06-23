import type { Metadata } from "next";
import { createReader } from "@keystatic/core/reader";
import config from "../../../../keystatic.config";
import HoloFrame from "@/components/holo/HoloFrame";
import HoloReveal from "@/components/holo/HoloReveal";
import FieldNotes, { type NoteItem } from "@/components/holo/FieldNotes";

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
      <HoloReveal wide>
        <FieldNotes name={name} items={items} />
      </HoloReveal>
    </HoloFrame>
  );
}
