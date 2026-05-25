import { Injectable, NotFoundException } from '@nestjs/common';
import { queryClient } from '@bitanalyze/db/client';

@Injectable()
export class ExplorerService {
  async listBlocks(limit = 20) {
    const safeLimit = Math.max(1, Math.min(limit, 100));

    return queryClient<{
      eventCount: number;
      extrinsicCount: number;
      hash: string;
      height: number;
      isFinalized: boolean;
      parentHash: string;
      specVersion: number;
      timestamp: string;
    }[]>`
      select
        height,
        hash,
        parent_hash as "parentHash",
        spec_version as "specVersion",
        timestamp::text as timestamp,
        extrinsic_count as "extrinsicCount",
        event_count as "eventCount",
        is_finalized as "isFinalized"
      from blocks
      order by height desc
      limit ${safeLimit}
    `;
  }

  async getBlock(heightOrHash: string) {
    const isHeight = /^\d+$/.test(heightOrHash);

    const [block] = isHeight
      ? await queryClient<{
          eventCount: number;
          extrinsicCount: number;
          hash: string;
          height: number;
          id: number;
          isFinalized: boolean;
          parentHash: string;
          specVersion: number;
          timestamp: string;
        }[]>`
          select
            id,
            height,
            hash,
            parent_hash as "parentHash",
            spec_version as "specVersion",
            timestamp::text as timestamp,
            extrinsic_count as "extrinsicCount",
            event_count as "eventCount",
            is_finalized as "isFinalized"
          from blocks
          where height = ${Number(heightOrHash)}
          limit 1
        `
      : await queryClient<{
          eventCount: number;
          extrinsicCount: number;
          hash: string;
          height: number;
          id: number;
          isFinalized: boolean;
          parentHash: string;
          specVersion: number;
          timestamp: string;
        }[]>`
          select
            id,
            height,
            hash,
            parent_hash as "parentHash",
            spec_version as "specVersion",
            timestamp::text as timestamp,
            extrinsic_count as "extrinsicCount",
            event_count as "eventCount",
            is_finalized as "isFinalized"
          from blocks
          where hash = ${heightOrHash}
          limit 1
        `;

    if (!block) {
      throw new NotFoundException(`Block ${heightOrHash} not found`);
    }

    const blockExtrinsics = await queryClient<{
      argsJson: unknown;
      extrinsicId: string;
      extrinsicIndex: number;
      fee: string | null;
      hash: string | null;
      method: string;
      section: string;
      signerAddress: string | null;
      success: boolean;
      timestamp: string;
    }[]>`
      select
        extrinsic_id as "extrinsicId",
        extrinsic_index as "extrinsicIndex",
        signer_address as "signerAddress",
        section,
        method,
        args_json as "argsJson",
        success,
        fee::text as fee,
        hash,
        timestamp::text as timestamp
      from extrinsics
      where block_id = ${block.id}
      order by extrinsic_index asc
    `;

    const blockEvents = await queryClient<{
      dataJson: unknown;
      eventId: string;
      eventIndex: number;
      extrinsicId: string | null;
      method: string;
      phase: string | null;
      section: string;
      timestamp: string;
    }[]>`
      select
        event_id as "eventId",
        event_index as "eventIndex",
        extrinsic_id as "extrinsicId",
        phase,
        section,
        method,
        data_json as "dataJson",
        timestamp::text as timestamp
      from events
      where block_id = ${block.id}
      order by event_index asc
    `;

    return {
      ...block,
      events: blockEvents,
      extrinsics: blockExtrinsics,
    };
  }

  async listExtrinsics(limit = 20) {
    const safeLimit = Math.max(1, Math.min(limit, 100));

    return queryClient<{
      extrinsicId: string;
      extrinsicIndex: number;
      fee: string | null;
      hash: string | null;
      height: number;
      method: string;
      section: string;
      signerAddress: string | null;
      success: boolean;
      timestamp: string;
    }[]>`
      select
        e.extrinsic_id as "extrinsicId",
        e.extrinsic_index as "extrinsicIndex",
        e.signer_address as "signerAddress",
        e.section,
        e.method,
        e.success,
        e.fee::text as fee,
        e.hash,
        e.timestamp::text as timestamp,
        b.height
      from extrinsics e
      join blocks b on b.id = e.block_id
      order by b.height desc, e.extrinsic_index desc
      limit ${safeLimit}
    `;
  }

  async listEvents(limit = 20) {
    const safeLimit = Math.max(1, Math.min(limit, 100));

    return queryClient<{
      eventId: string;
      eventIndex: number;
      extrinsicId: string | null;
      height: number;
      method: string;
      phase: string | null;
      section: string;
      timestamp: string;
    }[]>`
      select
        e.event_id as "eventId",
        e.event_index as "eventIndex",
        e.extrinsic_id as "extrinsicId",
        e.phase,
        e.section,
        e.method,
        e.timestamp::text as timestamp,
        b.height
      from events e
      join blocks b on b.id = e.block_id
      order by b.height desc, e.event_index desc
      limit ${safeLimit}
    `;
  }
}

