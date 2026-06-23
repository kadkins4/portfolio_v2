import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createReader } from "@keystatic/core/reader";
import config from "../../../../keystatic.config";
import HoloFrame from "@/components/holo/HoloFrame";
import HoloReveal from "@/components/holo/HoloReveal";
import { renderMarkdoc } from "@/lib/renderMarkdoc";
import page from "@/components/holo/holoPage.module.css";

export const metadata: Metadata = {
  title: "Outside the Code",
  description:
    "The human side — what Kendall Adkins gets up to away from the desk.",
};

// Interests literally named in content/about/outsideOfCode.mdoc.
const INTERESTS = [
  "bachata",
  "rollercoasters",
  "hot yoga",
  "beach volleyball",
  "video games",
  "board games",
  "D&D",
];

export default async function LifePage() {
  const reader = createReader(process.cwd(), config);
  const [home, about] = await Promise.all([
    reader.singletons.home.read(),
    reader.singletons.about.read(),
  ]);

  if (!about) notFound();

  const name = home?.title ?? "Kendall Adkins";
  const outsideOfCode = await about.outsideOfCode();

  return (
    <HoloFrame name={name}>
      <HoloReveal amber>
        <div className={`${page.head} ${page.rise}`}>
          <h1 className={page.title}>
            The <i>Human</i>
          </h1>
        </div>

        <div className={`${page.crumb} ${page.rise}`}>
          <span className={page.ps}>kendall@adkins:~$</span> cat life.md
          <span className={page.cur} aria-hidden="true" />
        </div>

        <p className={`${page.lede} ${page.rise}`}>
          There is a person behind the commits. Baltimore-raised, now in
          Southern California, with a list of things he chases once the laptop
          closes.
        </p>

        <section className={`${page.section} ${page.rise}`}>
          <div className={page.prose}>
            {outsideOfCode && renderMarkdoc(outsideOfCode)}
          </div>
        </section>

        <div className={`${page.chips} ${page.rise}`}>
          {INTERESTS.map((t) => (
            <span key={t} className={page.chip}>
              {t}
            </span>
          ))}
        </div>

        <div className={`${page.foot} ${page.rise}`}>
          &gt; end of life.md
          <span className={page.cur} aria-hidden="true" />
        </div>
      </HoloReveal>
    </HoloFrame>
  );
}
