import 'dotenv/config';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { db, closeDbConnection, queryClient } from '@bitanalyze/db/client';
import {
  accounts,
  blocks,
  events,
  extrinsics,
  syncState,
  transfers,
} from '@bitanalyze/db/schema';
import pino from 'pino';

const logger = pino({
  name: 'bitanalyze-indexer',
  transport:
    process.env.NODE_ENV === 'development'
      ? { target: 'pino-pretty' }
      : undefined,
});

const TAO_DECIMALS = 9n;
const TAO_BASE = 10n ** TAO_DECIMALS;

type ChainBlockRecord = {
  blockHash: string;
  eventCount: number;
  extrinsicCount: number;
  extrinsicsRoot: string;
  finalized: boolean;
  height: number;
  parentHash: string;
  specVersion: number;
  stateRoot: string;
  timestamp: Date;
};

type EventRecordLike = {
  event: {
    data: Array<{ toString(): string }>;
    method: string;
    section: string;
    toJSON?: () => unknown;
  };
  phase: {
    asApplyExtrinsic?: { toNumber(): number };
    isApplyExtrinsic?: boolean;
    toString(): string;
  };
};

type ExtrinsicLike = {
  hash?: { toHex(): string };
  isSigned?: boolean;
  method: {
    args?: { toJSON(): unknown };
    method: string;
    section: string;
  };
  signer?: { toString(): string };
};

type FinalizedBlockPayload = {
  block: ChainBlockRecord;
  eventRecords: EventRecordLike[];
  signedExtrinsics: ExtrinsicLike[];
};

function parseBlockTimestamp(eventRecords: EventRecordLike[]) {
  for (const record of eventRecords) {
    const { event } = record;

    if (event.section === 'timestamp' && event.method === 'Set') {
      const firstArg = event.data[0];
      if (firstArg) {
        const millis = Number(firstArg.toString());
        if (!Number.isNaN(millis)) {
          return new Date(millis);
        }
      }
    }
  }

  return new Date();
}

function getExtrinsicIndexFromPhase(phase: EventRecordLike['phase']) {
  if (phase.isApplyExtrinsic && phase.asApplyExtrinsic) {
    return phase.asApplyExtrinsic.toNumber();
  }

  return null;
}

function formatRaoToTao(value: string) {
  const rao = BigInt(value);
  const sign = rao < 0n ? '-' : '';
  const absolute = rao < 0n ? -rao : rao;
  const whole = absolute / TAO_BASE;
  const fraction = absolute % TAO_BASE;

  return `${sign}${whole.toString()}.${fraction.toString().padStart(Number(TAO_DECIMALS), '0')}`;
}

function safeJson(value: unknown) {
  return JSON.parse(JSON.stringify(value ?? null)) as Record<string, unknown> | unknown[] | null;
}

function getTransferDetails(eventRecord: EventRecordLike) {
  const isTransferEvent =
    eventRecord.event.method === 'Transfer' &&
    (eventRecord.event.section === 'balances' ||
      eventRecord.event.section === 'subtensorModule');

  if (!isTransferEvent || eventRecord.event.data.length < 3) {
    return null;
  }

  const [from, to, amount] = eventRecord.event.data;
  if (!from || !to || !amount) {
    return null;
  }

  const amountRao = amount.toString();

  return {
    amountRao,
    amountTao: formatRaoToTao(amountRao),
    fromAddress: from.toString(),
    toAddress: to.toString(),
  };
}

function getExtrinsicSuccess(eventRecords: EventRecordLike[], extrinsicIndex: number) {
  const relatedEvents = eventRecords.filter(
    (record) => getExtrinsicIndexFromPhase(record.phase) === extrinsicIndex,
  );

  const failed = relatedEvents.some(
    (record) =>
      record.event.section === 'system' && record.event.method === 'ExtrinsicFailed',
  );

  return !failed;
}

function getExtrinsicFee(eventRecords: EventRecordLike[], extrinsicIndex: number) {
  const feeEvent = eventRecords.find(
    (record) =>
      getExtrinsicIndexFromPhase(record.phase) === extrinsicIndex &&
      record.event.section === 'transactionPayment' &&
      record.event.method === 'TransactionFeePaid',
  );

  const feeValue = feeEvent?.event.data[1]?.toString();
  return feeValue ?? null;
}

