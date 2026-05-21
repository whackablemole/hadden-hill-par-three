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
	compact?: boolean;
}

function getOrdinalSuffix( day: number ) {
	if ( day >= 11 && day <= 13 ) {
		return "th";
	}

	const lastDigit = day % 10;
	if ( lastDigit === 1 ) {
		return "st";
	}
	if ( lastDigit === 2 ) {
		return "nd";
	}
	if ( lastDigit === 3 ) {
		return "rd";
	}

	return "th";
}

function formatRoundTitleDate( playedOn: string ) {
	const date = new Date( playedOn );
	const weekday = new Intl.DateTimeFormat( "en-GB", { weekday: "short", timeZone: "UTC" } ).format( date );
	const day = date.getUTCDate();
	const month = new Intl.DateTimeFormat( "en-GB", { month: "long", timeZone: "UTC" } ).format( date );
	const year = date.getUTCFullYear();

	return `${ weekday } ${ day }${ getOrdinalSuffix( day ) } ${ month } ${ year }`;
}

function getParRelativeLabel( totalStrokes: number, targetHoleCount: number ) {
	const par = targetHoleCount * 3;
	const difference = totalStrokes - par;

	if ( difference > 0 ) {
		return `+${ difference }`;
	}

	if ( difference < 0 ) {
		return `${ difference }`;
	}

	return "E";
}

export function RoundSummaryCard( { round, compact = false }: RoundSummaryCardProps ) {
	const isInProgress = round.status === "IN_PROGRESS";
	const statusLabel = isInProgress ? "In Progress" : round.status === "COMPLETED" ? "Completed" : round.status;
	const statusClassName = isInProgress
		? "bg-amber-100 text-amber-900 ring-1 ring-inset ring-amber-300"
		: "bg-emerald-100 text-emerald-900 ring-1 ring-inset ring-emerald-300";
	const titleDate = formatRoundTitleDate( round.playedOn );
	const parRelativeLabel = getParRelativeLabel( round.totalStrokes, round.targetHoleCount );
	const holePercentage = ( count: number ) => {
		if ( round.targetHoleCount <= 0 ) {
			return 0;
		}
		return ( count / round.targetHoleCount ) * 100;
	};
	const statCards = [
		{ label: "Total strokes", value: round.totalStrokes },
		{ label: "Total putts", value: round.totalPutts },
		{ label: "Average putts/hole", value: round.averagePuttsPerHole.toFixed( 2 ) },
		{ label: "Par relative", value: parRelativeLabel },
		{ label: "Birdies", value: round.totalBirdies, progressPercent: holePercentage( round.totalBirdies ) },
		{ label: "Pars", value: round.totalPars, progressPercent: holePercentage( round.totalPars ) },
		{ label: "Bogeys", value: round.totalBogeys, progressPercent: holePercentage( round.totalBogeys ) },
		{ label: "Double bogeys", value: round.totalDoubleBogeys, progressPercent: holePercentage( round.totalDoubleBogeys ) },
		{ label: "Triple bogeys", value: round.totalTripleBogeyPlus, progressPercent: holePercentage( round.totalTripleBogeyPlus ) },
	];

	if ( compact ) {
		return (
			<article className="rounded border border-slate-200 bg-white p-4">
				<div className="flex items-start justify-between gap-4">
					<div>
						<h3 className="font-semibold">{ titleDate }</h3>
						<div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600">
							<span>{ round.targetHoleCount } holes</span>
							<span className={ `inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${ statusClassName }` }>
								{ statusLabel }
							</span>
						</div>
					</div>
					{ !isInProgress ? (
						<div className="flex min-w-24 flex-col items-center justify-center rounded-md bg-emerald-700 px-4 py-3 text-center">
							<p className="text-3xl font-semibold leading-none text-white">{ round.totalStrokes }</p>
							<p className="mt-1 text-xs font-medium text-slate-200">{ parRelativeLabel }</p>
						</div>
					) : null }
				</div>
			</article>
		);
	}

	return (
		<section className="space-y-3">
			<div className="rounded border border-slate-200 bg-white p-4">
				<h3 className="font-semibold">{ titleDate }</h3>
				<div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600">
					<span>{ round.targetHoleCount } holes</span>
					<span className={ `inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${ statusClassName }` }>
						{ statusLabel }
					</span>
				</div>
			</div>
			<div className="grid grid-cols-2 gap-3">
				{ statCards.map( ( stat ) => (
					<article className="rounded border border-slate-200 bg-white p-4" key={ stat.label }>
						<p className="text-sm text-slate-600">{ stat.label }</p>
						<p className="mt-1 text-2xl font-semibold text-slate-900">{ stat.value }</p>
						{ typeof stat.progressPercent === "number" ? (
							<div className="mt-3">
								<div className="h-2 w-full rounded-full bg-slate-200">
									<div
										className="h-2 rounded-full bg-emerald-600"
										style={ { width: `${ Math.max( 0, Math.min( stat.progressPercent, 100 ) ) }%` } }
									/>
								</div>
								<p className="mt-1 text-xs text-slate-600">{ stat.progressPercent.toFixed( 1 ) }%</p>
							</div>
						) : null }
					</article>
				) ) }
			</div>
		</section>
	);
}
