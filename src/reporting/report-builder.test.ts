import { describe, expect, it } from "vitest";

import { buildReport } from "./report-builder.js";

describe("buildReport", () => {
  it("prioritizes novel insights and caps report size", () => {
    const report = buildReport(
      [
        {
          category: "competitor_pulse",
          headline: "Competitor launches focus formula",
          summary: "A competitor released a focus-led pre-workout formula.",
          soWhat: "This validates the focus positioning space.",
          confidence: 80,
          sourceIds: ["competitor-site"],
          sourceUrls: ["https://example.com/a"]
        },
        {
          category: "consumer_sentiment",
          headline: "Gym users discuss stim-free options",
          summary: "Users are comparing smoother, lower-jitter products.",
          soWhat: "There may be whitespace for a focus-first positioning.",
          confidence: 72,
          sourceIds: ["reddit-preworkout"],
          sourceUrls: ["https://example.com/b"]
        }
      ],
      new Set()
    );

    expect(report.insights).toHaveLength(2);
    expect(report.insights[0]?.noveltyScore).toBeGreaterThanOrEqual(
      report.insights[1]?.noveltyScore ?? 0
    );
  });
});
