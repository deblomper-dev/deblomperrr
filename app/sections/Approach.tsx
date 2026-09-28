import { principles } from "@/lib/data/site";
import "./story.css";

export function Approach() {
  return (
    <section id="principles" aria-labelledby="approach-heading" className="section approach-section">
      <div className="container approach-layout">
        <div className="approach-intro">
          <h2 id="approach-heading" className="story-heading reveal reveal-heading">
            Built with<br />a point of view.
          </h2>
          <p className="reveal">Some things matter long after the first deployment.</p>
          <div className="approach-emblem" data-motion-reveal aria-hidden="true">
            <svg viewBox="0 0 200 200" fill="none">
              <path d="M100 16v168M16 100h168M41 41l118 118M41 159 159 41" stroke="currentColor" strokeWidth="33" />
              <circle cx="100" cy="100" r="24" fill="#2947e8" />
            </svg>
          </div>
        </div>
        <div className="principle-list">
          {principles.map(({ label, body }, index) => (
            <article key={label} className="principle-item reveal reveal-horizontal">
              <span className={`principle-shape principle-shape-${index}`} aria-hidden="true" />
              <div>
                <h3>{label}</h3>
                <p>{body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
