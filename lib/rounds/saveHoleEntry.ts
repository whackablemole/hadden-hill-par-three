import { UpsertHoleEntryInput } from "@/lib/rounds/schemas";

export async function saveHoleEntry(roundId: string, holeSequence: number, payload: UpsertHoleEntryInput) {
  const response = await fetch(`/api/rounds/${roundId}/holes/${holeSequence}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to save hole entry");
  }

  return response.json();
}
