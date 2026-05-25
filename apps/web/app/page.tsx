import type { ReactNode } from 'react';

type BlockRow = {
  eventCount: number;
  extrinsicCount: number;
  hash: string;
  height: string;
  isFinalized: boolean;
  parentHash: string;
  specVersion: number;
  timestamp: string;
};

type ExtrinsicRow = {
  extrinsicId: string;
  extrinsicIndex: number;
  fee: string | null;
  hash: string | null;
  height: string;
  method: string;
  section: string;
  signerAddress: string | null;
  success: boolean;
  timestamp: string;
};

type EventRow = {
  eventId: string;
  eventIndex: number;
  extrinsicId: string | null;
  height: string;
  method: string;
  phase: string | null;
  section: string;
  timestamp: string;
};

type ExplorerData = {
  blocks: BlockRow[];
  error: string | null;
  events: EventRow[];
  extrinsics: ExtrinsicRow[];
};

const numberFormatter = new Intl.NumberFormat('en-US');

function truncateMiddle(value: string, start = 10, end = 8) {
  if (value.length <= start + end + 3) {
    return value;
  }

  return `${value.slice(0, start)}...${value.slice(-end)}`;
}

async function getExplorerData(): Promise<ExplorerData> {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ??
    'http://localhost:3001';

  try {
    const [blocksResponse, extrinsicsResponse, eventsResponse] = await Promise.all([
      fetch(`${baseUrl}/api/blocks?limit=8`, { cache: 'no-store' }),
      fetch(`${baseUrl}/api/extrinsics?limit=8`, { cache: 'no-store' }),
      fetch(`${baseUrl}/api/events?limit=8`, { cache: 'no-store' }),
    ]);

    if (!blocksResponse.ok || !extrinsicsResponse.ok || !eventsResponse.ok) {
      throw new Error('The API is not ready yet.');
    }

    const [blocks, extrinsics, events] = await Promise.all([
      blocksResponse.json() as Promise<BlockRow[]>,
      extrinsicsResponse.json() as Promise<ExtrinsicRow[]>,
      eventsResponse.json() as Promise<EventRow[]>,
    ]);

    return {
      blocks,
      error: null,
      events,
      extrinsics,
    };
  } catch (error) {
    return {
      blocks: [],
      error:
        error instanceof Error
          ? error.message
          : 'Unable to reach the API. Start the full platform command first.',
      events: [],
      extrinsics: [],
    };
  }
}

function SectionHeader({
  eyebrow,
  title,
  body,
}: {
  body: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.28em] text-accent">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-semibold text-white">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{body}</p>
    </div>
  );
}

function MetricCard({
  label,
  value,
  note,
}: {
  label: string;
  note: string;
  value: string;
}) {
  return (
    <article className="rounded-2xl border border-border bg-panel/80 p-5 shadow-lg shadow-black/10 backdrop-blur">
      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{label}</p>
      <p className="mt-4 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-300">{note}</p>
    </article>
  );
}

