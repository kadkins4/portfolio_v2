import type { Metadata } from "next";
import { createReader } from "@keystatic/core/reader";
import config from "../../../keystatic.config";
import { SITE_TITLE, SITE_DESCRIPTION } from "@/lib/constants";
import Overwatch from "@/components/holo/Overwatch";

export const metadata: Metadata = {
  title: "Home",
  description: SITE_DESCRIPTION,
  openGraph: { title: SITE_TITLE, description: SITE_DESCRIPTION },
};

export default async function HomePage() {
  const reader = createReader(process.cwd(), config);
  const home = await reader.singletons.home.read();
  const name = home?.title ?? "Kendall Adkins";

  return (
    <Overwatch
      name={name}
      tagline={home?.tagline || undefined}
      intro={home?.intro || undefined}
    />
  );
}
