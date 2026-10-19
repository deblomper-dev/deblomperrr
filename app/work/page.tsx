import type { Metadata } from "next";

import { site } from "@/lib/data/site";

export { WorkPage as default } from "@/src/pages/WorkPage";

const title = "Systems & Architecture";
const description =
  "Curated infrastructure and backend projects: a Docker deployment platform, a self-hosted mail stack, media extraction APIs, and in-memory key-value engines.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/work" },
  openGraph: {
    type: "website",
    title: `${title} — ${site.name}`,
    description,
    url: "/work",
    siteName: site.domain,
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} — ${site.name}`,
    description,
    images: ["/opengraph-image"],
  },
};
