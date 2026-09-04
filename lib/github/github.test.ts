import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calculateStreaks, generateCapsulesSVG } from "./streak-stats";
import { generateGraphSVG, emptyGraphSVG } from "./contribution-graph";
import type { ContributionDay } from "./contributions";

function daysFrom(counts: number[]): ContributionDay[] {
  return counts.map((contributionCount, i) => ({
    contributionCount,
    date: `2026-01-${String(i + 1).padStart(2, "0")}`,
  }));
}

describe("GitHub Streak Calculations", () => {
  it("returns zeroed data for empty calendar", () => {
    const streaks = calculateStreaks([]);
    assert.equal(streaks.totalContributions, 0);
    assert.equal(streaks.longestStreak, 0);
    assert.equal(streaks.currentStreak, 0);
  });

  it("calculates total contributions and streaks accurately", () => {
    const data = daysFrom([1, 2, 3, 0, 5, 5]);
    const streaks = calculateStreaks(data);
    assert.equal(streaks.totalContributions, 16);
    assert.equal(streaks.longestStreak, 3);
  });

  it("generates valid capsules SVG without NaN", () => {
    const streaks = calculateStreaks(daysFrom([1, 2]));
    const svg = generateCapsulesSVG(streaks);
    assert.match(svg, /^<svg/);
    assert.match(svg, /<\/svg>$/);
    assert.ok(!svg.includes("NaN"));
    assert.ok(!svg.includes("undefined"));
    assert.ok(svg.includes("TOTAL CONTRIBUTIONS"));
    assert.ok(svg.includes("CURRENT STREAK"));
  });
});

describe("GitHub Contribution Graph SVG", () => {
  it("renders empty state with background card", () => {
    const svg = emptyGraphSVG();
    assert.match(svg, /^<svg/);
    assert.match(svg, /<\/svg>$/);
    assert.ok(svg.includes('fill="#0d1117"'));
    assert.ok(svg.includes("No contribution data available"));
  });

  it("renders series graph with background card and paths", () => {
    const data = daysFrom([0, 2, 4, 1, 5]);
    const svg = generateGraphSVG(data);
    assert.match(svg, /^<svg/);
    assert.match(svg, /<\/svg>$/);
    assert.ok(svg.includes('fill="#0d1117"'));
    assert.ok(svg.includes("<path"));
    assert.ok(!svg.includes("NaN"));
    assert.ok(!svg.includes("undefined"));
  });
});
