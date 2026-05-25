# BitAnalyze PRD

## Product Summary

BitAnalyze is a Bittensor explorer and analytics platform. It provides public chain visibility, subnet and validator intelligence, investor workflows, and premium portfolio tooling.

## Users

- Delegators looking for staking opportunities
- Validators tracking network position and performance
- Miners tracking subnet competition and rewards
- Developers consuming normalized Bittensor data
- Analysts researching historical chain behavior

## Product Pillars

### 1. Explorer

- Blocks
- Transfers
- Extrinsics
- Events
- Accounts
- Global search by block, address, subnet, validator, extrinsic

### 2. Network Analytics

- Subnets list
- Validators list
- Yield and emissions views
- Subnet registration and deregistration tracking
- Historical analytics dashboards

### 3. Investor Tools

- Tokenomics
- Yield/APY comparison
- Root claim visibility
- Buy/swap entry points

### 4. Pro Dashboard

- Portfolio
- Stake management
- Transfer tools
- Mining dashboards
- API keys and usage
- Tax exports

## Public MVP Pages

### Home

- TAO price summary
- Market cap
- 24h volume
- Circulating supply
- Latest block
- Featured subnets table
- Featured validators table
- Recent transfers
- Recent blocks

### Explorer

- `/blocks`
- `/transfers`
- `/extrinsics`
- `/events`
- `/accounts`

### Network

- `/subnets`
- `/validators`
- `/analytics`
- `/yield`
- `/tokenomics`

### Subnet Detail

- Overview
- Chart
- Metagraph
- Registration
- Distribution
- Miner weights
- Statistics

## Core Functional Requirements

### Tables

- Sortable columns
- Pagination
- CSV export
- Filter controls
- Auto-refresh where data is live

### Charts

- Time range switching
- Tooltip and zoom
- Snapshot overlays for major changes

### Entity Views

- Subnet profile
- Validator profile
- Account profile
- Hotkey/coldkey linked views

## Non-Functional Requirements

- Fast first paint for public pages
- Live-ish data for explorer pages
- Historical analytics queries under acceptable latency
- Robust backfill and reorg-safe indexing
- Original design and branding, not a visual copy

## MVP Exclusions

- Full wallet transaction execution
- Full tax accounting engine
- Pro billing
- Advanced admin backoffice

