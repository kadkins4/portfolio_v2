import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createReader } from "@keystatic/core/reader";
import config from "../../../../keystatic.config";
import HoloFrame from "@/components/holo/HoloFrame";
import HoloReveal from "@/components/holo/HoloReveal";
import { renderMarkdoc } from "@/lib/renderMarkdoc";
import page from "@/components/holo/holoPage.module.css";
import story from "./story.module.css";

export const metadata: Metadata = {
  title: "The Story",
  description:
    "From managing teams to senior engineering — the professional arc of Kendall Adkins.",
};

export default async function StoryPage() {
  const reader = createReader(process.cwd(), config);
  const [home, about] = await Promise.all([
    reader.singletons.home.read(),
    reader.singletons.about.read(),
  ]);

  if (!about) notFound();

  const name = home?.title ?? "Kendall Adkins";
  const whatIDo = await about.whatIDo();
  const howIGotHere = await about.howIGotHere();

  return (
    <HoloFrame name={name}>
      <HoloReveal
        command="cat story.md"
        name={name}
        head={
          <div className={`${page.head} ${story.titleRow}`}>
            <Image
              src="/images/kendall-adkins.jpeg"
              alt="Portrait of Kendall Adkins"
              width={92}
              height={92}
              className={story.portrait}
              priority
            />
            <h1 className={page.title}>
              The <i>Story</i>
            </h1>
          </div>
        }
      >
        <p className={`${page.lede} ${page.rise}`}>
          A decade-long arc from leading teams to senior engineering. He spent
          years in management, taught himself to code, and now ships fast,
          polished web experiences while still mentoring the people around him.
        </p>

        <section className={`${page.section} ${page.rise}`}>
          <div className={page.sectionLabel}>~/ WHAT I DO</div>
          <div className={page.prose}>{whatIDo && renderMarkdoc(whatIDo)}</div>
        </section>

        <section className={`${page.section} ${page.rise}`}>
          <div className={page.sectionLabel}>~/ HOW I GOT HERE</div>
          <div className={page.prose}>
            {howIGotHere && renderMarkdoc(howIGotHere)}
          </div>
        </section>

        <div className={`${story.ctaRow} ${page.rise}`}>
          <a href="/kendall-adkins-resume.pdf" download className={page.cta}>
            ↓ download resume.pdf
          </a>
        </div>

        <div className={`${page.foot} ${page.rise}`}>
          &gt; end of story.md
          <span className={page.cur} aria-hidden="true" />
        </div>
      </HoloReveal>
    </HoloFrame>
  );
}
