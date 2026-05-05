# Neureous-Pluse
=======
# Marketing Insights Agent

An auditable market intelligence bot for Neureos. The service collects deterministic public signals, extracts structured insights with a self-hosted model through Ollama, stores the full audit trail in Postgres, and publishes scheduled reports to Discord.

## Architecture

- `src/app.ts`: Fastify application wiring.
- `src/config`: environment, brand scope, and source seed definitions.
- `src/collectors`: deterministic source collectors for feeds, HTML pages, and Reddit.
- `src/db`: schema, client, and persistence repositories.
- `src/llm`: Ollama client and structured extraction logic.
- `src/pipeline`: end-to-end report orchestration.
- `src/reporting`: Discord formatting and delivery.
- `src/scripts`: local execution helpers.

## Core Principles

- Strong auditability: each run records source text, hashes, prompt inputs, model outputs, and final report payloads.
- Deterministic collection first: the system gathers public sources directly instead of relying on black-box web-search calls.
- Narrow interfaces: each module owns one responsibility and communicates through typed contracts.
- Safe defaults: dry-run support and explicit bearer token protection for manual execution.

## Getting Started

1. Install Node.js 20+ and ensure `npm` is available on your PATH.
2. Copy `.env.example` to `.env` and fill in your values.
3. Install dependencies:

```bash
npm install
```

4. Run database migrations after Postgres is available:

```bash
npm run db:migrate
```

5. Start the development server:

```bash
npm run dev
```

## Endpoints

- `GET /health`: service health status.
- `POST /runs/report`: manually trigger a report run.

Send `Authorization: Bearer <RUNNER_BEARER_TOKEN>` on manual runs.

## Manual Report Run

```bash
npm run run:report
```

## Deployment Shape

- Render web service for the Fastify app.
- Render cron job calling `POST /runs/report`.
- Postgres for system state and audit records.
- Ollama running on your own machine or a box you control.

## Current Constraint

This repository was scaffolded in an environment where `npm` was not available on PATH, so dependencies could not be installed or verified in-place yet. The codebase is structured for immediate installation once Node.js tooling is available.
