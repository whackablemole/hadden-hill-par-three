import { RoundSummaryCard } from "@/components/stats/RoundSummaryCard";

interface FriendRoundSummary {
	id: string;
	playedOn: string;
	targetHoleCount: number;
	status: "IN_PROGRESS" | "COMPLETED";
	totalStrokes: number;
	totalPutts: number;
	averagePuttsPerHole: number;
	totalBirdies: number;
	totalPars: number;
	totalBogeys: number;
	totalDoubleBogeys: number;
	totalTripleBogeyPlus: number;
}

interface FriendRoundsHistoryProps {
	rounds: FriendRoundSummary[];
}

export function FriendRoundsHistory( { rounds }: FriendRoundsHistoryProps ) {
	return (
		<section className="rounded border border-slate-200 bg-white p-4">
			<h2 className="text-lg font-semibold text-slate-900">Previous rounds</h2>
			{ rounds.length === 0 ? (
				<p className="mt-2 text-sm text-slate-600">No completed rounds are available for this friend yet.</p>
			) : (
				<div className="mt-3 space-y-3">
					{ rounds.map( ( round ) => (
						<RoundSummaryCard key={ round.id } round={ round } compact />
					) ) }
				</div>
			) }
		</section>
	);
}
