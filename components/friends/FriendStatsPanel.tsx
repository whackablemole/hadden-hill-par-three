import { AnimatedProgressBar } from "@/components/ui/AnimatedProgressBar";

interface FriendOverallStats {
	roundsPlayed: number;
	holesPlayed: number;
	totalStrokes: number;
	bestRoundSixHoles: number | null;
	totalPutts: number;
	totalOnePutts: number;
	totalTwoPutts: number;
	totalThreePutts: number;
	totalFourPlusPutts: number;
	totalGir: number;
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
	const holePercentage = ( count: number ) => {
		if ( stats.holesPlayed <= 0 || !Number.isFinite( count ) ) {
			return 0;
		}

		return ( count / stats.holesPlayed ) * 100;
	};

	const averageRoundSixHoles = stats.holesPlayed <= 0
		? 0
		: ( stats.totalStrokes / stats.holesPlayed ) * 6;

	const statCards = [
		{ label: "Rounds played", value: stats.roundsPlayed },
		{ label: "Holes played", value: stats.holesPlayed },
		{ label: "Best round (6 holes)", value: stats.bestRoundSixHoles ?? "-" },
		{ label: "Average round (6 holes)", value: Math.round( averageRoundSixHoles ) },
		{ label: "Putts per hole", value: stats.averagePuttsPerHole.toFixed( 2 ) },
		{ label: "GIR", value: stats.totalGir, progressPercent: holePercentage( stats.totalGir ) },
	];

	const scoreBreakdown = [
		{ label: "Birdies", value: stats.totalBirdies, progressPercent: holePercentage( stats.totalBirdies ) },
		{ label: "Pars", value: stats.totalPars, progressPercent: holePercentage( stats.totalPars ) },
		{ label: "Bogeys", value: stats.totalBogeys, progressPercent: holePercentage( stats.totalBogeys ) },
		{ label: "Double bogeys", value: stats.totalDoubleBogeys, progressPercent: holePercentage( stats.totalDoubleBogeys ) },
		{ label: "Triple bogeys", value: stats.totalTripleBogeyPlus, progressPercent: holePercentage( stats.totalTripleBogeyPlus ) },
	];

	const puttBreakdown = [
		{ label: "One putts", value: stats.totalOnePutts, progressPercent: holePercentage( stats.totalOnePutts ) },
		{ label: "Two putts", value: stats.totalTwoPutts, progressPercent: holePercentage( stats.totalTwoPutts ) },
		{ label: "Three putts", value: stats.totalThreePutts, progressPercent: holePercentage( stats.totalThreePutts ) },
		{ label: "4+ putts", value: stats.totalFourPlusPutts, progressPercent: holePercentage( stats.totalFourPlusPutts ) },
	];

	return (
		<>
			<div className="mt-4 grid grid-cols-2 gap-3">
				{ statCards.map( ( card ) => (
					<article className="rounded border border-slate-200 bg-white p-4" key={ card.label }>
						<p className="text-sm text-slate-600">{ card.label }</p>
						<p className="mt-1 text-2xl font-semibold text-slate-900">{ card.value }</p>
						{ typeof card.progressPercent === "number" ? (
							<div className="mt-3">
								<AnimatedProgressBar percentage={ card.progressPercent } />
								<p className="mt-1 text-xs text-slate-600">{ card.progressPercent.toFixed( 1 ) }%</p>
							</div>
						) : null }
					</article>
				) ) }
			</div>

			<section className="mt-6 rounded border border-slate-200 bg-white p-4">
				<h2 className="text-sm font-semibold text-slate-800">Score breakdown</h2>
				<div className="mt-3 space-y-3">
					{ scoreBreakdown.map( ( stat ) => (
						<div className="grid grid-cols-[6.75rem_3.5rem_minmax(0,1fr)] items-center gap-4" key={ stat.label }>
							<p className="text-sm text-slate-700">{ stat.label }</p>
							<p className="text-right text-sm font-semibold tabular-nums text-slate-900">{ stat.value }</p>
							<div className="min-w-0">
								<AnimatedProgressBar percentage={ stat.progressPercent } />
								<p className="mt-1 text-xs text-slate-600">{ stat.progressPercent.toFixed( 1 ) }%</p>
							</div>
						</div>
					) ) }
				</div>
			</section>

			<section className="mt-6 rounded border border-slate-200 bg-white p-4">
				<h2 className="text-sm font-semibold text-slate-800">Putt breakdown</h2>
				<div className="mt-3 space-y-3">
					{ puttBreakdown.map( ( stat ) => (
						<div className="grid grid-cols-[6.75rem_3.5rem_minmax(0,1fr)] items-center gap-4" key={ stat.label }>
							<p className="text-sm text-slate-700">{ stat.label }</p>
							<p className="text-right text-sm font-semibold tabular-nums text-slate-900">{ stat.value }</p>
							<div className="min-w-0">
								<AnimatedProgressBar percentage={ stat.progressPercent } />
								<p className="mt-1 text-xs text-slate-600">{ stat.progressPercent.toFixed( 1 ) }%</p>
							</div>
						</div>
					) ) }
				</div>
			</section>
		</>
	);
}
