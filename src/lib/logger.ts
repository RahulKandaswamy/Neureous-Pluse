import pino from "pino";

import { getEnv } from "../config/env.js";

export function createLogger() {
  const env = getEnv();

  return pino({
    level: env.LOG_LEVEL
  });
}
