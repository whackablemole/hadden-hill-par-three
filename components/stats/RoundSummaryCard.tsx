interface RoundSummaryCardProps {
	round: {
		id: string;
		playedOn: string;
		targetHoleCount: number;
		status: string;
		totalStrokes: number;
		totalPutts: number;
		averagePuttsPerHole: number;
		totalBirdies: number;
		totalPars: number;
		totalBogeys: number;
		totalDoubleBogeys: number;
		totalTripleBogeyPlus: number;
	};
}

export function RoundSummaryCard( { round }: RoundSummaryCardProps ) {
	const isInProgress = round.status === "IN_PROGRESS";
	const statusLabel = isInProgress ? "In Progress" : round.status === "COMPLETED" ? "Completed" : round.status;
	const statusClassName = isInProgress
		? "bg-amber-100 text-amber-900 ring-1 ring-inset ring-amber-300"
		: "bg-emerald-100 text-emerald-900 ring-1 ring-inset ring-emerald-300";

	return (
		<article className="rounded border border-slate-200 bg-white p-4">
			<h3 className="font-semibold">Round { round.id.slice( 0, 8 ) }</h3>
			<div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600">
				<span>{ new Date( round.playedOn ).toLocaleDateString() } - { round.targetHoleCount } holes</span>
				<span className={ `inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${ statusClassName }` }>
					{ statusLabel }
				</span>
			</div>
			<dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
				<div><dt>Strokes</dt><dd className="font-medium">{ round.totalStrokes }</dd></div>
				<div><dt>Putts</dt><dd className="font-medium">{ round.totalPutts }</dd></div>
				<div><dt>Avg putts/hole</dt><dd className="font-medium">{ round.averagePuttsPerHole.toFixed( 2 ) }</dd></div>
				<div><dt>Birdies</dt><dd className="font-medium">{ round.totalBirdies }</dd></div>
				<div><dt>Pars</dt><dd className="font-medium">{ round.totalPars }</dd></div>
				<div><dt>Bogeys</dt><dd className="font-medium">{ round.totalBogeys }</dd></div>
				<div><dt>Double bogeys</dt><dd className="font-medium">{ round.totalDoubleBogeys }</dd></div>
				<div><dt>Triple+</dt><dd className="font-medium">{ round.totalTripleBogeyPlus }</dd></div>
			</dl>
		</article>
	);
}
