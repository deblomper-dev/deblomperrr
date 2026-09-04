import { About } from "./sections/About";
import { Approach } from "./sections/Approach";
import { Contact } from "./sections/Contact";
import { Hero } from "./sections/Hero";
import { SelectedWork } from "./sections/SelectedWork";
import { projects } from "@/lib/data/projects";
import { site } from "@/lib/data/site";

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  alternateName: site.handle,
  url: site.url,
  email: `mailto:${site.email}`,
  jobTitle: site.role,
  description: site.bio,
  worksFor: { "@type": "Organization", name: "Nub Coders", url: "https://nubcoders.com" },
  knowsAbout: ["TypeScript", "Python", "Zig", "C++", "Docker", "PostgreSQL", "Self-hosted infrastructure"],
  sameAs: [`https://github.com/${site.handle}`, site.workAccount, "https://t.me/nub_coder_s"],
  subjectOf: projects
    .filter((project) => project.liveUrl ?? project.codeUrl)
    .map((project) => ({
      "@type": "SoftwareSourceCode",
      name: project.name,
      description: project.summary,
      programmingLanguage: project.lang,
      url: project.liveUrl ?? project.codeUrl,
    })),
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personSchema).replace(/</g, "\\u003c"),
        }}
      />
      <Hero />
      <SelectedWork />
      <Approach />
      <About />
      <Contact />
    </>
  );
}
