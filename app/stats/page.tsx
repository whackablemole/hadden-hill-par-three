"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { classifyScore } from "@/lib/scoring/calculateRoundStats";

interface OverallStats {
	roundsPlayed: number;
	holesPlayed: number;
	totalStrokes: number;
	totalPutts: number;
	totalOnePutts: number;
	totalTwoPutts: number;
	totalThreePuttPlus: number;
	totalGir: number;
	averagePuttsPerHole: number;
	totalBirdies: number;
	totalPars: number;
	totalBogeys: number;
	totalDoubleBogeys: number;
	totalTripleBogeyPlus: number;
	mostFrequentScoreByHole: Array<{
		hole: number;
		score: number | null;
		count: number;
	}>;
	optimumRound: {
		holes: Array<{
			hole: number;
			bestScore: number | null;
		}>;
		totalStrokes: number | null;
	};
}

const numberOrZero = ( value: unknown ) => {
	if ( typeof value === "number" && Number.isFinite( value ) ) {
		return value;
	}
	if ( typeof value === "string" ) {
		const parsed = Number( value );
		return Number.isFinite( parsed ) ? parsed : 0;
	}
	return 0;
};

const normalizeStats = ( data: unknown ): OverallStats | null => {
	if ( !data || typeof data !== "object" ) {
		return null;
	}

	const raw = data as Record<string, unknown>;

	return {
		roundsPlayed: numberOrZero( raw.roundsPlayed ),
		holesPlayed: numberOrZero( raw.holesPlayed ),
		totalStrokes: numberOrZero( raw.totalStrokes ),
		totalPutts: numberOrZero( raw.totalPutts ),
		totalOnePutts: numberOrZero( raw.totalOnePutts ),
		totalTwoPutts: numberOrZero( raw.totalTwoPutts ),
		totalThreePuttPlus: numberOrZero( raw.totalThreePuttPlus ?? raw.totalThreePutts ?? raw.totalThreePuttOrMore ),
		totalGir: numberOrZero( raw.totalGir ?? raw.totalGIR ?? raw.totalGreenInRegulation ),
		averagePuttsPerHole: numberOrZero( raw.averagePuttsPerHole ),
		totalBirdies: numberOrZero( raw.totalBirdies ),
		totalPars: numberOrZero( raw.totalPars ),
		totalBogeys: numberOrZero( raw.totalBogeys ),
		totalDoubleBogeys: numberOrZero( raw.totalDoubleBogeys ),
		totalTripleBogeyPlus: numberOrZero( raw.totalTripleBogeyPlus ),
		mostFrequentScoreByHole: Array.isArray( raw.mostFrequentScoreByHole )
			? raw.mostFrequentScoreByHole.map( ( item, index ) => {
				const value = ( item && typeof item === "object" ? item : {} ) as Record<string, unknown>;
				const maybeScore = value.score;
				const score = typeof maybeScore === "number" && Number.isFinite( maybeScore ) ? maybeScore : null;
				return {
					hole: numberOrZero( value.hole ) || index + 1,
					score,
					count: numberOrZero( value.count ),
				};
			} )
			: [],
		optimumRound: ( () => {
			const optimumRaw = ( raw.optimumRound && typeof raw.optimumRound === "object" ? raw.optimumRound : {} ) as Record<string, unknown>;
			const holes = Array.isArray( optimumRaw.holes )
				? optimumRaw.holes.map( ( item, index ) => {
					const value = ( item && typeof item === "object" ? item : {} ) as Record<string, unknown>;
					const maybeBestScore = value.bestScore;
					const bestScore = typeof maybeBestScore === "number" && Number.isFinite( maybeBestScore ) ? maybeBestScore : null;
					return {
						hole: numberOrZero( value.hole ) || index + 1,
						bestScore,
					};
				} )
				: [];

			const maybeTotal = optimumRaw.totalStrokes;
			const totalStrokes = typeof maybeTotal === "number" && Number.isFinite( maybeTotal ) ? maybeTotal : null;

			return { holes, totalStrokes };
		} )(),
	};
};

function getScoreStyle( strokes: number ) {
	const scoreType = classifyScore( strokes, 3 );

	if ( scoreType === "birdie" ) {
		return "inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-teal-700 bg-teal-600 text-sm font-bold text-white sm:h-10 sm:w-10 sm:text-base";
	}

	if ( scoreType === "par" ) {
		return "inline-flex h-8 w-8 items-center justify-center text-sm font-bold text-slate-900 sm:h-10 sm:w-10 sm:text-base";
	}

	if ( scoreType === "bogey" ) {
		return "inline-flex h-8 w-8 items-center justify-center rounded-sm border-2 border-red-700 bg-red-100 text-sm font-bold text-red-900 sm:h-10 sm:w-10 sm:text-base";
	}

	return "inline-flex h-8 w-8 items-center justify-center rounded-sm border-2 border-red-700 bg-red-100 text-sm font-bold text-red-900 ring-2 ring-red-700 ring-offset-1 ring-offset-red-100 sm:h-10 sm:w-10 sm:text-base";
}

