import { createApp } from "../app.js";

const { app, pipeline, env } = createApp();

try {
  const result = await pipeline.execute({
    triggerType: "manual",
    dryRun: env.DRY_RUN_DEFAULT
  });

  app.log.info(
    {
      runId: result.runId,
      insightCount: result.report.insights.length
    },
    "Manual report run completed."
  );
} catch (error) {
  app.log.error(error, "Manual report run failed.");
  process.exitCode = 1;
} finally {
  await app.close();
}
