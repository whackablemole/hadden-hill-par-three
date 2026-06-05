interface FriendOverallStats {
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

interface FriendStatsPanelProps {
	stats: FriendOverallStats;
}

export function FriendStatsPanel( { stats }: FriendStatsPanelProps ) {
	const statCards = [
		{ label: "Rounds played", value: stats.roundsPlayed },
		{ label: "Holes played", value: stats.holesPlayed },
		{ label: "Total strokes", value: stats.totalStrokes },
		{ label: "Total putts", value: stats.totalPutts },
		{ label: "Putts per hole", value: stats.averagePuttsPerHole.toFixed( 2 ) },
		{ label: "Birdies", value: stats.totalBirdies },
		{ label: "Pars", value: stats.totalPars },
		{ label: "Bogeys", value: stats.totalBogeys },
		{ label: "Double bogeys", value: stats.totalDoubleBogeys },
		{ label: "Triple+", value: stats.totalTripleBogeyPlus },
	];

	return (
		<section className="rounded border border-slate-200 bg-white p-4">
			<h2 className="text-lg font-semibold text-slate-900">Overall stats</h2>
			<div className="mt-3 grid grid-cols-2 gap-3">
				{ statCards.map( ( card ) => (
					<article className="rounded border border-slate-200 bg-slate-50 p-3" key={ card.label }>
						<p className="text-xs text-slate-600">{ card.label }</p>
						<p className="mt-1 text-lg font-semibold text-slate-900">{ card.value }</p>
					</article>
				) ) }
			</div>
		</section>
	);
}
