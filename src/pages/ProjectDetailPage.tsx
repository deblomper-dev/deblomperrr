import { useParams, Link } from "react-router-dom";
import { host, ProjectArrow, ProjectArtwork, status } from "@/app/components/ProjectRow";
import { getProject, projects } from "@/lib/data/projects";
import { NotFoundPage } from "./NotFoundPage";

export function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const project = slug ? getProject(slug) : undefined;

  if (!project) {
    return <NotFoundPage />;
  }

  const at = projects.findIndex((entry) => entry.slug === project.slug);
  const previous = at > 0 ? projects[at - 1] : undefined;
  const next = at < projects.length - 1 ? projects[at + 1] : undefined;
  const { text, statusClass } = status(project);

  return (
    <article className="project-detail-page">
      <div className="container">
        <Link to="/work" className="project-back-link">
          <ProjectArrow direction="left" /> All projects
        </Link>

        <header className="project-detail-header">
          <div>
            <h1>{project.name}</h1>
            <p className="project-detail-summary">{project.summary}</p>
          </div>
          <div className="project-detail-facts">
            <span className="project-status">
              <span aria-hidden="true" className={statusClass} />
              {text}
            </span>
            <dl>
              <div>
                <dt>Project</dt>
                <dd>{project.kind}</dd>
              </div>
              <div>
                <dt>Language</dt>
                <dd>{project.lang}</dd>
              </div>
              <div>
                <dt>Started</dt>
                <dd>{project.since}</dd>
              </div>
            </dl>
          </div>
        </header>

        <div className="project-detail-actions">
          {project.liveUrl ? (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="project-primary-action"
            >
              Visit {host(project.liveUrl)} <ProjectArrow direction="external" />
            </a>
          ) : null}
          {project.codeUrl ? (
            <a
              href={project.codeUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="project-secondary-action"
            >
              Source on GitHub <ProjectArrow direction="external" />
            </a>
          ) : (
            <span className="project-private-note">The source for this project is private.</span>
          )}
        </div>

        <div className="project-detail-cover">
          <ProjectArtwork project={project} />
        </div>

        <div className="project-story-layout">
          <h2>The story</h2>
          <div className="project-story">
            {project.body.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>
        </div>

        <section aria-labelledby="architecture-heading" className="project-architecture">
          <div className="project-subsection-heading">
            <h2 id="architecture-heading">Under the hood</h2>
            <p>The decisions that make it work.</p>
          </div>
          <dl>
            {project.architecture.map(({ label, detail }) => (
              <div key={label} className="project-architecture-row">
                <dt>{label}</dt>
                <dd>{detail}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="stack-heading" className="project-stack">
          <h2 id="stack-heading">Built with</h2>
          <ul className="project-tag-list">
            {project.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        </section>

        <nav aria-label="Other projects" className="project-adjacent-nav">
          {previous ? (
            <Link to={`/work/${previous.slug}`} className="project-adjacent-link">
              <span>Previous project</span>
              <strong>
                <ProjectArrow direction="left" />
                {previous.name}
              </strong>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link to={`/work/${next.slug}`} className="project-adjacent-link project-adjacent-next">
              <span>Next project</span>
              <strong>
                {next.name}
                <ProjectArrow />
              </strong>
            </Link>
          ) : null}
        </nav>
      </div>
    </article>
  );
}

export default ProjectDetailPage;