function TableCard({
  title,
  subtitle,
  columns,
  rows,
  empty,
}: {
  columns: string[];
  empty: string;
  rows: ReactNode;
  subtitle: string;
  title: string;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-panel/75 backdrop-blur">
      <div className="border-b border-border px-6 py-5">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="mt-1 text-sm text-slate-300">{subtitle}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/[0.03] text-slate-400">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-6 py-4 font-medium">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/80">
            {rows}
            {rows === null ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-10 text-center text-sm text-slate-400"
                >
                  {empty}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default async function HomePage() {
  const data = await getExplorerData();
  const latestBlock = data.blocks[0];
  const totalExtrinsics = data.blocks.reduce(
    (sum, block) => sum + Number(block.extrinsicCount),
    0,
  );
  const totalEvents = data.blocks.reduce(
    (sum, block) => sum + Number(block.eventCount),
    0,
  );

  return (
    <main className="min-h-screen px-6 py-10 text-foreground md:px-10">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-[2rem] border border-border bg-panel/80 p-8 shadow-2xl shadow-black/20 backdrop-blur">
          <p className="text-sm uppercase tracking-[0.3em] text-accent">BitAnalyze</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight text-white md:text-6xl">
            Live Bittensor explorer data, now wired into the platform instead of placeholder text.
          </h1>
          <p className="mt-5 max-w-3xl text-base text-slate-300 md:text-lg">
            This is still the early product, but the homepage now reads real block,
            extrinsic, and event data from the API so we can build toward a TaoStats-style
            platform with actual working surfaces.
          </p>

          {data.error ? (
            <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              API not reachable yet: {data.error}
            </div>
          ) : null}
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Latest Block"
            value={latestBlock ? numberFormatter.format(Number(latestBlock.height)) : '...'}
            note={latestBlock ? truncateMiddle(latestBlock.hash, 14, 10) : 'Waiting for sync'}
          />
          <MetricCard
            label="Visible Blocks"
            value={numberFormatter.format(data.blocks.length)}
            note="Rows currently shown on the homepage"
          />
          <MetricCard
            label="Visible Extrinsics"
            value={numberFormatter.format(totalExtrinsics)}
            note="Summed from the blocks shown below"
          />
          <MetricCard
            label="Visible Events"
            value={numberFormatter.format(totalEvents)}
            note="Summed from the blocks shown below"
          />
        </section>

        <section className="mt-12">
          <SectionHeader
            eyebrow="Explorer"
            title="Latest Blocks"
            body="These rows are coming from the Nest API backed by Postgres, which is being filled by the Bittensor indexer."
          />
          <div className="mt-6">
            <TableCard
              title="Blocks"
              subtitle="Finalized blocks recently synced into the local database."
              columns={['Height', 'Hash', 'Extrinsics', 'Events', 'Spec', 'Time']}
              empty="No blocks yet. Run the platform command and let the indexer sync."
              rows={
                data.blocks.length > 0
                  ? data.blocks.map((block) => (
                      <tr key={block.hash} className="text-slate-200">
                        <td className="px-6 py-4 font-medium text-white">
                          {numberFormatter.format(Number(block.height))}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-300">
                          {truncateMiddle(block.hash, 16, 12)}
                        </td>
                        <td className="px-6 py-4">{numberFormatter.format(Number(block.extrinsicCount))}</td>
                        <td className="px-6 py-4">{numberFormatter.format(Number(block.eventCount))}</td>
                        <td className="px-6 py-4">{block.specVersion}</td>
                        <td className="px-6 py-4 text-slate-400">{block.timestamp}</td>
                      </tr>
                    ))
                  : null
              }
            />
          </div>
        </section>

        <section className="mt-12 grid gap-8 xl:grid-cols-2">
          <div>
            <SectionHeader
              eyebrow="Transactions"
              title="Recent Extrinsics"
              body="Signed and unsigned chain actions with method, signer, and success status."
            />
            <div className="mt-6">
              <TableCard
                title="Extrinsics"
                subtitle="Recent chain calls extracted from synced blocks."
                columns={['ID', 'Method', 'Signer', 'Status']}
                empty="No extrinsics available yet."
                rows={
                  data.extrinsics.length > 0
                    ? data.extrinsics.map((extrinsic) => (
                        <tr key={extrinsic.extrinsicId} className="text-slate-200">
                          <td className="px-6 py-4 font-mono text-xs text-slate-300">
                            {extrinsic.extrinsicId}
                          </td>
                          <td className="px-6 py-4">
                            <span className="rounded-full border border-border bg-black/20 px-2 py-1 text-xs text-white">
                              {extrinsic.section}.{extrinsic.method}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-slate-300">
                            {extrinsic.signerAddress
                              ? truncateMiddle(extrinsic.signerAddress, 10, 8)
                              : 'Unsigned'}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-medium ${
                                extrinsic.success
                                  ? 'bg-emerald-500/15 text-emerald-300'
                                  : 'bg-rose-500/15 text-rose-300'
                              }`}
                            >
                              {extrinsic.success ? 'Success' : 'Failed'}
                            </span>
                          </td>
                        </tr>
                      ))
                    : null
                }
              />
            </div>
          </div>

          <div>
            <SectionHeader
              eyebrow="Events"
              title="Recent Events"
              body="Runtime events emitted during block execution, already linked back to extrinsics where possible."
            />
            <div className="mt-6">
              <TableCard
                title="Events"
                subtitle="Recent runtime outputs from synced finalized blocks."
                columns={['Event', 'Method', 'Linked Extrinsic', 'Phase']}
                empty="No events available yet."
                rows={
                  data.events.length > 0
                    ? data.events.map((event) => (
                        <tr key={event.eventId} className="text-slate-200">
                          <td className="px-6 py-4 font-mono text-xs text-slate-300">
                            {event.eventId}
                          </td>
                          <td className="px-6 py-4">
                            <span className="rounded-full border border-border bg-black/20 px-2 py-1 text-xs text-white">
                              {event.section}.{event.method}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-slate-300">
                            {event.extrinsicId ?? 'Block-level'}
                          </td>
                          <td className="px-6 py-4 text-slate-400">
                            {event.phase ? truncateMiddle(event.phase, 12, 8) : 'N/A'}
                          </td>
                        </tr>
                      ))
                    : null
                }
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
