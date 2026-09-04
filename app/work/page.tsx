import type { Metadata } from "next";

import { IndexRow } from "@/app/components/ProjectRow";
import { projects } from "@/lib/data/projects";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Nine curated projects: a Docker deployment platform, a self-hosted mail stack, a media extraction API, a Zig key-value store, and Telegram infrastructure.",
  alternates: { canonical: "/work" },
};

const liveCount = projects.filter((project) => project.liveUrl).length;
const publicCount = projects.filter((project) => project.source === "public").length;

export default function WorkPage() {
  return (
    <section aria-labelledby="work-title" className="pt-8 sm:pt-12 pb-16">
      <div className="container">
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-1">
          <p className="mono text-xs font-semibold uppercase tracking-wider text-ink">Work</p>
          <p className="mono text-xs text-ink-faint">{projects.length} curated projects</p>
        </div>
        <div className="mt-3 rule" />

        <h1 id="work-title" className="text-2xl font-semibold text-ink mt-8 sm:text-3xl">
          Nine projects, selected from twenty-six.
        </h1>

        <p className="mt-4 text-sm leading-relaxed text-ink-muted measure">
          Every repository under nub-coders was audited. What is shown here are production services, developer
          tooling, and low-level prototypes built to understand the layer underneath. {liveCount} are running live on
          infrastructure I operate; {publicCount} are public open source.
        </p>

        <div className="mt-10">
          <div className="rule" />
          <div>
            {projects.map((project, i) => (
              <IndexRow key={project.slug} project={project} n={i + 1} />
            ))}
          </div>
          <div className="rule" />
        </div>
      </div>
    </section>
  );
}
