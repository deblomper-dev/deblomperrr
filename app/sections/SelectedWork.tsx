import Link from "next/link";

import { ProjectArrow } from "@/app/components/ProjectRow";
import { ProjectRows } from "@/app/components/ProjectRows";
import { featuredProjects, projects } from "@/lib/data/projects";

export function SelectedWork() {
  return (
    <section id="work-heading" aria-labelledby="work-label" className="section selected-work">
      <div className="container">
        <div className="work-section-heading reveal">
          <h2 id="work-label">Selected work<span className="work-heading-dot">.</span></h2>
          <p>Ideas turned into tools.<br />Built, shipped, and kept running.</p>
        </div>
      </div>
      <ProjectRows projects={featuredProjects} label="Selected projects" />
      <div className="container">
        <div className="work-section-footer">
          <p>A few things I&apos;ve made. There&apos;s more in the collection.</p>
          <Link href="/work" className="work-all-link">
            All {projects.length} projects <ProjectArrow />
          </Link>
        </div>
      </div>
    </section>
  );
}
