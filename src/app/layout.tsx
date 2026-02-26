import type { Metadata } from "next";
import { Syne, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${jetbrainsMono.variable}`}>
      <body>
        <a href="#main" className="skip-link">Skip to main content</a>
        <Nav />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
