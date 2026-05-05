export const insightCategories = [
  "ingredient_intelligence",
  "packaging_and_format_trends",
  "gym_channel_intelligence",
  "competitor_pulse",
  "consumer_sentiment",
  "forum_and_community_buzz",
  "innovation_radar"
] as const;

export type InsightCategory = (typeof insightCategories)[number];

export const sourceKinds = ["rss", "html", "reddit"] as const;
export type SourceKind = (typeof sourceKinds)[number];

export type SourceSeed = {
  id: string;
  label: string;
  url: string;
  kind: SourceKind;
  categories: InsightCategory[];
  enabled: boolean;
};

export type RawObservation = {
  sourceId: string;
  sourceKind: SourceKind;
  category: InsightCategory;
  title: string;
  url: string;
  publishedAt?: Date;
  capturedAt: Date;
  snippet: string;
  rawText: string;
  contentHash: string;
};

export type ExtractionInput = {
  runId: string;
  categories: InsightCategory[];
  observations: RawObservation[];
};

export type ExtractedInsight = {
  category: InsightCategory;
  headline: string;
  summary: string;
  soWhat: string;
  confidence: number;
  sourceIds: string[];
  sourceUrls: string[];
};

export type PromptLogRecord = {
  promptVersion: string;
  model: string;
  inputObservationHashes: string[];
  promptBody: string;
  rawResponse: string;
  parseStatus: "parsed" | "failed";
};

export type ReportInsight = ExtractedInsight & {
  noveltyScore: number;
  insightHash: string;
};

export type ReportPayload = {
  title: string;
  generatedAt: string;
  summary: string;
  insights: ReportInsight[];
};
