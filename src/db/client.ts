import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import type { AppEnv } from "../config/env.js";

export type AppDatabase = ReturnType<typeof drizzle>;

export function createDatabase(env: AppEnv) {
  const pool = new Pool({
    connectionString: env.DATABASE_URL
  });

  return {
    db: drizzle(pool),
    pool
  };
}
