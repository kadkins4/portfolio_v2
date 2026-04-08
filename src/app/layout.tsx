import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import JsonLd from "@/components/JsonLd";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Kendall Adkins — Software Engineer, Builder, and Yogi",
    template: "%s | Kendall Adkins",
  },
  description:
    "Software Engineer building performant, accessible, and visually refined web and mobile app experiences. Open to collaborations as a developer or project planner.",
  metadataBase: new URL("https://kendalladkins.dev"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://kendalladkins.dev",
    siteName: "Kendall Adkins",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@kendalladkins",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    types: {
      "application/rss+xml": "https://kendalladkins.dev/feed.xml",
    },
  },
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Kendall Adkins",
  url: "https://kendalladkins.dev",
  jobTitle: "Senior Software Engineer",
  sameAs: [
    "https://github.com/kendalladkins",
    "https://linkedin.com/in/kendalladkins",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body>
        <JsonLd data={personSchema} />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
