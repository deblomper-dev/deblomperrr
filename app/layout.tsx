import type { Metadata } from "next";
import { Bricolage_Grotesque, Manrope, JetBrains_Mono } from "next/font/google";

import { RevealObserver } from "./components/RevealObserver";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { site } from "@/lib/data/site";
import "./globals.css";
import "./motion.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const title = `${site.name} — Backend & Systems Infrastructure Engineer`;
const description =
  "Backend and systems engineer building container deployment engines, self-hosted mail infrastructure, high-throughput media extraction services, and in-memory key-value databases.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: title, template: `%s — ${site.name}` },
  description,
  applicationName: site.domain,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  keywords: [
    "Ankit Kumar",
    "deblomper-dev",
    "deblomperrr",
    "deblomperr",
    "Systems Engineer",
    "Backend Infrastructure",
    "TypeScript",
    "Python",
    "Zig",
    "C++",
    "Docker Engine API",
    "Self-hosted infrastructure",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: site.url,
    siteName: site.domain,
    title,
    description,
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/opengraph-image"],
  },
  robots: { index: true, follow: true },
};

// Apply the saved preference before paint; new visitors start in the dark palette.
const boot = `(function(){var d=document.documentElement;try{d.dataset.theme=localStorage.getItem("theme")==="light"?"light":"dark"}catch(e){d.dataset.theme="dark"}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${manrope.variable} ${bricolage.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body>
        <a
          href="#main"
          className="meta font-mono sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-3 focus-visible:left-3 focus-visible:z-[100] focus-visible:bg-surface focus-visible:px-3 focus-visible:py-2 focus-visible:border focus-visible:border-rule"
        >
          Skip to main content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <RevealObserver />
      </body>
    </html>
  );
}
