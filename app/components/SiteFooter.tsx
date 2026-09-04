import { contactLinks, site } from "@/lib/data/site";

const year = new Date().getFullYear();

export function SiteFooter() {
  return (
    <footer className="pb-12 pt-4">
      <div className="container">
        <div className="rule" />
        <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between text-xs">
          <div>
            <p className="mono font-medium text-ink">
              © {year} {site.name} ({site.handle})
            </p>
            <p className="mono text-ink-faint mt-1">
              Curated open-source systems under nub-coders.
            </p>
          </div>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {contactLinks.map(({ label, href }) => (
              <li key={label}>
                <a
                  href={href}
                  className="mono text-ink-faint transition-colors hover:text-ink"
                  {...(href.startsWith("http")
                    ? { target: "_blank", rel: "noreferrer noopener" }
                    : {})}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
