import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createReader } from "@keystatic/core/reader";
import config from "../../../../keystatic.config";
import HoloFrame from "@/components/holo/HoloFrame";
import CareerLog from "@/components/holo/CareerLog";

export const metadata: Metadata = {
  title: "Career Log",
  description:
    "An interactive, terminal-style résumé — a decade of engineering, in order.",
};

export default async function ResumePage() {
  const reader = createReader(process.cwd(), config);
  const [home, resume] = await Promise.all([
    reader.singletons.home.read(),
    reader.singletons.resume.read(),
  ]);

  if (!resume) notFound();

  return (
    <HoloFrame name={home?.title ?? "Kendall Adkins"}>
      <CareerLog
        data={{
          name: home?.title ?? "Kendall Adkins",
          summary: resume.summary,
          resumePdf: resume.resumePdf || "/kendall-adkins-resume.pdf",
          experience: resume.experience.map((e) => ({
            org: e.org,
            role: e.role,
            period: e.period,
            detail: e.detail,
            highlights: [...e.highlights],
            tech: [...e.tech],
          })),
          earlier: resume.earlier.map((e) => ({
            org: e.org,
            role: e.role,
            period: e.period,
            detail: e.detail,
          })),
          education: resume.education.map((e) => ({
            school: e.school,
            credential: e.credential,
            year: e.year,
          })),
        }}
      />
    </HoloFrame>
  );
}
