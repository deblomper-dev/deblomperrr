import Link from "next/link";

export default function NotFound() {
  return (
    <section className="pt-[clamp(3rem,10vw,7rem)] pb-[var(--gap-section)]">
      <div className="container">
        <p className="meta meta-strong">Error 404</p>
        <div className="mt-3.5 rule-tick" />
        <h1 className="display mt-10">Nothing here.</h1>
        <p className="lede measure mt-7">
          That page does not exist. The work index has everything worth linking to.
        </p>
        <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
          <Link href="/work" className="mono link hover-arrow inline-flex items-baseline gap-2 text-ink">
            Work
            <span aria-hidden="true" className="arrow">
              →
            </span>
          </Link>
          <Link href="/" className="mono link hover-arrow inline-flex items-baseline gap-2 text-muted">
            Home
            <span aria-hidden="true" className="arrow">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
