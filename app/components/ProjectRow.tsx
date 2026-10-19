import Link from "next/link";
import type { CSSProperties } from "react";
import type { Project } from "@/lib/data/types";
import { ProjectCardPreview } from "./ProjectCardPreview";
import { ProjectCardDepth } from "./ProjectCardDepth";

import "./projects.css";
import "./project-cards.css";

export function status(project: Project) {
  if (project.liveUrl) return { text: "Available live", live: true, statusClass: "dot" };
  if (project.source === "public") return { text: "Open source", live: false, statusClass: "dot dot-amber" };
  return { text: "Private source", live: false, statusClass: "dot dot-idle" };
}

export function host(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export function ProjectArrow({ direction = "right" }: { direction?: "right" | "left" | "external" }) {
  return (
    <svg className={`project-arrow project-arrow--${direction}`} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Envelope() {
  return (
    <svg viewBox="0 0 240 160" fill="none">
      <rect x="1" y="1" width="238" height="158" rx="12" fill="currentColor" />
      <path d="m7 9 113 85L233 9M7 151l75-63m151 63-75-63" stroke="var(--envelope-fold)" strokeWidth="2" />
    </svg>
  );
}

/** Abstract covers illustrate each project's purpose without inventing product screens. */
export function ProjectArtwork({ project }: { project: Project }) {
  const kind = project.featured ? project.slug : "other";

  return (
    <div className={`project-artwork project-artwork--${kind}`} data-motion-reveal aria-hidden="true">
      {kind === "halvo" ? (
        <div className="project-artwork-geometry deployment-art">
          <svg viewBox="0 0 600 300" fill="none">
            <path d="M70 222h108V98h116v110h122V76h114" stroke="#969bc5" strokeWidth="2" />
            <circle cx="70" cy="222" r="6" fill="#202331" />
            <circle cx="530" cy="76" r="6" fill="#2947e8" />
          </svg>
          <span className="deployment-stage deployment-stage-one"><svg viewBox="0 0 600 300" fill="none">
            <rect x="151" y="153" width="116" height="116" rx="16" fill="#202331" />
            <path d="M182 187h20v20h-20zm33 0h20v20h-20zm-33 33h20v20h-20zm33 0h20v20h-20z" fill="#dedff3" />
          </svg></span>
          <span className="deployment-stage deployment-stage-two"><svg viewBox="0 0 600 300" fill="none">
            <rect x="242" y="94" width="116" height="116" rx="16" fill="#f7f7f2" />
            <path d="m284 133-18 19 18 19m32-38 18 19-18 19" stroke="#2947e8" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          </svg></span>
          <span className="deployment-stage deployment-stage-three"><svg viewBox="0 0 600 300" fill="none">
            <rect x="333" y="35" width="116" height="116" rx="16" fill="#2947e8" />
            <path d="M391 119V69m-21 20 21-21 21 21" stroke="#f7f7f2" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          </svg></span>
        </div>
      ) : kind === "nubmail" ? (
        <div className="mail-art">
          <div className="mail-envelope mail-envelope--back"><span className="mail-envelope-art"><Envelope /></span></div>
          <div className="mail-envelope mail-envelope--middle"><span className="mail-envelope-art"><Envelope /></span></div>
          <div className="mail-envelope mail-envelope--front"><span className="mail-envelope-art"><Envelope /></span></div>
        </div>
      ) : kind === "ytube-api" ? (
        <div className="project-artwork-geometry stream-art">
          <span className="stream-art-reveal">
          <svg viewBox="0 0 600 300" fill="none">
            <path d="M-45 70h155c84 0 84 160 168 160h367" stroke="#dc8869" strokeWidth="24" />
            <path d="M-45 112h155c84 0 84 76 168 76h367" stroke="#202331" strokeWidth="24" />
            <path d="M-45 154h155c84 0 84-8 168-8h367" stroke="#f7f7f2" strokeWidth="24" />
            <path d="M-45 196h155c84 0 84-92 168-92h367" stroke="#2947e8" strokeWidth="24" />
            <circle cx="362" cy="150" r="64" fill="#f7f7f2" />
            <path d="m348 121 42 29-42 29v-58Z" fill="#202331" />
          </svg>
          </span>
        </div>
      ) : kind === "nub-music-bot" ? (
        <div className="music-art">
          {[42, 80, 126, 174, 110, 66, 150, 202, 146, 96, 58, 28].map((height, index) => (
            <span key={index} className="music-bar" style={{ height, "--bar-index": index } as CSSProperties} />
          ))}
        </div>
      ) : (
        <div className="project-artwork-geometry tools-art">
          <svg viewBox="0 0 600 300" fill="none">
            <rect x="166" y="50" width="190" height="190" rx="20" fill="#2947e8" />
            <circle cx="371" cy="161" r="85" fill="#dcebb8" />
            <path d="m230 111-38 39 38 39m51-78 38 39-38 39" stroke="#f7f7f2" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M343 161h56m-28-28v56" stroke="#202331" strokeWidth="6" strokeLinecap="round" />
          </svg>
        </div>
      )}
    </div>
  );
}

function ProjectLinks({ project }: { project: Project }) {
  return (
    <div className="project-links">
      <Link href={`/work/${project.slug}`} className="project-detail-link">
        Explore project <ProjectArrow />
      </Link>
      <div className="project-external-links">
        {project.liveUrl ? (
          <a href={project.liveUrl} target="_blank" rel="noreferrer noopener" aria-label={`Visit ${project.name} live site`}>
            Live <ProjectArrow direction="external" />
          </a>
        ) : null}
        {project.codeUrl ? (
          <a href={project.codeUrl} target="_blank" rel="noreferrer noopener" aria-label={`View ${project.name} source code`}>
            Source <ProjectArrow direction="external" />
          </a>
        ) : null}
      </div>
    </div>
  );
}

export function ProjectTile({ project }: { project: Project }) {
  const { text, statusClass } = status(project);

  return (
    <ProjectCardDepth>
      <Link href={`/work/${project.slug}`} className="project-card-cover" aria-label={`Explore ${project.name}`}>
        <ProjectCardPreview project={project} />
      </Link>
      <div className="project-card-content">
        <div className="project-card-meta">
          <span>{project.kind}</span>
          <span className="project-card-status"><span aria-hidden="true" className={statusClass} />{text}</span>
        </div>
        <h3 className="project-card-title"><Link href={`/work/${project.slug}`}>{project.name}</Link></h3>
        <p className="project-card-description">{project.summary}</p>
        <ul className="project-card-tags" aria-label={`${project.name} technologies`}>
          {project.tags.map((tag) => <li key={tag}>{tag}</li>)}
        </ul>
        <div className="project-card-actions">
          <Link href={`/work/${project.slug}`} className="project-card-primary" aria-label={`Explore ${project.name} project`}>
            Explore project <span className="project-card-action-icon"><ProjectArrow /></span>
          </Link>
          {project.liveUrl ? (
            <a href={project.liveUrl} target="_blank" rel="noreferrer noopener" aria-label={`Visit ${project.name} live site`}>
              Live app <ProjectArrow direction="external" />
            </a>
          ) : null}
          {project.codeUrl ? (
            <a href={project.codeUrl} target="_blank" rel="noreferrer noopener" aria-label={`View ${project.name} source code`}>
              Source <ProjectArrow direction="external" />
            </a>
          ) : null}
        </div>
      </div>
    </ProjectCardDepth>
  );
}

export function SystemArtifactRow({ project }: { project: Project }) {
  return <ProjectTile project={project} />;
}

export function CompactLogItem({ project }: { project: Project }) {
  return <ProjectTile project={project} />;
}

export function IndexRow({ project }: { project: Project; n?: number }) {
  const { text, statusClass } = status(project);

  return (
    <article className="project-index-row">
      <div className="project-index-main">
        <div className="project-title-row">
          <h2><Link href={`/work/${project.slug}`}>{project.name} <ProjectArrow /></Link></h2>
          <span>{project.kind}</span>
        </div>
        <p className="project-summary">{project.summary}</p>
        <ul className="project-tag-list" aria-label={`${project.name} technologies`}>
          {project.tags.map((tag) => <li key={tag}>{tag}</li>)}
        </ul>
      </div>
      <div className="project-index-aside">
        <span className="project-status"><span aria-hidden="true" className={statusClass} />{text}</span>
        <span className="project-since">Started {project.since}</span>
        <ProjectLinks project={project} />
      </div>
    </article>
  );
}
