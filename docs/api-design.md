# API Design

## Principles

- Resource-oriented endpoints
- Cursor pagination for large lists
- Explicit filtering and sorting
- Snapshot-based historical endpoints
- Separate public and private surfaces

## Public API v1

Base path:

`/api/v1`

## Explorer Endpoints

### `GET /blocks`

Query:

- `cursor`
- `limit`
- `sort`

### `GET /blocks/:heightOrHash`

Returns:

- block summary
- extrinsics
- events

### `GET /transfers`

Query:

- `cursor`
- `limit`
- `from`
- `to`
- `minAmount`
- `maxAmount`

### `GET /extrinsics`

Query:

- `cursor`
- `limit`
- `section`
- `method`
- `success`
- `signer`

### `GET /events`

Query:

- `cursor`
- `limit`
- `section`
- `method`
- `extrinsicId`

### `GET /accounts`

Query:

- `cursor`
- `limit`
- `search`

### `GET /accounts/:address`

Returns:

- account profile
- current balances
- recent transfers
- recent extrinsics
- stake positions

## Network Endpoints

### `GET /subnets`

Query:

- `cursor`
- `limit`
- `sort`
- `denomination=tao|usd`

### `GET /subnets/:netuid`

Returns:

- subnet profile
- latest snapshot
- links
- owner metadata

### `GET /subnets/:netuid/chart`

Query:

- `range`
- `interval`

### `GET /subnets/:netuid/metagraph`

Query:

- `cursor`
- `limit`
- `sort`
- `type=validator|miner|all`

### `GET /subnets/:netuid/registration`

### `GET /subnets/:netuid/distribution`

### `GET /subnets/:netuid/miner-weights`

### `GET /subnets/:netuid/statistics`

### `GET /validators`

Query:

- `cursor`
- `limit`
- `sort`

### `GET /validators/:hotkey`

Returns:

- validator profile
- latest summary
- subnet activity
- historical charts

## Analytics Endpoints

### `GET /analytics/home`

Returns data for:

- TAO summary
- home charts
- featured tables

### `GET /yield`

### `GET /tokenomics`

## Search Endpoint

### `GET /search`

Query:

- `q`

Returns typed matches:

- block
- account
- subnet
- validator
- extrinsic

