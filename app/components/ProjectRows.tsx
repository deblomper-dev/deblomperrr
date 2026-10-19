import type { Project } from "@/lib/data/types";
import { ProjectTile } from "./ProjectRow";
import "./project-rows.css";

export function ProjectRows({ projects, label }: { projects: readonly Project[]; label: string }) {
  const rows = Array.from({ length: Math.ceil(projects.length / 2) }, (_, index) => projects.slice(index * 2, index * 2 + 2));

  return (
    <div className="project-rows" role="group" aria-label={label}>
      {rows.map((row) => (
        <div key={row[0].slug} className="project-row-band">
          <div className="container project-grid">
            {row.map((project) => (
              <div key={project.slug} className="project-row-cell">
                <div className="reveal"><ProjectTile project={project} /></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
