import Link from "next/link";

import { SectionHeader } from "@/app/components/SectionHeader";
import { FeatureRow } from "@/app/components/ProjectRow";
import { featuredProjects, projects } from "@/lib/data/projects";

export function SelectedWork() {
  return (
    <section id="work-heading" aria-labelledby="work-label" className="section pt-4">
      <div className="container">
        <SectionHeader
          id="work-label"
          label="Featured Projects"
          aside={`${featuredProjects.length} of ${projects.length} curated`}
        />

        <div>
          {featuredProjects.map((project) => (
            <FeatureRow key={project.slug} project={project} />
          ))}
        </div>

        <div className="rule" />
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/work"
            className="mono text-xs font-medium text-ink underline underline-offset-4 decoration-rule-strong hover:decoration-ink inline-flex items-center gap-1.5"
          >
            <span>View all {projects.length} projects</span>
            <span aria-hidden="true">→</span>
          </Link>
          <span className="mono text-xs text-ink-faint">
            TypeScript · Python · Zig · C++20 · Docker
          </span>
        </div>
      </div>
    </section>
  );
}
