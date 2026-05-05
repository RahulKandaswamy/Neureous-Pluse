CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE "tracked_topics" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "topic_type" varchar(64) NOT NULL,
  "label" text NOT NULL,
  "metadata" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE "sources" (
  "id" varchar(128) PRIMARY KEY,
  "label" text NOT NULL,
  "url" text NOT NULL,
  "kind" varchar(32) NOT NULL,
  "enabled" boolean NOT NULL DEFAULT true,
  "categories" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "last_collected_at" timestamp with time zone
);

CREATE TABLE "runs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "trigger_type" varchar(32) NOT NULL,
  "status" varchar(32) NOT NULL,
  "dry_run" boolean NOT NULL,
  "started_at" timestamp with time zone NOT NULL DEFAULT now(),
  "finished_at" timestamp with time zone,
  "error_message" text
);

CREATE TABLE "raw_observations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "run_id" uuid NOT NULL REFERENCES "runs" ("id"),
  "source_id" varchar(128) NOT NULL REFERENCES "sources" ("id"),
  "source_kind" varchar(32) NOT NULL,
  "category" varchar(64) NOT NULL,
  "title" text NOT NULL,
  "url" text NOT NULL,
  "snippet" text NOT NULL,
  "raw_text" text NOT NULL,
  "content_hash" varchar(64) NOT NULL,
  "captured_at" timestamp with time zone NOT NULL,
  "published_at" timestamp with time zone
);

CREATE TABLE "prompt_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "run_id" uuid NOT NULL REFERENCES "runs" ("id"),
  "prompt_version" varchar(32) NOT NULL,
  "model" text NOT NULL,
  "input_observation_hashes" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "prompt_body" text NOT NULL,
  "raw_response" text NOT NULL,
  "parse_status" varchar(16) NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE "insights" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "run_id" uuid NOT NULL REFERENCES "runs" ("id"),
  "category" varchar(64) NOT NULL,
  "headline" text NOT NULL,
  "summary" text NOT NULL,
  "so_what" text NOT NULL,
  "confidence" integer NOT NULL,
  "novelty_score" integer NOT NULL,
  "insight_hash" varchar(64) NOT NULL,
  "source_ids" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "source_urls" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE "reports" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "run_id" uuid NOT NULL REFERENCES "runs" ("id"),
  "payload" jsonb NOT NULL,
  "discord_message_id" text,
  "published_at" timestamp with time zone NOT NULL DEFAULT now()
);
