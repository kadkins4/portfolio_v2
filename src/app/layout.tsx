import type { Metadata } from "next";
import { Syne, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import JsonLd from "@/components/JsonLd";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Kendall Adkins — Senior Front End Engineer",
    template: "%s | Kendall Adkins",
  },
  description:
    "Senior Front End Engineer crafting performant, accessible, and visually refined interfaces for the modern web.",
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
  jobTitle: "Senior Front End Engineer",
  sameAs: [
    "https://github.com/kendalladkins",
    "https://linkedin.com/in/kendalladkins",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${jetbrainsMono.variable}`}>
      <body>
        <JsonLd data={personSchema} />
        {children}
      </body>
    </html>
  );
}
