import type { Logger } from "pino";

import { defaultMvpCategories } from "../config/brand.js";
import type { AppEnv } from "../config/env.js";
import { sourceSeeds } from "../config/source-seeds.js";
import { CollectorService } from "../collectors/collector-service.js";
import type { RawObservation, ReportPayload } from "../domain/contracts.js";
import { AuditRepository } from "../db/repositories.js";
import { InsightExtractor } from "../llm/extractor.js";
import { buildReport } from "../reporting/report-builder.js";
import { DiscordPublisher } from "../reporting/discord.js";

type RunReportOptions = {
  triggerType: "manual" | "scheduled";
  dryRun?: boolean;
};

export class RunReportPipeline {
  private readonly collectorService: CollectorService;
  private readonly discordPublisher: DiscordPublisher;

  public constructor(
    private readonly env: AppEnv,
    private readonly logger: Logger,
    private readonly repository: AuditRepository,
    private readonly extractor: InsightExtractor
  ) {
    this.collectorService = new CollectorService(logger);
    this.discordPublisher = new DiscordPublisher(env.DISCORD_WEBHOOK_URL);
  }

  public async execute(options: RunReportOptions): Promise<{ runId: string; report: ReportPayload }> {
    const dryRun = options.dryRun ?? this.env.DRY_RUN_DEFAULT;
    await this.repository.upsertSources(sourceSeeds);

    const runId = await this.repository.createRun(options.triggerType, dryRun);

    try {
      const observations = dedupeObservations(await this.collectorService.collectAll(sourceSeeds));
      const selectedObservations = observations.slice(0, 32);

      await this.repository.saveObservations(runId, selectedObservations);

      const extraction = await this.extractor.extract({
        runId,
        categories: defaultMvpCategories,
        observations: selectedObservations
      });

      for (const promptLog of extraction.promptLogs) {
        await this.repository.savePromptLog(runId, promptLog);
      }

      const existingHashes = await this.repository.listRecentInsightHashes();
      const report = buildReport(extraction.insights, existingHashes);

      await this.repository.saveInsights(runId, report.insights);
      await this.repository.saveReport(runId, report);
      await this.discordPublisher.publish(report, dryRun);
      await this.repository.completeRun(runId);

      this.logger.info(
        {
          runId,
          dryRun,
          observationCount: selectedObservations.length,
          insightCount: report.insights.length
        },
        "Report run completed."
      );

      return {
        runId,
        report
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown pipeline failure";
      await this.repository.failRun(runId, message);
      throw error;
    }
  }
}

function dedupeObservations(observations: RawObservation[]): RawObservation[] {
  const seen = new Set<string>();
  const deduped: RawObservation[] = [];

  for (const observation of observations) {
    if (seen.has(observation.contentHash)) {
      continue;
    }

    seen.add(observation.contentHash);
    deduped.push(observation);
  }

  return deduped;
}
