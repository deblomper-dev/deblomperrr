import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { SiteHeader } from "@/app/components/SiteHeader";
import { SiteFooter } from "@/app/components/SiteFooter";
import { RevealObserver } from "@/app/components/RevealObserver";
import { HomePage } from "@/src/pages/HomePage";
import { WorkPage } from "@/src/pages/WorkPage";
import { ProjectDetailPage } from "@/src/pages/ProjectDetailPage";
import { NotFoundPage } from "@/src/pages/NotFoundPage";

function ScrollToTopAndHash() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const targetId = hash.replace(/^#/, "");
      // Slight delay to allow DOM to render if route just switched
      const timer = setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 50);
      return () => clearTimeout(timer);
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [pathname, hash]);

  return null;
}

export function App() {
  return (
    <>
      <a
        href="#main"
        className="meta font-mono sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-3 focus-visible:left-3 focus-visible:z-[100] focus-visible:bg-surface focus-visible:px-3 focus-visible:py-2 focus-visible:border focus-visible:border-rule"
      >
        Skip to main content
      </a>
      <ScrollToTopAndHash />
      <SiteHeader />
      <main id="main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/work" element={<WorkPage />} />
          <Route path="/work/:slug" element={<ProjectDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <SiteFooter />
      <RevealObserver />
    </>
  );
}

export default App;
