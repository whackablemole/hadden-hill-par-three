"use client";

import { useEffect, useState } from "react";

interface OverallStats {
  roundsPlayed: number;
  holesPlayed: number;
  totalStrokes: number;
  totalPutts: number;
  averagePuttsPerHole: number;
  totalBirdies: number;
  totalPars: number;
  totalBogeys: number;
  totalDoubleBogeys: number;
  totalTripleBogeyPlus: number;
}

export default function StatsPage() {
  const [stats, setStats] = useState<OverallStats | null>(null);

  useEffect(() => {
    fetch("/api/stats/overall", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => setStats(data))
      .catch(console.error);
  }, []);

  if (!stats) {
    return <main className="mx-auto max-w-3xl p-6">Loading stats...</main>;
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold">Overall stats</h1>
      <dl className="mt-4 grid grid-cols-2 gap-3 rounded border border-slate-200 bg-white p-4 text-sm">
        <div><dt>Rounds played</dt><dd className="font-medium">{stats.roundsPlayed}</dd></div>
        <div><dt>Holes played</dt><dd className="font-medium">{stats.holesPlayed}</dd></div>
        <div><dt>Total strokes</dt><dd className="font-medium">{stats.totalStrokes}</dd></div>
        <div><dt>Total putts</dt><dd className="font-medium">{stats.totalPutts}</dd></div>
        <div><dt>Average putts/hole</dt><dd className="font-medium">{stats.averagePuttsPerHole.toFixed(2)}</dd></div>
        <div><dt>Birdies</dt><dd className="font-medium">{stats.totalBirdies}</dd></div>
        <div><dt>Pars</dt><dd className="font-medium">{stats.totalPars}</dd></div>
        <div><dt>Bogeys</dt><dd className="font-medium">{stats.totalBogeys}</dd></div>
        <div><dt>Double bogeys</dt><dd className="font-medium">{stats.totalDoubleBogeys}</dd></div>
        <div><dt>Triple+</dt><dd className="font-medium">{stats.totalTripleBogeyPlus}</dd></div>
      </dl>
    </main>
  );
}
