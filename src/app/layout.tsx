import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
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
    default: "Kendall Adkins — Senior Software Engineer",
    template: "%s | Kendall Adkins",
  },
  description:
    "Senior Software Engineer building performant, accessible, and visually refined interfaces for the modern web.",
  metadataBase: new URL("https://kendalladkins.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://kendalladkins.com",
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
      "application/rss+xml": "https://kendalladkins.com/feed.xml",
    },
  },
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Kendall Adkins",
  url: "https://kendalladkins.com",
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
      </body>
    </html>
  );
}