export default function StatsPage() {
	const { data: session, status } = useSession();
	const [ stats, setStats ] = useState<OverallStats | null>( null );

	useEffect( () => {
		if ( !session?.user ) {
			return;
		}
		fetch( "/api/stats/overall", { cache: "no-store" } )
			.then( ( response ) => ( response.ok ? response.json() : null ) )
			.then( ( data ) => setStats( normalizeStats( data ) ) )
			.catch( console.error );
	}, [ session?.user ] );

	useEffect( () => {
		if ( !stats ) {
			return;
		}

		if ( typeof window !== "undefined" && window.location.hash === "#most-frequent-score" ) {
			requestAnimationFrame( () => {
				document.getElementById( "most-frequent-score" )?.scrollIntoView( { behavior: "auto", block: "start" } );
			} );
		}
	}, [ stats ] );

	if ( status === "loading" ) {
		return <main className="mx-auto max-w-3xl p-6">Checking session...</main>;
	}

	if ( !session?.user ) {
		const callbackUrl = typeof window !== "undefined" ? window.location.origin : undefined;
		return (
			<main className="mx-auto max-w-3xl p-6">
				<h1 className="text-2xl font-bold">My stats</h1>
				<p className="mt-2 text-slate-700">Sign in to view your stats.</p>
				<button
					className="mt-4 rounded bg-teal-700 px-4 py-2 text-white hover:bg-teal-800"
					onClick={ () => signIn( "google", callbackUrl ? { callbackUrl } : undefined ) }
					type="button"
				>
					Sign in
				</button>
			</main>
		);
	}

	if ( !stats ) {
		return <main className="mx-auto max-w-3xl p-6">Loading stats...</main>;
	}

	const holePercentage = ( count: number ) => {
		if ( stats.holesPlayed <= 0 || !Number.isFinite( count ) ) {
			return 0;
		}
		return ( count / stats.holesPlayed ) * 100;
	};

	const statCards = [
		{ label: "Rounds played", value: stats.roundsPlayed },
		{ label: "Holes played", value: stats.holesPlayed },
		{ label: "Total strokes", value: stats.totalStrokes },
		{ label: "Total putts", value: stats.totalPutts },
		{ label: "Average putts/hole", value: stats.averagePuttsPerHole.toFixed( 2 ) },
		{ label: "1-putts", value: stats.totalOnePutts, progressPercent: holePercentage( stats.totalOnePutts ) },
		{ label: "2-putts", value: stats.totalTwoPutts, progressPercent: holePercentage( stats.totalTwoPutts ) },
		{ label: "3+ putts", value: stats.totalThreePuttPlus, progressPercent: holePercentage( stats.totalThreePuttPlus ) },
		{ label: "GIR", value: stats.totalGir, progressPercent: holePercentage( stats.totalGir ) },
	];

	const scoreBreakdown = [
		{ label: "Birdies", value: stats.totalBirdies, progressPercent: holePercentage( stats.totalBirdies ) },
		{ label: "Pars", value: stats.totalPars, progressPercent: holePercentage( stats.totalPars ) },
		{ label: "Bogeys", value: stats.totalBogeys, progressPercent: holePercentage( stats.totalBogeys ) },
		{ label: "Double bogeys", value: stats.totalDoubleBogeys, progressPercent: holePercentage( stats.totalDoubleBogeys ) },
		{ label: "Triple bogeys", value: stats.totalTripleBogeyPlus, progressPercent: holePercentage( stats.totalTripleBogeyPlus ) },
	];

	return (
		<main className="mx-auto max-w-3xl p-6">
			<h1 className="text-2xl font-bold">My stats</h1>
			<div className="mt-4 grid grid-cols-2 gap-3">
				{ statCards.map( ( stat ) => (
					<article className="rounded border border-slate-200 bg-white p-4" key={ stat.label }>
						<p className="text-sm text-slate-600">{ stat.label }</p>
						<p className="mt-1 text-2xl font-semibold text-slate-900">{ stat.value }</p>
						{ typeof stat.progressPercent === "number" ? (
							<div className="mt-3">
								<div className="h-2 w-full rounded-full bg-slate-200">
									<div
										className="h-2 rounded-full bg-teal-600"
										style={ { width: `${ Math.max( 0, Math.min( stat.progressPercent, 100 ) ) }%` } }
									/>
								</div>
								<p className="mt-1 text-xs text-slate-600">{ stat.progressPercent.toFixed( 1 ) }%</p>
							</div>
						) : null }
					</article>
				) ) }
			</div>

			<section className="mt-6 rounded border border-slate-200 bg-white p-4">
				<h2 className="text-sm font-semibold text-slate-800">Score breakdown</h2>
				<div className="mt-3 space-y-3">
					{ scoreBreakdown.map( ( stat ) => (
						<div className="grid grid-cols-[6.75rem_auto_1fr] items-center gap-4" key={ stat.label }>
							<p className="text-sm text-slate-700">{ stat.label }</p>
							<p className="text-sm font-semibold text-slate-900">{ stat.value }</p>
							<div>
								<div className="h-2 w-full rounded-full bg-slate-200">
									<div
										className="h-2 rounded-full bg-teal-600"
										style={ { width: `${ Math.max( 0, Math.min( stat.progressPercent, 100 ) ) }%` } }
									/>
								</div>
								<p className="mt-1 text-xs text-slate-600">{ stat.progressPercent.toFixed( 1 ) }%</p>
							</div>
						</div>
					) ) }
				</div>
			</section>

			<section className="mt-6 rounded border border-slate-200 bg-white p-4" id="most-frequent-score">
				<h2 className="text-lg font-semibold">Most frequent score by hole</h2>
				<div className="mt-3">
					<table className="w-full table-fixed border-collapse">
						<tbody>
							<tr>
								{ stats.mostFrequentScoreByHole.length === 0
									? Array.from( { length: 6 }, ( _, index ) => (
										<td className="border border-slate-200 px-1 py-1 align-top text-center sm:px-2 sm:py-2" key={ index }>
											<Link className="block rounded px-1 py-1 outline-none transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-teal-600" href={ `/stats/holes/${ index + 1 }` }>
												<p className="text-xs font-semibold text-slate-900 sm:text-sm">{ index + 1 }</p>
												<p className="mt-0.5 text-[10px] text-slate-600 sm:mt-1 sm:text-xs">No data</p>
												<div className="mt-1 sm:mt-2">
													<span className="inline-flex h-8 w-8 items-center justify-center text-sm font-bold text-slate-400 sm:h-10 sm:w-10 sm:text-base">-</span>
												</div>
											</Link>
										</td>
									) )
									: [ ...stats.mostFrequentScoreByHole ]
										.sort( ( left, right ) => left.hole - right.hole )
										.map( ( holeStat ) => (
											<td className="border border-slate-200 px-1 py-1 align-top text-center sm:px-2 sm:py-2" key={ holeStat.hole }>
												<Link className="block rounded px-1 py-1 outline-none transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-teal-600" href={ `/stats/holes/${ holeStat.hole }` }>
													<p className="text-xs font-semibold text-slate-900 sm:text-sm">{ holeStat.hole }</p>
													<p className="mt-0.5 text-[10px] text-slate-600 sm:mt-1 sm:text-xs">{ holeStat.count > 0 ? `${ holeStat.count }x` : "No data" }</p>
													<div className="mt-1 sm:mt-2">
														{ typeof holeStat.score === "number" ? <span className={ getScoreStyle( holeStat.score ) }>{ holeStat.score }</span> : <span className="inline-flex h-8 w-8 items-center justify-center text-sm font-bold text-slate-400 sm:h-10 sm:w-10 sm:text-base">-</span> }
													</div>
												</Link>
											</td>
										) ) }
							</tr>
						</tbody>
					</table>
				</div>
			</section>

			<section className="mt-4 rounded border border-slate-200 bg-white p-4">
				<div className="flex flex-wrap items-center justify-between gap-2">
					<h2 className="text-lg font-semibold">Optimum round target</h2>
					<p className="text-sm text-slate-700">
						Total: <span className="font-semibold text-slate-900">{ stats.optimumRound.totalStrokes ?? "-" }</span>
					</p>
				</div>
				<div className="mt-3">
					<table className="w-full table-fixed border-collapse">
						<tbody>
							<tr>
								{ stats.optimumRound.holes.length === 0
									? Array.from( { length: 6 }, ( _, index ) => (
										<td className="border border-slate-200 px-1 py-1 align-top text-center sm:px-2 sm:py-2" key={ index }>
											<p className="text-xs font-semibold text-slate-900 sm:text-sm">{ index + 1 }</p>
											<div className="mt-1 sm:mt-2">
												<span className="inline-flex h-8 w-8 items-center justify-center text-sm font-bold text-slate-400 sm:h-10 sm:w-10 sm:text-base">-</span>
											</div>
										</td>
									) )
									: [ ...stats.optimumRound.holes ]
										.sort( ( left, right ) => left.hole - right.hole )
										.map( ( holeStat ) => (
											<td className="border border-slate-200 px-1 py-1 align-top text-center sm:px-2 sm:py-2" key={ holeStat.hole }>
												<p className="text-xs font-semibold text-slate-900 sm:text-sm">{ holeStat.hole }</p>
												<div className="mt-1 sm:mt-2">
													{ typeof holeStat.bestScore === "number" ? <span className={ getScoreStyle( holeStat.bestScore ) }>{ holeStat.bestScore }</span> : <span className="inline-flex h-8 w-8 items-center justify-center text-sm font-bold text-slate-400 sm:h-10 sm:w-10 sm:text-base">-</span> }
												</div>
											</td>
										) ) }
							</tr>
						</tbody>
					</table>
				</div>
			</section>
		</main>
	);
}
