import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createReader } from "@keystatic/core/reader";
import config from "../../../../keystatic.config";
import HoloFrame from "@/components/holo/HoloFrame";
import TypedReveal from "@/components/holo/TypedReveal";
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
      <TypedReveal
        amber
        name={name}
        backHref="/"
        backLabel="back to home"
        head={
          <div className={page.head}>
            <h1 className={page.title}>
              The <i>Human</i>
            </h1>
          </div>
        }
        steps={[
          { kind: "command", text: "cat life.md" },
          {
            kind: "reveal",
            node: (
              <>
                <p className={page.lede} data-rise>
                  There is a person behind the commits. Baltimore-raised, now in
                  Southern California, with a list of things he chases once the
                  laptop closes.
                </p>

                <section className={page.section} data-rise>
                  <div className={page.prose}>
                    {outsideOfCode && renderMarkdoc(outsideOfCode)}
                  </div>
                </section>

                <div className={page.chips} data-rise>
                  {INTERESTS.map((t) => (
                    <span key={t} className={page.chip}>
                      {t}
                    </span>
                  ))}
                </div>

                <div className={page.foot} data-rise>
                  &gt; end of life.md
                  <span className={page.cur} aria-hidden="true" />
                </div>
              </>
            ),
          },
        ]}
      />
    </HoloFrame>
  );
}
