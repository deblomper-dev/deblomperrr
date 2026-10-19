import { principles } from "@/lib/data/site";
import "./story.css";

const [operatingPrinciple, ...supportingPrinciples] = principles;

export function Approach() {
  return (
    <section id="principles" aria-labelledby="approach-heading" className="section approach-section">
      <div className="container">
        <div className="approach-heading-row">
          <h2 id="approach-heading" className="story-heading reveal reveal-heading">
            Built with<br />a point of view.
          </h2>
          <p className="reveal">Some things matter long after the first deployment.</p>
        </div>
        <div className="approach-layout">
          <article className="principle-feature">
            <div className="approach-emblem" data-motion-reveal aria-hidden="true">
              <svg viewBox="0 0 200 200" fill="none">
                <path d="M100 16v168M16 100h168M41 41l118 118M41 159 159 41" stroke="currentColor" strokeWidth="33" />
                <circle cx="100" cy="100" r="24" />
              </svg>
            </div>
            <div className="reveal">
              <h3>{operatingPrinciple.label}</h3>
              <p>{operatingPrinciple.body}</p>
            </div>
          </article>
          <div className="principle-list">
            {supportingPrinciples.map(({ label, body }, index) => (
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
      </div>
    </section>
  );
}
