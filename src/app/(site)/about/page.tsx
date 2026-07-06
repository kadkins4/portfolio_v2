import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createReader } from "@keystatic/core/reader";
import config from "../../../../keystatic.config";
import { renderMarkdoc } from "@/lib/renderMarkdoc";
import AboutResidence from "@/components/holo/AboutResidence";
import { toSocialLinks } from "@/lib/socialLinks";

export const metadata: Metadata = {
  title: "About",
  description:
    "Unit 4B, the human behind the code. Kendall Adkins: management to engineering, Baltimore to the coast.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const reader = createReader(process.cwd(), config);
  const [home, about, settings] = await Promise.all([
    reader.singletons.home.read(),
    reader.singletons.about.read(),
    reader.singletons.siteSettings.read(),
  ]);

  if (!about) notFound();

  const name = home?.title ?? "Kendall Adkins";
  const whatIDo = await about.whatIDo();
  const howIGotHere = await about.howIGotHere();

  const socials = toSocialLinks(settings);

  return (
    <AboutResidence
      name={name}
      portrait="/images/kendall-adkins.jpeg"
      socials={socials}
      story={
        <>
          {whatIDo && renderMarkdoc(whatIDo)}
          {howIGotHere && renderMarkdoc(howIGotHere)}
        </>
      }
    />
  );
}
