import Fastify from "fastify";

import { getEnv } from "./config/env.js";
import { createDatabase } from "./db/client.js";
import { AuditRepository } from "./db/repositories.js";
import { InsightExtractor } from "./llm/extractor.js";
import { OllamaClient } from "./llm/ollama-client.js";
import { RunReportPipeline } from "./pipeline/run-report.js";
import { registerHealthRoute } from "./routes/health.js";
import { registerReportRunRoutes } from "./routes/report-runs.js";

import { createLogger } from "./lib/logger.js";

export function createApp() {
  const env = getEnv();
  const logger = createLogger();
  const app = Fastify({
    loggerInstance: logger
  });

  const database = createDatabase(env);
  const repository = new AuditRepository(database.db);
  const ollamaClient = new OllamaClient(env);
  const extractor = new InsightExtractor(ollamaClient, env.OLLAMA_MODEL);
  const pipeline = new RunReportPipeline(env, logger, repository, extractor);

  registerHealthRoute(app);
  registerReportRunRoutes(app, pipeline, env.RUNNER_BEARER_TOKEN);
  app.addHook("onClose", async () => {
    await database.pool.end();
  });

  return {
    app,
    env,
    pipeline
  };
}
