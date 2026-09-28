import { ContactForm } from "@/app/components/ContactForm";
import { CopyButton } from "@/app/components/CopyButton";
import { contactLinks, site } from "@/lib/data/site";
import "./story.css";

export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-heading" className="section contact-section">
      <div className="container contact-layout">
        <div className="contact-intro">
          <h2 id="contact-heading" className="story-heading reveal reveal-heading">
            Have something<br />in mind?
          </h2>
          <p className="contact-description reveal">
            Let’s talk systems, infrastructure, or what you’re building next. Available for
            full-time backend roles, contract systems engineering, and collaborations on
            operations tooling.
          </p>
          {site.openToWork ? (
            <p className="contact-availability"><span aria-hidden="true" />Open to new opportunities</p>
          ) : null}
          <div className="contact-email reveal">
            <a href={`mailto:${site.email}`}>{site.email}</a>
            <CopyButton text={site.email} label="Copy email" className="contact-copy" />
          </div>
          <ul className="contact-channels" aria-label="Find me online">
            {contactLinks.filter(({ label }) => label !== "Email").map(({ label, value, href }) => (
              <li key={label} className="reveal">
                <a href={href} target="_blank" rel="noreferrer noopener">
                  <span>{label}</span>
                  <span className="contact-channel-value">{value}</span>
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.75" />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="contact-form-panel reveal">
          <h3>Drop me a note.</h3>
          <p className="contact-form-intro">A question, an idea, or a simple hello.</p>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
