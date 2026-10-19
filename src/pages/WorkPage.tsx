import { ProjectCollection } from "@/app/components/ProjectCollection";
import { ProjectRows } from "@/app/components/ProjectRows";
import { projects } from "@/lib/data/projects";

const liveCount = projects.filter((project) => project.liveUrl).length;
const publicCount = projects.filter((project) => project.source === "public").length;

export function WorkPage() {
  return (
    <section aria-labelledby="work-title" className="work-index-page">
      <div className="container">
        <div className="work-index-intro">
          <h1 id="work-title">
            Things I&apos;ve<br />
            <span>put into the world.</span>
          </h1>
          <div className="work-index-intro-copy">
            <p>
              Deployment platforms, mail stacks, media services, and smaller tools that
              solve very specific problems.
            </p>
            <p className="work-index-counts">
              {projects.length} projects · {liveCount} live · {publicCount} open source
            </p>
          </div>
        </div>
      </div>
      <ProjectRows projects={projects.slice(0, 2)} label="Featured projects" />
      <div className="container">
        <div className="work-collection-heading">
          <h2>The full collection</h2>
          <p>Systems, experiments, and everything in between.</p>
        </div>
        <ProjectCollection projects={projects} />
      </div>
    </section>
  );
}

export default WorkPage;
