"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { HoleEntryForm, HoleEntryPayload } from "@/components/round-entry/HoleEntryForm";
import { RoundProgress } from "@/components/round-entry/RoundProgress";
import { RoundSummaryCard } from "@/components/stats/RoundSummaryCard";
import { saveHoleEntry } from "@/lib/rounds/saveHoleEntry";

interface RoundData {
  id: string;
  status: "IN_PROGRESS" | "COMPLETED";
  targetHoleCount: number;
  playedOn: string;
  totalStrokes: number;
  totalPutts: number;
  averagePuttsPerHole: number;
  totalBirdies: number;
  totalPars: number;
  totalBogeys: number;
  totalDoubleBogeys: number;
  totalTripleBogeyPlus: number;
  holeEntries: Array<{ holeSequence: number }>;
}

export default function RoundDetailPage() {
  const params = useParams<{ roundId: string }>();
  const roundId = params.roundId;
  const [round, setRound] = useState<RoundData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedHole, setSelectedHole] = useState(1);

  const loadRound = useCallback(async () => {
    setError(null);
    const response = await fetch(`/api/rounds/${roundId}`, { cache: "no-store" });
    if (!response.ok) {
      setError("Unable to load round");
      return;
    }

    const data: RoundData = await response.json();
    setRound(data);
  }, [roundId]);

  useEffect(() => {
    loadRound().catch(() => setError("Unable to load round"));
  }, [loadRound]);

  const enteredHoles = useMemo(() => new Set(round?.holeEntries.map((h) => h.holeSequence) ?? []), [round]);

  async function onSave(payload: HoleEntryPayload) {
    await saveHoleEntry(roundId, selectedHole, payload);
    await loadRound();
  }

  async function onComplete() {
    const response = await fetch(`/api/rounds/${roundId}/complete`, { method: "POST" });
    if (!response.ok) {
      alert("Round is incomplete. Enter all holes first.");
      return;
    }
    await loadRound();
  }

  if (error) {
    return <main className="mx-auto max-w-3xl p-6 text-red-600">{error}</main>;
  }

  if (!round) {
    return <main className="mx-auto max-w-3xl p-6">Loading...</main>;
  }

  return (
    <main className="mx-auto max-w-3xl space-y-4 p-6">
      <h1 className="text-2xl font-bold">Round details</h1>

      <RoundProgress current={Math.min(selectedHole, round.targetHoleCount)} total={round.targetHoleCount} />

      {round.status === "IN_PROGRESS" ? (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium" htmlFor="hole-select">Hole</label>
            <select
              id="hole-select"
              className="rounded border border-slate-300 px-2 py-1"
              value={selectedHole}
              onChange={(e) => setSelectedHole(Number(e.target.value))}
            >
              {Array.from({ length: round.targetHoleCount }, (_, idx) => idx + 1).map((value) => (
                <option key={value} value={value}>
                  Hole {value}{enteredHoles.has(value) ? " (saved)" : ""}
                </option>
              ))}
            </select>
          </div>

          <HoleEntryForm onSave={onSave} />

          <button className="rounded bg-emerald-700 px-4 py-2 text-white" onClick={onComplete} type="button">
            Complete round
          </button>
        </section>
      ) : null}

      <RoundSummaryCard round={round} />
    </main>
  );
}
