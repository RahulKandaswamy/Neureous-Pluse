import type { ExtractedInsight, ReportInsight, ReportPayload } from "../domain/contracts.js";
import { sha256 } from "../lib/hash.js";

const maxInsightsPerReport = 8;

export function buildReport(
  insights: ExtractedInsight[],
  existingInsightHashes: Set<string>
): ReportPayload {
  const rankedInsights = insights
    .map((insight) => addScores(insight, existingInsightHashes))
    .sort((left, right) => right.noveltyScore - left.noveltyScore || right.confidence - left.confidence)
    .slice(0, maxInsightsPerReport);

  return {
    title: "Neureos Market Intelligence Digest",
    generatedAt: new Date().toISOString(),
    summary: buildSummary(rankedInsights),
    insights: rankedInsights
  };
}

function addScores(insight: ExtractedInsight, existingInsightHashes: Set<string>): ReportInsight {
  const insightHash = sha256(
    `${insight.category}:${insight.headline.toLowerCase()}:${insight.summary.toLowerCase()}`
  );
  const isNew = !existingInsightHashes.has(insightHash);
  const sourceBreadth = Math.min(insight.sourceUrls.length, 3) * 7;
  const noveltyScore = Math.max(0, Math.min(100, (isNew ? 65 : 25) + sourceBreadth + insight.confidence * 0.2));

  return {
    ...insight,
    insightHash,
    noveltyScore
  };
}

function buildSummary(insights: ReportInsight[]): string {
  if (insights.length === 0) {
    return "No reportable insights were extracted from the configured sources in this run.";
  }

  const topCategories = new Set(insights.map((insight) => insight.category));

  return `Generated ${insights.length} insight(s) across ${topCategories.size} category areas. Prioritize reviewing the highest-novelty findings before publishing to wider stakeholders.`;
}