async function createApi() {
  const wsUrl =
    process.env.BITTENSOR_WS_URL ?? 'wss://entrypoint-finney.opentensor.ai:443';
  const provider = new WsProvider(wsUrl);
  const api = await ApiPromise.create({ provider });
  await api.isReady;

  return api;
}

async function fetchLatestFinalizedBlock(api: ApiPromise): Promise<FinalizedBlockPayload> {
  const finalizedHash = await api.rpc.chain.getFinalizedHead();
  const signedBlock = await api.rpc.chain.getBlock(finalizedHash);
  const header = signedBlock.block.header;
  const runtimeVersion = await api.rpc.state.getRuntimeVersion(finalizedHash);
  const systemQuery = api.query.system as unknown as {
    events: {
      at(hash: unknown): Promise<unknown>;
    };
  };
  const eventRecordsCodec = await systemQuery.events.at(finalizedHash);
  const eventRecords = Array.from(
    eventRecordsCodec as unknown as Iterable<EventRecordLike>,
  );

  return {
    block: {
      blockHash: finalizedHash.toString(),
      eventCount: eventRecords.length,
      extrinsicCount: signedBlock.block.extrinsics.length,
      extrinsicsRoot: header.extrinsicsRoot.toString(),
      finalized: true,
      height: header.number.toNumber(),
      parentHash: header.parentHash.toString(),
      specVersion: runtimeVersion.specVersion.toNumber(),
      stateRoot: header.stateRoot.toString(),
      timestamp: parseBlockTimestamp(eventRecords),
    },
    eventRecords,
    signedExtrinsics: signedBlock.block.extrinsics as unknown as ExtrinsicLike[],
  };
}

async function persistBlock(block: ChainBlockRecord) {
  const [savedBlock] = await db
    .insert(blocks)
    .values({
      height: block.height,
      hash: block.blockHash,
      parentHash: block.parentHash,
      stateRoot: block.stateRoot,
      extrinsicsRoot: block.extrinsicsRoot,
      specVersion: block.specVersion,
      timestamp: block.timestamp,
      extrinsicCount: block.extrinsicCount,
      eventCount: block.eventCount,
      isFinalized: block.finalized,
      metadata: {
        source: 'latest-finalized-sync',
      },
    })
    .onConflictDoUpdate({
      target: blocks.height,
      set: {
        hash: block.blockHash,
        parentHash: block.parentHash,
        stateRoot: block.stateRoot,
        extrinsicsRoot: block.extrinsicsRoot,
        specVersion: block.specVersion,
        timestamp: block.timestamp,
        extrinsicCount: block.extrinsicCount,
        eventCount: block.eventCount,
        isFinalized: block.finalized,
        metadata: {
          source: 'latest-finalized-sync',
        },
      },
    })
    .returning({
      id: blocks.id,
      height: blocks.height,
      hash: blocks.hash,
    });

  if (!savedBlock) {
    throw new Error(`Failed to persist block ${block.height}`);
  }

  return savedBlock;
}

async function clearExistingBlockData(blockHeight: number, blockId: number) {
  await queryClient`
    delete from transfers
    where block_height = ${blockHeight}
  `;

  await queryClient`
    delete from events
    where block_id = ${blockId}
  `;

  await queryClient`
    delete from extrinsics
    where block_id = ${blockId}
  `;
}

async function upsertAccounts(addresses: Iterable<string>, blockHeight: number) {
  const uniqueAddresses = [...new Set([...addresses].filter(Boolean))];

  if (uniqueAddresses.length === 0) {
    return;
  }

  await db
    .insert(accounts)
    .values(
      uniqueAddresses.map((address) => ({
        address,
        firstSeenBlockHeight: blockHeight,
        lastSeenBlockHeight: blockHeight,
      })),
    )
    .onConflictDoUpdate({
      target: accounts.address,
      set: {
        lastSeenBlockHeight: blockHeight,
        updatedAt: new Date(),
      },
    });
}

