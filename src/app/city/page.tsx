import type { Metadata } from "next";
import { createReader } from "@keystatic/core/reader";
import config from "../../../keystatic.config";
import NeonCity from "@/components/holo/NeonCity";

export const metadata: Metadata = {
  title: "Neon City",
  description:
    "Walk the neon city, a top-down overworld linking Kendall Adkins' projects, resume, and about.",
  alternates: { canonical: "/city" },
};

export default async function CityPage() {
  const reader = createReader(process.cwd(), config);
  const home = await reader.singletons.home.read();
  return <NeonCity name={home?.title ?? "Kendall Adkins"} />;
}
