"use client";

import { FormEvent, useState } from "react";

export interface HoleEntryPayload {
  strokes: number;
  penalties: number;
  bunkers: number;
  putts: number;
  greenInRegulation: boolean;
}

interface HoleEntryFormProps {
  onSave: (payload: HoleEntryPayload) => Promise<void>;
}

export function HoleEntryForm({ onSave }: HoleEntryFormProps) {
  const [form, setForm] = useState<HoleEntryPayload>({
    strokes: 3,
    penalties: 0,
    bunkers: 0,
    putts: 2,
    greenInRegulation: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    try {
      await onSave(form);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="grid gap-3 rounded border border-slate-200 bg-white p-4" onSubmit={submit}>
      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm">
          Strokes
          <input
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1"
            type="number"
            min={1}
            value={form.strokes}
            onChange={(e) => setForm({ ...form, strokes: Number(e.target.value) })}
          />
        </label>
        <label className="text-sm">
          Putts
          <input
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1"
            type="number"
            min={0}
            value={form.putts}
            onChange={(e) => setForm({ ...form, putts: Number(e.target.value) })}
          />
        </label>
        <label className="text-sm">
          Penalties
          <input
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1"
            type="number"
            min={0}
            value={form.penalties}
            onChange={(e) => setForm({ ...form, penalties: Number(e.target.value) })}
          />
        </label>
        <label className="text-sm">
          Bunkers
          <input
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1"
            type="number"
            min={0}
            value={form.bunkers}
            onChange={(e) => setForm({ ...form, bunkers: Number(e.target.value) })}
          />
        </label>
      </div>
      <label className="inline-flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.greenInRegulation}
          onChange={(e) => setForm({ ...form, greenInRegulation: e.target.checked })}
        />
        Green in regulation
      </label>
      <button className="rounded bg-slate-900 px-3 py-2 text-white" type="submit" disabled={isSaving}>
        {isSaving ? "Saving..." : "Save hole"}
      </button>
    </form>
  );
}
