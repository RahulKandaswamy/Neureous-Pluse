import { desc, eq } from "drizzle-orm";

import type {
  PromptLogRecord,
  RawObservation,
  ReportInsight,
  ReportPayload,
  SourceSeed
} from "../domain/contracts.js";

import type { AppDatabase } from "./client.js";
import {
  insightsTable,
  promptLogsTable,
  rawObservationsTable,
  reportsTable,
  runsTable,
  sourcesTable
} from "./schema.js";

export class AuditRepository {
  public constructor(private readonly db: AppDatabase) {}

  public async upsertSources(sources: SourceSeed[]): Promise<void> {
    if (sources.length === 0) {
      return;
    }

    await this.db
      .insert(sourcesTable)
      .values(
        sources.map((source) => ({
          id: source.id,
          label: source.label,
          url: source.url,
          kind: source.kind,
          enabled: source.enabled,
          categories: source.categories
        }))
      )
      .onConflictDoNothing({
        target: sourcesTable.id
      });
  }

  public async createRun(triggerType: "manual" | "scheduled", dryRun: boolean): Promise<string> {
    const [run] = await this.db
      .insert(runsTable)
      .values({
        triggerType,
        dryRun,
        status: "running"
      })
      .returning({ id: runsTable.id });

    return run.id;
  }

  public async completeRun(runId: string): Promise<void> {
    await this.db
      .update(runsTable)
      .set({
        status: "completed",
        finishedAt: new Date()
      })
      .where(eq(runsTable.id, runId));
  }

  public async failRun(runId: string, errorMessage: string): Promise<void> {
    await this.db
      .update(runsTable)
      .set({
        status: "failed",
        errorMessage,
        finishedAt: new Date()
      })
      .where(eq(runsTable.id, runId));
  }

  public async saveObservations(runId: string, observations: RawObservation[]): Promise<void> {
    if (observations.length === 0) {
      return;
    }

    await this.db.insert(rawObservationsTable).values(
      observations.map((observation) => ({
        runId,
        sourceId: observation.sourceId,
        sourceKind: observation.sourceKind,
        category: observation.category,
        title: observation.title,
        url: observation.url,
        snippet: observation.snippet,
        rawText: observation.rawText,
        contentHash: observation.contentHash,
        capturedAt: observation.capturedAt,
        publishedAt: observation.publishedAt
      }))
    );
  }

  public async savePromptLog(runId: string, promptLog: PromptLogRecord): Promise<void> {
    await this.db.insert(promptLogsTable).values({
      runId,
      promptVersion: promptLog.promptVersion,
      model: promptLog.model,
      inputObservationHashes: promptLog.inputObservationHashes,
      promptBody: promptLog.promptBody,
      rawResponse: promptLog.rawResponse,
      parseStatus: promptLog.parseStatus
    });
  }

  public async saveInsights(runId: string, insights: ReportInsight[]): Promise<void> {
    if (insights.length === 0) {
      return;
    }

    await this.db.insert(insightsTable).values(
      insights.map((insight) => ({
        runId,
        category: insight.category,
        headline: insight.headline,
        summary: insight.summary,
        soWhat: insight.soWhat,
        confidence: insight.confidence,
        noveltyScore: Math.round(insight.noveltyScore),
        insightHash: insight.insightHash,
        sourceIds: insight.sourceIds,
        sourceUrls: insight.sourceUrls
      }))
    );
  }

  public async saveReport(runId: string, payload: ReportPayload): Promise<void> {
    await this.db.insert(reportsTable).values({
      runId,
      payload: payload satisfies Record<string, unknown>
    });
  }

  public async listRecentInsightHashes(limit = 200): Promise<Set<string>> {
    const rows = await this.db
      .select({ insightHash: insightsTable.insightHash })
      .from(insightsTable)
      .orderBy(desc(insightsTable.createdAt))
      .limit(limit);

    return new Set(rows.map((row) => row.insightHash));
  }
}
