# System Architecture

## Overview

BitAnalyze should be split into three major runtime systems:

1. `web`: user-facing frontend
2. `api`: normalized read/write services
3. `indexer`: ingestion, decoding, snapshotting, analytics jobs

## High-Level Flow

1. Chain data is read from Bittensor/Substrate RPC endpoints.
2. The indexer decodes blocks, extrinsics, events, and balances.
3. The indexer writes normalized records and time-series snapshots to Postgres.
4. Aggregation jobs compute subnet, validator, and portfolio metrics.
5. The API serves query-friendly resources to the frontend.
6. The frontend renders SSR pages plus client-side live refresh.

## Frontend

Recommended stack:

- Next.js
- TypeScript
- Tailwind CSS
- TanStack Table
- TanStack Query
- ECharts or TradingView Light Charts

Frontend responsibilities:

- SSR public pages for SEO and fast load
- Client-side refresh for live tables
- Search UX
- Filtering, sorting, export initiation
- Authenticated dashboard pages later

## API

Recommended split:

- Public read API
- Internal aggregation API
- Auth/project/API-key service later

Responsibilities:

- Normalize database records into UI-friendly models
- Support cursor pagination
- Support filters and sort options
- Gate paid/private endpoints later

## Indexer

Main workers:

- Block ingestion worker
- Event and extrinsic decoder
- Transfer extraction worker
- Account balance snapshot worker
- Subnet snapshot worker
- Validator metrics worker
- Metagraph snapshot worker
- Historical backfill worker

Design notes:

- Idempotent writes
- Resume from checkpoints
- Reorg-aware at the block layer
- Job queues for snapshot fanout

## Storage

Primary:

- PostgreSQL

Helpful extensions:

- TimescaleDB for time-series hypertables
- `pg_trgm` for search

Optional later:

- Redis for caching hot queries
- Object storage for CSV exports and tax reports

## Caching

Recommended caching tiers:

- CDN cache for public SSR pages
- API response cache for hot list endpoints
- Materialized aggregates for expensive charts

## Security

- Rate limit public APIs
- Separate internal indexer credentials from public app credentials
- Signed auth sessions for dashboard users
- Strict validation on wallet-driven actions later

