import { config as loadDotEnv } from "dotenv";
import { z } from "zod";

loadDotEnv();

const booleanFromEnv = z.preprocess((value) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (normalized === "true") {
      return true;
    }

    if (normalized === "false") {
      return false;
    }
  }

  return value;
}, z.boolean());

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.string().default("info"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DISCORD_WEBHOOK_URL: z.string().url().optional(),
  RUNNER_BEARER_TOKEN: z.string().min(1, "RUNNER_BEARER_TOKEN is required"),
  OLLAMA_BASE_URL: z.string().url().default("http://127.0.0.1:11434"),
  OLLAMA_MODEL: z.string().default("qwen3:8b"),
  OLLAMA_TIMEOUT_MS: z.coerce.number().int().positive().default(60_000),
  DRY_RUN_DEFAULT: booleanFromEnv.default(true)
});

export type AppEnv = z.infer<typeof envSchema>;

let cachedEnv: AppEnv | null = null;

export function getEnv(): AppEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  cachedEnv = envSchema.parse(process.env);
  return cachedEnv;
}
