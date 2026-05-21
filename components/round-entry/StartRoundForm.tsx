"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function StartRoundForm() {
  const router = useRouter();
  const [playedOn, setPlayedOn] = useState(new Date().toISOString().slice(0, 10));
  const [targetHoleCount, setTargetHoleCount] = useState<6 | 12 | 18>(6);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/rounds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playedOn, targetHoleCount }),
      });

      if (!response.ok) {
        throw new Error("Unable to create round");
      }

      const round = await response.json();
      router.push(`/rounds/${round.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create round");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div>
        <label className="mb-1 block text-sm font-medium">Date</label>
        <input
          className="w-full rounded border border-slate-300 px-3 py-2"
          type="date"
          value={playedOn}
          onChange={(e) => setPlayedOn(e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Total holes</label>
        <select
          className="w-full rounded border border-slate-300 px-3 py-2"
          value={targetHoleCount}
          onChange={(e) => setTargetHoleCount(Number(e.target.value) as 6 | 12 | 18)}
        >
          <option value={6}>6 holes</option>
          <option value={12}>12 holes</option>
          <option value={18}>18 holes</option>
        </select>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-60"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creating..." : "Start round"}
      </button>
    </form>
  );
}
