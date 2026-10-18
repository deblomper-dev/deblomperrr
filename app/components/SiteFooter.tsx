import Link from "next/link";
import { contactLinks, site } from "@/lib/data/site";
import "../sections/story.css";

const year = new Date().getFullYear();

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-topline reveal">
          <Link href="/#top" className="footer-name" aria-label={`${site.name}, back to top`}>
            {site.name}<span aria-hidden="true">.</span>
          </Link>
          <Link href="/#top" className="footer-back">
            Back to top
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 20V4m-7 7 7-7 7 7" stroke="currentColor" strokeWidth="1.75" />
            </svg>
          </Link>
        </div>
        <div className="footer-bottomline">
          <p>© <span suppressHydrationWarning>{year}</span> {site.name}</p>
          <ul aria-label="Social links">
            {contactLinks.map(({ label, href }) => (
              <li key={label}>
                <a
                  href={href}
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
