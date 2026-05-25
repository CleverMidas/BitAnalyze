import {
  bigint,
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';

export const blocks = pgTable(
  'blocks',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().generatedByDefaultAsIdentity(),
    height: bigint('height', { mode: 'number' }).notNull(),
    hash: varchar('hash', { length: 80 }).notNull(),
    parentHash: varchar('parent_hash', { length: 80 }).notNull(),
    stateRoot: varchar('state_root', { length: 80 }).notNull(),
    extrinsicsRoot: varchar('extrinsics_root', { length: 80 }).notNull(),
    specVersion: integer('spec_version').notNull(),
    timestamp: timestamp('timestamp', { withTimezone: true }).notNull(),
    extrinsicCount: integer('extrinsic_count').notNull().default(0),
    eventCount: integer('event_count').notNull().default(0),
    isFinalized: boolean('is_finalized').notNull().default(false),
    metadata: jsonb('metadata').$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    blocksHeightUnique: uniqueIndex('blocks_height_unique').on(table.height),
    blocksHashUnique: uniqueIndex('blocks_hash_unique').on(table.hash),
    blocksTimestampIdx: index('blocks_timestamp_idx').on(table.timestamp),
  }),
);

export const accounts = pgTable(
  'accounts',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().generatedByDefaultAsIdentity(),
    address: varchar('address', { length: 128 }).notNull(),
    label: text('label'),
    description: text('description'),
    firstSeenBlockHeight: bigint('first_seen_block_height', { mode: 'number' }),
    lastSeenBlockHeight: bigint('last_seen_block_height', { mode: 'number' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    accountsAddressUnique: uniqueIndex('accounts_address_unique').on(table.address),
  }),
);

export const extrinsics = pgTable(
  'extrinsics',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().generatedByDefaultAsIdentity(),
    blockId: bigint('block_id', { mode: 'number' }).notNull().references(() => blocks.id),
    extrinsicIndex: integer('extrinsic_index').notNull(),
    extrinsicId: varchar('extrinsic_id', { length: 64 }).notNull(),
    signerAddress: varchar('signer_address', { length: 128 }),
    section: varchar('section', { length: 64 }).notNull(),
    method: varchar('method', { length: 64 }).notNull(),
    argsJson: jsonb('args_json').$type<Record<string, unknown> | unknown[]>(),
    success: boolean('success').notNull().default(true),
    fee: numeric('fee', { precision: 38, scale: 0 }),
    hash: varchar('hash', { length: 80 }),
    timestamp: timestamp('timestamp', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    extrinsicsUnique: uniqueIndex('extrinsics_extrinsic_id_unique').on(table.extrinsicId),
    extrinsicsBlockIdx: index('extrinsics_block_id_idx').on(table.blockId),
    extrinsicsSignerIdx: index('extrinsics_signer_idx').on(table.signerAddress),
  }),
);

export const events = pgTable(
  'events',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().generatedByDefaultAsIdentity(),
    blockId: bigint('block_id', { mode: 'number' }).notNull().references(() => blocks.id),
    extrinsicId: varchar('extrinsic_id', { length: 64 }),
    eventIndex: integer('event_index').notNull(),
    eventId: varchar('event_id', { length: 64 }).notNull(),
    phase: varchar('phase', { length: 32 }),
    section: varchar('section', { length: 64 }).notNull(),
    method: varchar('method', { length: 64 }).notNull(),
    dataJson: jsonb('data_json').$type<Record<string, unknown> | unknown[]>(),
    timestamp: timestamp('timestamp', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    eventsUnique: uniqueIndex('events_event_id_unique').on(table.eventId),
    eventsBlockIdx: index('events_block_id_idx').on(table.blockId),
    eventsExtrinsicIdx: index('events_extrinsic_id_idx').on(table.extrinsicId),
  }),
);

export const transfers = pgTable(
  'transfers',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().generatedByDefaultAsIdentity(),
    extrinsicId: varchar('extrinsic_id', { length: 64 }),
    eventId: varchar('event_id', { length: 64 }),
    fromAddress: varchar('from_address', { length: 128 }),
    toAddress: varchar('to_address', { length: 128 }),
    amountRao: numeric('amount_rao', { precision: 38, scale: 0 }).notNull(),
    amountTao: numeric('amount_tao', { precision: 38, scale: 9 }).notNull(),
    blockHeight: bigint('block_height', { mode: 'number' }).notNull(),
    timestamp: timestamp('timestamp', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    transfersEventIdx: index('transfers_event_id_idx').on(table.eventId),
    transfersFromIdx: index('transfers_from_address_idx').on(table.fromAddress),
    transfersToIdx: index('transfers_to_address_idx').on(table.toAddress),
    transfersBlockIdx: index('transfers_block_height_idx').on(table.blockHeight),
  }),
);

export const syncState = pgTable('sync_state', {
  key: varchar('key', { length: 64 }).primaryKey(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

