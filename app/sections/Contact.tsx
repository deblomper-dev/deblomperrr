import { ContactForm } from "@/app/components/ContactForm";
import { CopyButton } from "@/app/components/CopyButton";
import { SectionHeader } from "@/app/components/SectionHeader";
import { contactLinks, site } from "@/lib/data/site";

export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-heading" className="section pt-4 pb-16">
      <div className="container">
        <SectionHeader
          id="contact-heading"
          label="Contact & Connect"
          aside={site.openToWork ? "Open to opportunities" : undefined}
        />

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          {/* Left Column: Direct channels & statement */}
          <div className="reveal space-y-6">
            <div>
              <p className="text-xl font-semibold text-ink sm:text-2xl">
                Let&apos;s talk systems, backend services, or infrastructure.
              </p>
              <p className="mt-3 text-sm text-ink-muted leading-relaxed measure">
                Available for full-time roles, contract systems engineering, or collaborations on open-source tooling.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href={`mailto:${site.email}`}
                className="btn-press inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2.5 text-xs font-medium text-bone transition-opacity hover:opacity-90"
              >
                <span>Email me at {site.email}</span>
                <span aria-hidden="true" className="arrow">→</span>
              </a>
              <CopyButton text={site.email} label="Copy email" />
            </div>

            <div className="card-hover rounded-lg border border-rule bg-bone-2/20 p-5">
              <h3 className="mono text-xs font-semibold uppercase tracking-wider text-ink mb-3">
                Direct Channels
              </h3>
              <ul className="divide-y divide-rule">
                {contactLinks.map(({ label, value, href }) => (
                  <li key={label} className="py-2.5 first:pt-0 last:pb-0">
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="group flex items-center justify-between text-xs transition-colors hover:text-ink"
                    >
                      <span className="mono text-ink-faint">{label}</span>
                      <span className="mono font-medium text-ink inline-flex items-center gap-1 hover:underline">
                        {value}
                        <span aria-hidden="true" className="arrow">↗</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Interactive Contact Form */}
          <div className="reveal rounded-lg border border-rule bg-bone-2/20 p-6 sm:p-7">
            <div className="mb-5 flex items-center justify-between border-b border-rule pb-3">
              <div>
                <h3 className="mono text-xs font-semibold uppercase tracking-wider text-ink">
                  Send a Message
                </h3>
                <p className="mt-0.5 text-[11px] text-ink-muted">
                  Sends directly to inbox via authenticated SMTP
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 mono text-[11px] text-ink-faint">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Inbox
              </span>
            </div>
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
