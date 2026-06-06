import Link from "next/link";
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
	friendUserId: string;
	rounds: FriendRoundSummary[];
}

export function FriendRoundsHistory( { friendUserId, rounds }: FriendRoundsHistoryProps ) {
	return (
		<section className="rounded border border-slate-200 bg-white p-4">
			<h2 className="text-lg font-semibold text-slate-900">Round history</h2>
			{ rounds.length === 0 ? (
				<p className="mt-2 text-sm text-slate-600">No completed rounds are available for this friend yet.</p>
			) : (
				<div className="mt-3 space-y-3">
					{ rounds.map( ( round ) => (
						<Link className="block rounded outline-none transition hover:opacity-95 focus-visible:ring-2 focus-visible:ring-teal-600" href={ `/friends/${ friendUserId }/rounds/${ round.id }` } key={ round.id }>
							<RoundSummaryCard round={ round } compact />
						</Link>
					) ) }
				</div>
			) }
		</section>
	);
}
