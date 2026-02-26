import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Kendall Adkins.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
