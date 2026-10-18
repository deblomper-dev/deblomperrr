import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { renderPageMetadata } from "@/lib/seo";

export function PageMetadata() {
  const { pathname } = useLocation();

  useEffect(() => {
    const template = document.createElement("template");
    template.innerHTML = renderPageMetadata(pathname);
    document.head.querySelectorAll("[data-page-meta]").forEach((element) => element.remove());
    document.head.append(template.content);
  }, [pathname]);

  return null;
}
