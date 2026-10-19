import { about, site, stack } from "@/lib/data/site";
import "./story.css";

export function About() {
  return (
    <section id="about" aria-labelledby="about-heading" className="section about-section">
      <div className="container">
        <div className="about-layout">
          <div className="about-person">
            <h2 id="about-heading" className="story-heading reveal reveal-heading">
              The person<br />behind the code.
            </h2>
            <figure className="about-portrait reveal">
              {/* Static asset: this Vite runtime does not use the Next image optimizer. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/ankit-portrait.webp"
                alt="Pixel art portrait of Ankit Kumar"
                width={640}
                height={640}
                loading="lazy"
                decoding="async"
              />
              <figcaption>
                <span className="about-person-name">{site.name}</span>
                <span className="about-person-alias">On the internet as {site.alias}.</span>
              </figcaption>
            </figure>
          </div>
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
            <p className="about-since">Building in public since {site.publishingSince}.</p>
          </div>
        </div>
        <div className="about-stack">
          <h3 className="reveal">Tools I reach for.</h3>
          <dl className="stack-list">
            {stack.map(({ label, items }) => (
              <div key={label} className="stack-row reveal reveal-wipe">
                <dt>{label}</dt>
                <dd>
                  <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
