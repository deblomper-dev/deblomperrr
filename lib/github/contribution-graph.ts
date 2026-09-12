import { fetchContributions, type ContributionDay } from "./contributions";

const GRAPH_DAYS = 31;

type GraphTheme = "dark" | "light";

const THEME_COLORS: Record<GraphTheme, {
  text: string;
  line: string;
  point: string;
  area: string;
  grid: string;
  axis: string;
  glow: string;
}> = {
  dark: {
    text: "#ffffff",
    line: "#ffffff",
    point: "#ffffff",
    area: "#ffffff",
    grid: "#21262d",
    axis: "#30363d",
    glow: "#ffffff",
  },
  light: {
    text: "#0f172a",
    line: "#0f172a",
    point: "#0f172a",
    area: "#60a5fa",
    grid: "#dfe7f3",
    axis: "#94a3b8",
    glow: "#0f172a",
  },
};

const WIDTH = 850;
const HEIGHT = 320;
const PADDING = { top: 50, right: 30, bottom: 50, left: 50 };
const CHART_W = WIDTH - PADDING.left - PADDING.right;
const CHART_H = HEIGHT - PADDING.top - PADDING.bottom;

export function emptyGraphSVG(theme: GraphTheme = "dark"): string {
  const colors = THEME_COLORS[theme];

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-label="No contribution data available">
  <style>
    .axis-label { font: 500 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; fill: ${colors.text}; opacity: 0.75; }
  </style>
  <line x1="${PADDING.left}" y1="${PADDING.top}" x2="${PADDING.left}" y2="${PADDING.top + CHART_H}" stroke="${colors.axis}" stroke-width="1"/>
  <line x1="${PADDING.left}" y1="${PADDING.top + CHART_H}" x2="${PADDING.left + CHART_W}" y2="${PADDING.top + CHART_H}" stroke="${colors.axis}" stroke-width="1"/>
  <text x="${PADDING.left + CHART_W / 2}" y="${PADDING.top + CHART_H / 2}" text-anchor="middle" class="axis-label">No contribution data available</text>
</svg>`;
}

export function generateGraphSVG(days: ContributionDay[], showArea = false, theme: GraphTheme = "dark"): string {
  const colors = THEME_COLORS[theme];

  if (!days.length) return emptyGraphSVG(theme);

  const sorted = [...days]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-GRAPH_DAYS);

  const counts = sorted.map((d) => d.contributionCount);
  const maxVal = Math.max(...counts, 1);
  const yMax = Math.ceil(maxVal / 2) * 2;
  const yStep = Math.max(1, Math.ceil(yMax / 5));
  const yTicks: number[] = [];
  for (let v = 0; v <= yMax; v += yStep) yTicks.push(v);
  if (yTicks[yTicks.length - 1] < yMax) yTicks.push(yMax);

  const xStep = CHART_W / (sorted.length - 1 || 1);

  const points = sorted.map((d, i) => ({
    x: PADDING.left + i * xStep,
    y: PADDING.top + CHART_H - (d.contributionCount / yMax) * CHART_H,
    count: d.contributionCount,
    date: d.date,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");

  const areaPath = showArea
    ? linePath
      + ` L ${points[points.length - 1].x.toFixed(1)} ${(PADDING.top + CHART_H).toFixed(1)}`
      + ` L ${points[0].x.toFixed(1)} ${(PADDING.top + CHART_H).toFixed(1)} Z`
    : "";

  const gridLines = yTicks.map((v) => {
    const y = PADDING.top + CHART_H - (v / yMax) * CHART_H;
    return `<line x1="${PADDING.left}" y1="${y.toFixed(1)}" x2="${PADDING.left + CHART_W}" y2="${y.toFixed(1)}" stroke="${colors.grid}" stroke-width="0.5" stroke-dasharray="4,4"/>
    <text x="${PADDING.left - 12}" y="${(y + 4).toFixed(1)}" text-anchor="end" class="axis-text">${v}</text>`;
  }).join("\n    ");

  const labelInterval = Math.max(1, Math.floor(sorted.length / 10));
  const xLabels = points
    .filter((_, i) => i % labelInterval === 0 || i === points.length - 1)
    .map((p) => {
      const d = new Date(p.date + "T00:00:00Z");
      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
      return `<text x="${p.x.toFixed(1)}" y="${(PADDING.top + CHART_H + 24).toFixed(1)}" text-anchor="middle" class="axis-text">${label}</text>`;
    }).join("\n    ");

  const dots = points.map((p) =>
    `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.5" fill="${colors.point}"/>`
  ).join("\n    ");

  const areaGradDef = showArea
    ? `\n    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${colors.area}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${colors.area}" stop-opacity="0.02"/>
    </linearGradient>`
    : "";

  const areaMarkup = showArea ? `\n  <!-- Area -->\n  <path d="${areaPath}" fill="url(#areaGrad)"/>\n` : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>${areaGradDef}
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <style>
    .axis-text { font: 400 10px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; fill: ${colors.text}; opacity: 0.7; }
    .axis-label { font: 500 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; fill: ${colors.text}; opacity: 0.65; }
  </style>

  <!-- Y axis -->
  <line x1="${PADDING.left}" y1="${PADDING.top}" x2="${PADDING.left}" y2="${PADDING.top + CHART_H}" stroke="${colors.axis}" stroke-width="1"/>
  <text x="14" y="${PADDING.top + CHART_H / 2}" text-anchor="middle" class="axis-label" transform="rotate(-90, 14, ${PADDING.top + CHART_H / 2})">Contributions</text>

  <!-- X axis -->
  <line x1="${PADDING.left}" y1="${PADDING.top + CHART_H}" x2="${PADDING.left + CHART_W}" y2="${PADDING.top + CHART_H}" stroke="${colors.axis}" stroke-width="1"/>
  <text x="${PADDING.left + CHART_W / 2}" y="${HEIGHT - 8}" text-anchor="middle" class="axis-label">Days</text>

  <!-- Grid -->
  ${gridLines}

  <!-- X labels -->
  ${xLabels}${areaMarkup}
  <!-- Line -->
  <path d="${linePath}" fill="none" stroke="${colors.line}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Points -->
  ${dots}

  <!-- Moving glow tracing the line -->
  <circle r="4" fill="${colors.glow}" filter="url(#glow)">
    <animateMotion path="${linePath}" dur="3s" repeatCount="indefinite" rotate="auto"/>
    <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.05;0.95;1" dur="3s" repeatCount="indefinite"/>
  </circle>
</svg>`;
}

export async function getContributionGraphSVG(username?: string, force = false, showArea = false, theme: GraphTheme = "dark"): Promise<string> {
  const days = await fetchContributions(undefined, username, force);
  return generateGraphSVG(days, showArea, theme);
}
