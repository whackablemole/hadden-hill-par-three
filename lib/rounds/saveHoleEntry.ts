import { UpsertHoleEntryInput } from "@/lib/rounds/schemas";

export async function saveHoleEntry( roundId: string, holeSequence: number, payload: UpsertHoleEntryInput ) {
	const response = await fetch( `/api/rounds/${ roundId }/holes/${ holeSequence }`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify( payload ),
	} );

	if ( !response.ok ) {
		const fallback = "Failed to save hole entry";
		try {
			const data = await response.json();
			const message = data?.error?.message;
			throw new Error( typeof message === "string" ? message : fallback );
		} catch {
			throw new Error( fallback );
		}
	}

	return response.json();
}
