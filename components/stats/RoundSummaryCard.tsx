import { AnimatedProgressBar } from "@/components/ui/AnimatedProgressBar";

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
		totalGir?: number;
		holeEntries?: Array<{
			greenInRegulation: boolean;
			putts?: number;
		}>;
	};
	compact?: boolean;
	hideHeader?: boolean;
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

export function RoundSummaryCard( { round, compact = false, hideHeader = false }: RoundSummaryCardProps ) {
	const isInProgress = round.status === "IN_PROGRESS";
	const statusLabel = isInProgress ? "In Progress" : round.status === "COMPLETED" ? "Completed" : round.status;
	const statusClassName = isInProgress
		? "bg-amber-100 text-amber-900 ring-1 ring-inset ring-amber-300"
		: "bg-teal-100 text-teal-900 ring-1 ring-inset ring-teal-300";
	const titleDate = formatRoundTitleDate( round.playedOn );
	const parRelativeLabel = getParRelativeLabel( round.totalStrokes, round.targetHoleCount );
	const averageStrokesPerHole = round.targetHoleCount <= 0 ? 0 : round.totalStrokes / round.targetHoleCount;
	const holePercentage = ( count: number ) => {
		if ( round.targetHoleCount <= 0 ) {
			return 0;
		}
		return ( count / round.targetHoleCount ) * 100;
	};
	const derivedGirCount = round.holeEntries?.filter( ( entry ) => entry.greenInRegulation ).length;
	const totalGir = typeof round.totalGir === "number" ? round.totalGir : derivedGirCount;
	const summaryStatCards = [
		{ label: "Total strokes", value: round.totalStrokes },
		{ label: "Average strokes/hole", value: averageStrokesPerHole.toFixed( 2 ) },
		{ label: "Total putts", value: round.totalPutts },
		{ label: "Average putts/hole", value: round.averagePuttsPerHole.toFixed( 2 ) },
		{ label: "Par relative", value: parRelativeLabel },
		...( typeof totalGir === "number" ? [ { label: "GIR", value: totalGir, progressPercent: holePercentage( totalGir ) } ] : [] ),
	];
	const scoreTypeStats = [
		{ label: "Birdies", value: round.totalBirdies, progressPercent: holePercentage( round.totalBirdies ) },
		{ label: "Pars", value: round.totalPars, progressPercent: holePercentage( round.totalPars ) },
		{ label: "Bogeys", value: round.totalBogeys, progressPercent: holePercentage( round.totalBogeys ) },
		{ label: "Double bogeys", value: round.totalDoubleBogeys, progressPercent: holePercentage( round.totalDoubleBogeys ) },
		{ label: "Triple bogeys", value: round.totalTripleBogeyPlus, progressPercent: holePercentage( round.totalTripleBogeyPlus ) },
	];
	const puttBuckets = ( round.holeEntries ?? [] ).reduce(
		( totals, entry ) => {
			const putts = typeof entry.putts === "number" ? entry.putts : 0;
			if ( putts <= 1 ) {
				totals.one += 1;
			} else if ( putts === 2 ) {
				totals.two += 1;
			} else if ( putts === 3 ) {
				totals.three += 1;
			} else {
				totals.fourPlus += 1;
			}
			return totals;
		},
		{ one: 0, two: 0, three: 0, fourPlus: 0 },
	);
	const puttTypeStats = [
		{ label: "One putts", value: puttBuckets.one, progressPercent: holePercentage( puttBuckets.one ) },
		{ label: "Two putts", value: puttBuckets.two, progressPercent: holePercentage( puttBuckets.two ) },
		{ label: "Three putts", value: puttBuckets.three, progressPercent: holePercentage( puttBuckets.three ) },
		{ label: "4+ putts", value: puttBuckets.fourPlus, progressPercent: holePercentage( puttBuckets.fourPlus ) },
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
						<div className="flex min-w-24 flex-col items-center justify-center rounded-md bg-teal-700 px-4 py-3 text-center">
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
			{ !hideHeader ? (
				<div className="rounded border border-slate-200 bg-white p-4">
					<h3 className="font-semibold">{ titleDate }</h3>
					<div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600">
						<span>{ round.targetHoleCount } holes</span>
						<span className={ `inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${ statusClassName }` }>
							{ statusLabel }
						</span>
					</div>
				</div>
			) : null }
			<div className="grid grid-cols-2 gap-3">
				{ summaryStatCards.map( ( stat ) => (
					<article className="rounded border border-slate-200 bg-white p-4" key={ stat.label }>
						<p className="text-sm text-slate-600">{ stat.label }</p>
						<p className="mt-1 text-2xl font-semibold text-slate-900">{ stat.value }</p>
						{ typeof stat.progressPercent === "number" ? (
							<div className="mt-3">
								<AnimatedProgressBar percentage={ stat.progressPercent } />
								<p className="mt-1 text-xs text-slate-600">{ stat.progressPercent.toFixed( 1 ) }%</p>
							</div>
						) : null }
					</article>
				) ) }
			</div>
			<article className="rounded border border-slate-200 bg-white p-4">
				<h4 className="text-sm font-semibold text-slate-800">Score breakdown</h4>
				<div className="mt-3 space-y-3">
					{ scoreTypeStats.map( ( stat ) => (
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
			</article>
			{ round.holeEntries && round.holeEntries.length > 0 ? (
				<article className="rounded border border-slate-200 bg-white p-4">
					<h4 className="text-sm font-semibold text-slate-800">Putt breakdown</h4>
					<div className="mt-3 space-y-3">
						{ puttTypeStats.map( ( stat ) => (
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
				</article>
			) : null }
		</section>
	);
}
