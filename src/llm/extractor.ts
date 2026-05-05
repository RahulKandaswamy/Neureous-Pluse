import { z } from "zod";

import { brandProfile } from "../config/brand.js";
import type {
  ExtractedInsight,
  ExtractionInput,
  PromptLogRecord,
  RawObservation
} from "../domain/contracts.js";
import { splitIntoChunks, truncate } from "../lib/text.js";

import { OllamaClient } from "./ollama-client.js";

const promptVersion = "2026-05-01.1";

const extractedInsightSchema = z.object({
  category: z.string(),
  headline: z.string(),
  summary: z.string(),
  soWhat: z.string(),
  confidence: z.number().min(0).max(100),
  sourceIds: z.array(z.string()).default([]),
  sourceUrls: z.array(z.string()).default([])
});

const extractionResponseSchema = z.object({
  insights: z.array(extractedInsightSchema)
});

export class InsightExtractor {
  public constructor(
    private readonly client: OllamaClient,
    private readonly modelName: string
  ) {}

  public async extract(
    input: ExtractionInput
  ): Promise<{ insights: ExtractedInsight[]; promptLogs: PromptLogRecord[] }> {
    const batches = splitIntoChunks(input.observations, 8);
    const insights: ExtractedInsight[] = [];
    const promptLogs: PromptLogRecord[] = [];

    for (const batch of batches) {
      const prompt = buildPrompt(batch, input.categories);
      const rawResponse = await this.client.generateJson(prompt);
      const parsed = safeParseResponse(rawResponse);
      promptLogs.push({
        promptVersion,
        model: this.modelName,
        inputObservationHashes: batch.map((observation) => observation.contentHash),
        promptBody: prompt,
        rawResponse,
        parseStatus: parsed.success ? "parsed" : "failed"
      });

      if (!parsed.success) {
        continue;
      }

      insights.push(
        ...parsed.data.insights.map((insight) => ({
          category: insight.category as ExtractedInsight["category"],
          headline: truncate(insight.headline.trim(), 120),
          summary: truncate(insight.summary.trim(), 320),
          soWhat: truncate(insight.soWhat.trim(), 220),
          confidence: Math.round(insight.confidence),
          sourceIds: insight.sourceIds,
          sourceUrls: insight.sourceUrls
        }))
      );
    }

    return {
      insights,
      promptLogs
    };
  }
}

function buildPrompt(observations: RawObservation[], categories: ExtractionInput["categories"]): string {
  const observationText = observations
    .map((observation, index) =>
      [
        `Observation ${index + 1}`,
        `source_id: ${observation.sourceId}`,
        `category: ${observation.category}`,
        `title: ${observation.title}`,
        `url: ${observation.url}`,
        `snippet: ${observation.snippet}`,
        `raw_text: ${truncate(observation.rawText, 1200)}`
      ].join("\n")
    )
    .join("\n\n");

  return `
You are an analyst for ${brandProfile.name}, a ${brandProfile.positioning} brand in ${brandProfile.market}.

Task:
- Read the observations.
- Return only high-signal insights relevant to the allowed categories.
- Prefer claims grounded in explicit source material.
- Ignore duplicate or weak observations.
- Return valid JSON only.

Allowed categories:
${categories.map((category) => `- ${category}`).join("\n")}

Required JSON shape:
{
  "insights": [
    {
      "category": "ingredient_intelligence",
      "headline": "short headline",
      "summary": "2-3 sentence summary",
      "soWhat": "why it matters for Neureos",
      "confidence": 0,
      "sourceIds": ["source id"],
      "sourceUrls": ["https://example.com"]
    }
  ]
}

Observations:
${observationText}
`.trim();
}

function safeParseResponse(rawResponse: string) {
  try {
    return extractionResponseSchema.safeParse(JSON.parse(rawResponse));
  } catch {
    return extractionResponseSchema.safeParse(null);
  }
}
