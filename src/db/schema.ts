import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar
} from "drizzle-orm/pg-core";

export const trackedTopicsTable = pgTable("tracked_topics", {
  id: uuid("id").defaultRandom().primaryKey(),
  topicType: varchar("topic_type", { length: 64 }).notNull(),
  label: text("label").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const sourcesTable = pgTable("sources", {
  id: varchar("id", { length: 128 }).primaryKey(),
  label: text("label").notNull(),
  url: text("url").notNull(),
  kind: varchar("kind", { length: 32 }).notNull(),
  enabled: boolean("enabled").notNull().default(true),
  categories: jsonb("categories").$type<string[]>().notNull().default([]),
  lastCollectedAt: timestamp("last_collected_at", { withTimezone: true })
});

export const runsTable = pgTable("runs", {
  id: uuid("id").defaultRandom().primaryKey(),
  triggerType: varchar("trigger_type", { length: 32 }).notNull(),
  status: varchar("status", { length: 32 }).notNull(),
  dryRun: boolean("dry_run").notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  errorMessage: text("error_message")
});

export const rawObservationsTable = pgTable("raw_observations", {
  id: uuid("id").defaultRandom().primaryKey(),
  runId: uuid("run_id").notNull().references(() => runsTable.id),
  sourceId: varchar("source_id", { length: 128 }).notNull().references(() => sourcesTable.id),
  sourceKind: varchar("source_kind", { length: 32 }).notNull(),
  category: varchar("category", { length: 64 }).notNull(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  snippet: text("snippet").notNull(),
  rawText: text("raw_text").notNull(),
  contentHash: varchar("content_hash", { length: 64 }).notNull(),
  capturedAt: timestamp("captured_at", { withTimezone: true }).notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true })
});

export const promptLogsTable = pgTable("prompt_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  runId: uuid("run_id").notNull().references(() => runsTable.id),
  promptVersion: varchar("prompt_version", { length: 32 }).notNull(),
  model: text("model").notNull(),
  inputObservationHashes: jsonb("input_observation_hashes").$type<string[]>().notNull().default([]),
  promptBody: text("prompt_body").notNull(),
  rawResponse: text("raw_response").notNull(),
  parseStatus: varchar("parse_status", { length: 16 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const insightsTable = pgTable("insights", {
  id: uuid("id").defaultRandom().primaryKey(),
  runId: uuid("run_id").notNull().references(() => runsTable.id),
  category: varchar("category", { length: 64 }).notNull(),
  headline: text("headline").notNull(),
  summary: text("summary").notNull(),
  soWhat: text("so_what").notNull(),
  confidence: integer("confidence").notNull(),
  noveltyScore: integer("novelty_score").notNull(),
  insightHash: varchar("insight_hash", { length: 64 }).notNull(),
  sourceIds: jsonb("source_ids").$type<string[]>().notNull().default([]),
  sourceUrls: jsonb("source_urls").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const reportsTable = pgTable("reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  runId: uuid("run_id").notNull().references(() => runsTable.id),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
  discordMessageId: text("discord_message_id"),
  publishedAt: timestamp("published_at", { withTimezone: true }).defaultNow().notNull()
});
