import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import type { RunReportPipeline } from "../pipeline/run-report.js";

const requestBodySchema = z.object({
  dryRun: z.boolean().optional()
});

type ManualRunRequest = FastifyRequest<{
  Body: z.infer<typeof requestBodySchema>;
}>;

export function registerReportRunRoutes(
  app: FastifyInstance,
  pipeline: RunReportPipeline,
  runnerBearerToken: string
): void {
  app.post("/runs/report", async (request: ManualRunRequest, reply: FastifyReply) => {
    if (!authorize(request, runnerBearerToken)) {
      return reply.status(401).send({
        message: "Unauthorized"
      });
    }

    const body = requestBodySchema.parse(request.body ?? {});

    const result = await pipeline.execute({
      triggerType: "manual",
      dryRun: body.dryRun
    });

    return reply.status(202).send({
      runId: result.runId,
      generatedAt: result.report.generatedAt,
      insightCount: result.report.insights.length
    });
  });
}

function authorize(request: FastifyRequest, token: string): boolean {
  return request.headers.authorization === `Bearer ${token}`;
}
