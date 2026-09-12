import { NextRequest, NextResponse } from "next/server";
import { getStreakCapsulesSVG } from "@/lib/github/streak-stats";
import { getContributionGraphSVG } from "@/lib/github/contribution-graph";

export const dynamic = "force-dynamic";

const SVG_CACHE_CONTROL = "public, max-age=300, s-maxage=300, stale-while-revalidate=86400";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const url = new URL(request.url);
  const username = url.searchParams.get("user") || url.searchParams.get("username") || undefined;
  const force = url.searchParams.get("force") === "true";
  const showArea = url.searchParams.get("area") === "true";
  const explicitTheme = url.searchParams.get("theme");
  const browserTheme = request.headers.get("sec-ch-prefers-color-scheme");
  const theme = explicitTheme === "light" || explicitTheme === "dark"
    ? explicitTheme
    : browserTheme === "light"
      ? "light"
      : "dark";

  if (slug === "streak-capsules.svg" || slug === "streak-capsules") {
    try {
      const svg = await getStreakCapsulesSVG(username, force);
      return new NextResponse(svg, {
        status: 200,
        headers: {
          "Content-Type": "image/svg+xml; charset=utf-8",
          "Cache-Control": SVG_CACHE_CONTROL,
        },
      });
    } catch (err: unknown) {
      console.error("[Streak Capsules Error]", (err as Error)?.message ?? err);
      const fallback = `<svg xmlns="http://www.w3.org/2000/svg" width="620" height="28" viewBox="0 0 620 28">
  <rect x="0.5" y="0.5" width="619" height="27" fill="#1a1a1f" stroke="#2a2a3a"/>
  <text x="310" y="14.5" text-anchor="middle" dominant-baseline="middle" fill="#c9c9d4" font-family="ui-monospace, monospace" font-size="11">Streak stats temporarily unavailable</text>
</svg>`;
      return new NextResponse(fallback, {
        status: 503,
        headers: {
          "Content-Type": "image/svg+xml; charset=utf-8",
          "Cache-Control": "no-cache",
        },
      });
    }
  }

  if (slug === "contribution-graph.svg" || slug === "contribution-graph") {
    try {
      const svg = await getContributionGraphSVG(username, force, showArea, theme);
      return new NextResponse(svg, {
        status: 200,
        headers: {
          "Content-Type": "image/svg+xml; charset=utf-8",
          "Cache-Control": SVG_CACHE_CONTROL,
        },
      });
    } catch (err: unknown) {
      console.error("[Contribution Graph Error]", (err as Error)?.message ?? err);
      const fallback = `<svg xmlns="http://www.w3.org/2000/svg" width="850" height="320" viewBox="0 0 850 320">
  <text x="425" y="165" text-anchor="middle" fill="#8b949e" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="14">Contribution graph temporarily unavailable</text>
</svg>`;
      return new NextResponse(fallback, {
        status: 503,
        headers: {
          "Content-Type": "image/svg+xml; charset=utf-8",
          "Cache-Control": "no-cache",
        },
      });
    }
  }

  return new NextResponse("Not Found", { status: 404 });
}
