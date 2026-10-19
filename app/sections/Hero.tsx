import { SystemPlayground } from "@/app/components/SystemPlayground";
import { site } from "@/lib/data/site";
import "./hero.css";

export function Hero() {
  return (
    <section id="top" className="hero" aria-labelledby="hero-heading">
      <div className="container">
        <div className="hero-grid">
          <div className="hero-copy">
            <h1 id="hero-heading" className="hero-title">
              <span>Good systems.</span>
              <span>Built from the</span>
              <span className="hero-title-last">ground up<svg viewBox="0 0 26 26" aria-hidden="true"><circle cx="13" cy="13" r="12" fill="currentColor" /></svg></span>
            </h1>
            <div className="hero-identity">
              {/* This Vite build serves the pre-optimized local WebP directly. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="hero-portrait" src="/ankit-portrait-160.webp" alt="" width={160} height={160} decoding="async" />
              <div>
                <p className="hero-name">I’m {site.name}.</p>
                <p className="hero-role"><span>{site.role}</span><span className="hero-alias">/{site.alias}</span></p>
              </div>
            </div>
            <p className="hero-intro">I build deployment platforms, backend systems, and things that keep running.</p>
            <div className="hero-actions">
              <a href="#work-heading" className="primary-button">Explore my work <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14m-6-6 6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></a>
              <a href={`https://github.com/${site.handle}`} target="_blank" rel="noreferrer noopener" className="text-link">Find me on GitHub <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></a>
            </div>
            {site.openToWork ? <p className="availability"><span aria-hidden="true" />Open to good opportunities</p> : null}
          </div>
          <SystemPlayground />
        </div>
        <div className="hero-footnote">
          <span>Independent thinking. Hands-on engineering.</span>
          <span>Building at <a href={site.workAccount} target="_blank" rel="noreferrer noopener">nub-coders</a> since {site.publishingSince}</span>
        </div>
      </div>
    </section>
  );
}
