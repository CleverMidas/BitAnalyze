# BitAnalyze

BitAnalyze is a Bittensor analytics platform inspired by the TaoStats product shape, rebuilt with an original implementation and original branding.

## Goal

Build a platform with four major surfaces:

1. Public block explorer
2. Subnet and validator analytics
3. Investor and staking tools
4. Authenticated pro dashboard

## Initial Scope

The first milestone focuses on the public data platform:

- Home dashboard
- Blocks, transfers, extrinsics, events, accounts
- Subnets list
- Validators list
- Subnet detail pages
- Analytics and tokenomics

## Repo Structure

- `docs/` product, architecture, schema, and API design
- `apps/web/` frontend application
- `apps/api/` public and internal API services
- `apps/indexer/` chain ingestion and analytics workers
- `packages/db/` database schema and migrations
- `packages/shared/` shared types and utilities

## Next Build Order

1. Stand up the monorepo app shells
2. Create the database schema and migrations
3. Build the indexer ingestion pipeline
4. Expose normalized read APIs
5. Build explorer and subnet pages

