"use client";

import { useState } from "react";
import { IndexRow } from "./ProjectRow";
import type { Project } from "@/lib/data/types";
import "./project-collection.css";

const filters = [
  { id: "all", label: "All projects" },
  { id: "live", label: "Live apps" },
  { id: "source", label: "Open source" },
] as const;

type Filter = (typeof filters)[number]["id"];

function matches(project: Project, filter: Filter) {
  return filter === "all" || (filter === "live" ? Boolean(project.liveUrl) : project.source === "public");
}

export function ProjectCollection({ projects }: { projects: readonly Project[] }) {
  const [activeFilter, setActiveFilter] = useState<Filter>("all");
  const visibleProjects = projects.filter((project) => matches(project, activeFilter));

  return (
    <>
      <div className="project-filters" role="group" aria-label="Filter the project collection">
        {filters.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            aria-pressed={activeFilter === id}
            aria-controls="project-collection-results"
            onClick={() => setActiveFilter(id)}
          >
            {label}<span>{projects.filter((project) => matches(project, id)).length}</span>
          </button>
        ))}
      </div>
      <p className="sr-only" role="status">
        Showing {visibleProjects.length} {activeFilter === "live" ? "live" : activeFilter === "source" ? "open-source" : "total"} projects.
      </p>
      <div id="project-collection-results" className="project-index-list">
        {visibleProjects.map((project) => <IndexRow key={project.slug} project={project} />)}
      </div>
    </>
  );
}
