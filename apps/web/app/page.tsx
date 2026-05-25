const cards = [
  {
    title: 'Explorer',
    body: 'Blocks, transfers, events, extrinsics, and account inspection.',
  },
  {
    title: 'Subnets',
    body: 'Historical snapshots, metagraph views, and subnet intelligence.',
  },
  {
    title: 'Validators',
    body: 'Validator rankings, stake distribution, and reward analysis.',
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen px-6 py-10 text-foreground md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl border border-border bg-panel/80 p-8 shadow-2xl shadow-black/20 backdrop-blur">
          <p className="text-sm uppercase tracking-[0.3em] text-accent">
            BitAnalyze
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">
            High-performance Bittensor analytics, explorer data, and subnet intelligence.
          </h1>
          <p className="mt-5 max-w-2xl text-base text-slate-300 md:text-lg">
            This scaffold sets up the web app, API, indexer, database package,
            and local infrastructure for the platform rebuild.
          </p>
        </div>

        <section className="mt-8 grid gap-6 md:grid-cols-3">
          {cards.map((card) => (
            <article
              key={card.title}
              className="rounded-2xl border border-border bg-black/20 p-6 backdrop-blur-sm"
            >
              <h2 className="text-xl font-semibold">{card.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">{card.body}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

