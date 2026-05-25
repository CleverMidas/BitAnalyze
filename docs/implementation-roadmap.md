# Implementation Roadmap

## Phase 0: Foundation

- Monorepo structure
- TypeScript configuration
- Shared lint and formatting
- Environment configuration
- Dockerized Postgres

## Phase 1: Data Backbone

- Connect to Bittensor/Substrate RPC
- Ingest blocks
- Decode extrinsics and events
- Extract transfers
- Persist normalized explorer records
- Add checkpointing and backfill

Success criteria:

- We can continuously sync blocks
- Explorer data is queryable from Postgres

## Phase 2: Read API

- Build `/blocks`, `/transfers`, `/extrinsics`, `/events`, `/accounts`
- Add pagination and filters
- Add search

Success criteria:

- Public explorer pages can be built from stable internal APIs

## Phase 3: Network Analytics

- Add subnet metadata ingestion
- Add subnet snapshots
- Add validator snapshots
- Add metagraph snapshots
- Add subnet registration and distribution aggregates

Success criteria:

- Subnets and validators pages work
- One subnet detail page is fully powered

## Phase 4: Frontend MVP

- Home page
- Explorer pages
- Subnets page
- Validators page
- Subnet detail tabs
- Tokenomics page

Success criteria:

- Public MVP is usable end to end

## Phase 5: Investor and Pro

- Yield
- Root claim visibility
- Portfolio
- Mining
- API keys
- Tax exports

## Recommended Immediate Next Sprint

1. Scaffold Next.js app in `apps/web`
2. Scaffold API service in `apps/api`
3. Scaffold indexer worker in `apps/indexer`
4. Add DB migration tooling in `packages/db`
5. Implement block ingestion first

