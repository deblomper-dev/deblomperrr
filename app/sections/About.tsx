import { about, site, stack } from "@/lib/data/site";
import "./story.css";

export function About() {
  return (
    <section id="about" aria-labelledby="about-heading" className="section about-section">
      <div className="container">
        <div className="about-heading-row reveal reveal-heading">
          <h2 id="about-heading" className="story-heading">
            A little more<br />behind the code.
          </h2>
          <p className="about-since">Building in public since {site.publishingSince}.</p>
        </div>
        <div className="about-layout">
          <div className="about-narrative">
            {about.map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className="reveal">{paragraph}</p>
            ))}
            <a href={site.workAccount} target="_blank" rel="noreferrer noopener" className="story-link">
              Explore nub-coders
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.75" />
              </svg>
            </a>
          </div>
          <div className="about-stack">
            <h3>My working toolkit</h3>
            <dl className="stack-list">
              {stack.map(({ label, items }) => (
                <div key={label} className="stack-row reveal reveal-wipe">
                  <dt>{label}</dt>
                  <dd>{items.join(" · ")}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
