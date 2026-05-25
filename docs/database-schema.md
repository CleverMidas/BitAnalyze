# Database Schema

## Core Explorer Tables

### `blocks`

- `id`
- `height`
- `hash`
- `parent_hash`
- `spec_version`
- `timestamp`
- `extrinsic_count`
- `event_count`
- `is_finalized`
- `created_at`

### `extrinsics`

- `id`
- `block_id`
- `extrinsic_index`
- `extrinsic_id`
- `signer_address`
- `section`
- `method`
- `args_json`
- `success`
- `fee`
- `timestamp`

### `events`

- `id`
- `block_id`
- `event_index`
- `event_id`
- `phase`
- `section`
- `method`
- `data_json`
- `extrinsic_id`
- `timestamp`

### `transfers`

- `id`
- `extrinsic_id`
- `from_address`
- `to_address`
- `amount_rao`
- `amount_tao`
- `timestamp`

### `accounts`

- `id`
- `address`
- `address_type`
- `label`
- `image_url`
- `description`
- `first_seen_block`
- `last_seen_block`

### `account_balance_snapshots`

- `id`
- `account_id`
- `block_height`
- `free_rao`
- `reserved_rao`
- `staked_root_rao`
- `staked_alpha_rao`
- `timestamp`

## Network Tables

### `subnets`

- `id`
- `netuid`
- `name`
- `symbol`
- `slug`
- `owner_coldkey`
- `owner_hotkey`
- `description`
- `website_url`
- `github_url`
- `image_url`
- `is_active`
- `created_at`

### `subnet_snapshots`

- `id`
- `subnet_id`
- `block_height`
- `price_tao`
- `price_usd`
- `market_cap_usd`
- `fdv_usd`
- `volume_24h_usd`
- `emission_pct`
- `root_proportion_pct`
- `tao_in_pool`
- `alpha_in_pool`
- `circulating_alpha`
- `registration_cost_tao`
- `recycled_24h_tao`
- `timestamp`

### `subnet_hyperparameters`

- `id`
- `subnet_id`
- `block_height`
- `params_json`
- `timestamp`

### `subnet_registration_events`

- `id`
- `subnet_id`
- `event_type`
- `cost_tao`
- `block_height`
- `timestamp`

## Validator Tables

### `validators`

- `id`
- `hotkey_address`
- `coldkey_address`
- `name`
- `url`
- `description`
- `image_url`
- `take_pct`
- `is_active`

### `validator_snapshots`

- `id`
- `validator_id`
- `block_height`
- `dominance_pct`
- `nominator_count`
- `active_subnet_count`
- `total_weight_tao`
- `weight_change_24h_tao`
- `root_stake_tao`
- `root_weight_tao`
- `alpha_stake_tao`
- `timestamp`

### `validator_subnet_metrics`

- `id`
- `validator_id`
- `subnet_id`
- `block_height`
- `uid`
- `vtrust`
- `trust`
- `consensus`
- `dividends`
- `incentive`
- `emission_alpha`
- `updated_blocks_ago`
- `root_stake_tao`
- `alpha_stake`
- `daily_rewards_alpha`
- `timestamp`

## Metagraph Tables

### `neurons`

- `id`
- `subnet_id`
- `uid`
- `hotkey_address`
- `coldkey_address`
- `neuron_type`

### `metagraph_snapshots`

- `id`
- `subnet_id`
- `neuron_id`
- `block_height`
- `stake_weight`
- `vtrust`
- `trust`
- `consensus`
- `incentive`
- `dividends`
- `emission_per_epoch`
- `updated_blocks_ago`
- `axon`
- `is_immune`
- `is_active`
- `timestamp`

## Search and Labels

### `entity_labels`

- `id`
- `entity_type`
- `entity_id`
- `label`
- `source`

## Later Pro Tables

- `users`
- `organizations`
- `projects`
- `api_keys`
- `api_usage_daily`
- `portfolio_snapshots`
- `tax_exports`

