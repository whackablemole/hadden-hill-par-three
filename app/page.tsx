import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-bold">Hadden Hill Scorekeeper</h1>
      <p className="mt-2 text-slate-700">
        Track your 6, 12, or 18-hole par-three rounds live.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link className="rounded bg-slate-900 px-4 py-2 text-white" href="/rounds/new">
          Start Round
        </Link>
        <Link className="rounded border border-slate-300 px-4 py-2" href="/rounds/history">
          Round History
        </Link>
        <Link className="rounded border border-slate-300 px-4 py-2" href="/stats">
          Overall Stats
        </Link>
      </div>
    </main>
  );
}