async function persistExplorerData(
  blockRow: { id: number; height: number; hash: string },
  payload: FinalizedBlockPayload,
) {
  await clearExistingBlockData(blockRow.height, blockRow.id);

  const discoveredAccounts = new Set<string>();

  for (const [index, extrinsic] of payload.signedExtrinsics.entries()) {
    const signerAddress =
      extrinsic.isSigned && extrinsic.signer ? extrinsic.signer.toString() : null;

    if (signerAddress) {
      discoveredAccounts.add(signerAddress);
    }

    await db.insert(extrinsics).values({
      blockId: blockRow.id,
      extrinsicIndex: index,
      extrinsicId: `${blockRow.height}-${index}`,
      signerAddress,
      section: extrinsic.method.section,
      method: extrinsic.method.method,
      argsJson: safeJson(extrinsic.method.args?.toJSON?.() ?? []),
      success: getExtrinsicSuccess(payload.eventRecords, index),
      fee: getExtrinsicFee(payload.eventRecords, index),
      hash: extrinsic.hash?.toHex() ?? null,
      timestamp: payload.block.timestamp,
    });
  }

  for (const [eventIndex, eventRecord] of payload.eventRecords.entries()) {
    const relatedExtrinsicIndex = getExtrinsicIndexFromPhase(eventRecord.phase);
    const relatedExtrinsicId =
      relatedExtrinsicIndex === null
        ? null
        : `${blockRow.height}-${relatedExtrinsicIndex}`;
    const eventId = `${blockRow.height}-${eventIndex}`;

    await db.insert(events).values({
      blockId: blockRow.id,
      extrinsicId: relatedExtrinsicId,
      eventIndex,
      eventId,
      phase: eventRecord.phase.toString(),
      section: eventRecord.event.section,
      method: eventRecord.event.method,
      dataJson: safeJson(
        eventRecord.event.toJSON?.() ?? eventRecord.event.data.map((value) => value.toString()),
      ),
      timestamp: payload.block.timestamp,
    });

    const transfer = getTransferDetails(eventRecord);
    if (transfer) {
      discoveredAccounts.add(transfer.fromAddress);
      discoveredAccounts.add(transfer.toAddress);

      await db.insert(transfers).values({
        extrinsicId: relatedExtrinsicId,
        eventId,
        fromAddress: transfer.fromAddress,
        toAddress: transfer.toAddress,
        amountRao: transfer.amountRao,
        amountTao: transfer.amountTao,
        blockHeight: blockRow.height,
        timestamp: payload.block.timestamp,
      });
    }
  }

  await upsertAccounts(discoveredAccounts, blockRow.height);
}

async function writeSyncState(blockHeight: number) {
  await db
    .insert(syncState)
    .values({
      key: 'latest_finalized_block',
      value: String(blockHeight),
    })
    .onConflictDoUpdate({
      target: syncState.key,
      set: {
        value: String(blockHeight),
        updatedAt: new Date(),
      },
    });
}

async function readCurrentSyncState() {
  const [latestBlock] = await queryClient<{
    height: number;
    hash: string;
    timestamp: string;
  }[]>`
    select height, hash, timestamp::text as timestamp
    from blocks
    order by height desc
    limit 1
  `;

  const [latestState] = await queryClient<{
    key: string;
    value: string;
    updated_at: string;
  }[]>`
    select key, value, updated_at::text as updated_at
    from sync_state
    where key = 'latest_finalized_block'
    limit 1
  `;

  return { latestBlock, latestState };
}

async function main() {
  const api = await createApi();

  try {
    const currentState = await readCurrentSyncState();
    logger.info(
      {
        latestBlock: currentState.latestBlock?.height ?? null,
        latestSyncState: currentState.latestState?.value ?? null,
      },
      'Starting latest block sync',
    );

    const payload = await fetchLatestFinalizedBlock(api);
    const savedBlock = await persistBlock(payload.block);

    await persistExplorerData(savedBlock, payload);
    await writeSyncState(savedBlock.height);

    logger.info(
      {
        blockHash: savedBlock.hash,
        eventCount: payload.block.eventCount,
        extrinsicCount: payload.block.extrinsicCount,
        height: savedBlock.height,
      },
      'Latest finalized block, extrinsics, events, and transfers persisted',
    );
  } finally {
    await api.disconnect();
    await closeDbConnection();
  }
}

main().catch((error) => {
  logger.error({ error }, 'Indexer failed to start');
  process.exit(1);
});
