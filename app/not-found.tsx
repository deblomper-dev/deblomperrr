import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section">
      <div className="container">
        <h1 className="text-5xl text-accent sm:text-7xl">A little off course.</h1>
        <p className="mt-6 max-w-lg text-ink-muted">This page doesn’t exist. Head back to the work to see what I’ve been building.</p>
        <div className="mt-9 flex flex-wrap gap-6">
          <Link href="/work" className="primary-button">Explore my work</Link>
          <Link href="/" className="text-link">Back home</Link>
        </div>
      </div>
    </section>
  );
}
