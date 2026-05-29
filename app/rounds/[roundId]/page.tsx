"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { HoleEntryForm, HoleEntryPayload } from "@/components/round-entry/HoleEntryForm";
import { RoundProgress } from "@/components/round-entry/RoundProgress";
import { DeleteRoundButton } from "@/components/stats/DeleteRoundButton";
import { RoundSummaryCard } from "@/components/stats/RoundSummaryCard";
import { Skeleton } from "@/components/ui/skeleton";
import { saveHoleEntry } from "@/lib/rounds/saveHoleEntry";
import { classifyScore } from "@/lib/scoring/calculateRoundStats";

interface RoundData {
	id: string;
	status: "IN_PROGRESS" | "COMPLETED";
	targetHoleCount: number;
	playedOn: string;
	totalStrokes: number;
	totalPutts: number;
	averagePuttsPerHole: number;
	totalBirdies: number;
	totalPars: number;
	totalBogeys: number;
	totalDoubleBogeys: number;
	totalTripleBogeyPlus: number;
	holeEntries: Array<{
		holeSequence: number;
		strokes: number;
		penalties: number;
		bunkers: number;
		putts: number;
		greenInRegulation: boolean;
	}>;
}

type HoleNavigationDirection = "next" | "previous" | null;

const holeLengthByBaseHole: Record<number, number> = {
	1: 150,
	2: 85,
	3: 140,
	4: 95,
	5: 115,
	6: 105,
};

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

function formatRoundHeaderDate( playedOn: string ) {
	const date = new Date( playedOn );
	const weekday = new Intl.DateTimeFormat( "en-GB", { weekday: "short", timeZone: "UTC" } ).format( date );
	const day = date.getUTCDate();
	const month = new Intl.DateTimeFormat( "en-GB", { month: "long", timeZone: "UTC" } ).format( date );
	const year = date.getUTCFullYear();

	return `${ weekday } ${ day }${ getOrdinalSuffix( day ) } ${ month } ${ year }`;
}

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

	// Double bogey and anything higher both use double-border square styling.
	return "inline-flex h-8 w-8 items-center justify-center rounded-sm border-2 border-red-700 bg-red-100 text-sm font-bold text-red-900 ring-2 ring-red-700 ring-offset-1 ring-offset-red-100 sm:h-10 sm:w-10 sm:text-base";
}

function RoundDetailSkeleton() {
	return (
		<main className="mx-auto max-w-3xl space-y-4 p-6" aria-hidden="true">
			<header>
				<div className="flex flex-wrap items-center gap-2">
					<Skeleton className="h-8 w-56" />
					<Skeleton className="h-6 w-24 rounded-full" />
				</div>
				<Skeleton className="mt-2 h-4 w-20" />
			</header>

			<div className="rounded border border-slate-200 bg-white p-3">
				<Skeleton className="h-4 w-44" />
				<Skeleton className="mt-2 h-2 w-full" />
			</div>

			<section className="space-y-3">
				<div className="rounded border border-slate-200 bg-white p-3">
					<div className="flex items-center justify-between">
						<Skeleton className="h-10 w-10" />
						<div className="text-center">
							<Skeleton className="h-5 w-20" />
							<Skeleton className="mt-2 h-4 w-16" />
						</div>
						<Skeleton className="h-10 w-10" />
					</div>
				</div>
				<Skeleton className="h-72 w-full rounded" />
				<Skeleton className="h-10 w-full rounded" />
			</section>
		</main>
	);
}

export default function RoundDetailPage() {
	const params = useParams<{ roundId: string }>();
	const roundId = params.roundId;
	const { data: session, status } = useSession();
	const [ round, setRound ] = useState<RoundData | null>( null );
	const [ error, setError ] = useState<string | null>( null );
	const [ selectedHole, setSelectedHole ] = useState( 1 );
	const [ holeNavigationDirection, setHoleNavigationDirection ] = useState<HoleNavigationDirection>( null );
	const router = useRouter();

	const loadRound = useCallback( async () => {
		if ( !session?.user ) {
			return;
		}
		setError( null );
		const response = await fetch( `/api/rounds/${ roundId }`, { cache: "no-store" } );
		if ( !response.ok ) {
			setError( "Unable to load round" );
			return;
		}

		const data: RoundData = await response.json();
		setRound( data );
	}, [ roundId, session?.user ] );

	useEffect( () => {
		if ( !session?.user ) {
			return;
		}
		loadRound().catch( () => setError( "Unable to load round" ) );
	}, [ loadRound, session?.user ] );

	const enteredHoles = useMemo( () => new Set( round?.holeEntries.map( ( h ) => h.holeSequence ) ?? [] ), [ round ] );
	const scorecardEntries = useMemo(
		() => [ ...( round?.holeEntries ?? [] ) ].sort( ( left, right ) => left.holeSequence - right.holeSequence ),
		[ round?.holeEntries ],
	);
	const selectedHoleEntry = useMemo(
		() => round?.holeEntries.find( ( entry ) => entry.holeSequence === selectedHole ) ?? null,
		[ round, selectedHole ],
	);
	const selectedBaseHole = useMemo( () => ( ( selectedHole - 1 ) % 6 ) + 1, [ selectedHole ] );
	const selectedHoleLength = holeLengthByBaseHole[ selectedBaseHole ];
	const initialHolePayload = useMemo<HoleEntryPayload>( () => {
		if ( selectedHoleEntry ) {
			return {
				strokes: selectedHoleEntry.strokes,
				penalties: selectedHoleEntry.penalties > 0,
				bunkers: selectedHoleEntry.bunkers > 0,
				putts: selectedHoleEntry.putts,
				greenInRegulation: selectedHoleEntry.greenInRegulation,
			};
		}

		// Default unsaved holes to par (3) and a 2-putt.
		return {
			strokes: 3,
			penalties: false,
			bunkers: false,
			putts: 2,
			greenInRegulation: false,
		};
	}, [ selectedHoleEntry ] );

	if ( status === "loading" ) {
		return <RoundDetailSkeleton />;
	}

	if ( !session?.user ) {
		const callbackUrl = typeof window !== "undefined" ? window.location.origin : undefined;
		return (
			<main className="mx-auto max-w-3xl p-6">
				<h1 className="text-2xl font-bold">Round details</h1>
				<p className="mt-2 text-slate-700">Sign in to view round details.</p>
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

	async function onSave( payload: HoleEntryPayload ) {
		await saveHoleEntry( roundId, selectedHole, payload );
		await loadRound();
	}

	async function onComplete() {
		const response = await fetch( `/api/rounds/${ roundId }/complete`, { method: "POST" } );
		if ( !response.ok ) {
			alert( "Round is incomplete. Enter all holes first." );
			return;
		}
		await loadRound();
	}

	if ( error ) {
		return <main className="mx-auto max-w-3xl p-6 text-red-600">{ error }</main>;
	}

	if ( !round ) {
		return <RoundDetailSkeleton />;
	}

	const roundTitleDate = formatRoundHeaderDate( round.playedOn );
	const isInProgress = round.status === "IN_PROGRESS";
	const statusLabel = isInProgress ? "In Progress" : round.status === "COMPLETED" ? "Completed" : round.status;
	const statusClassName = isInProgress
		? "bg-amber-100 text-amber-900 ring-1 ring-inset ring-amber-300"
		: "bg-teal-100 text-teal-900 ring-1 ring-inset ring-teal-300";
	const holeTransitionClassName = holeNavigationDirection === "previous"
		? "motion-safe:animate-fade-right motion-safe:animate-duration-500 motion-safe:animate-ease-in-out motion-safe:animate-once"
		: holeNavigationDirection === "next"
			? "motion-safe:animate-fade-left motion-safe:animate-duration-500 motion-safe:animate-ease-in-out motion-safe:animate-once"
			: "";

	function goToPreviousHole() {
		if ( selectedHole <= 1 ) {
			return;
		}

		setHoleNavigationDirection( "previous" );
		setSelectedHole( ( value ) => Math.max( 1, value - 1 ) );
	}

	function goToNextHole() {
		if ( selectedHole >= round.targetHoleCount ) {
			return;
		}

		setHoleNavigationDirection( "next" );
		setSelectedHole( ( value ) => Math.min( round.targetHoleCount, value + 1 ) );
	}

	return (
		<main className="mx-auto max-w-3xl space-y-4 p-6">
			<header>
				<div className="flex flex-wrap items-center gap-2">
					<h1 className="text-2xl font-bold">{ roundTitleDate }</h1>
					<span className={ `inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${ statusClassName }` }>
						{ statusLabel }
					</span>
				</div>
				<p className="mt-1 text-sm text-slate-600">{ round.targetHoleCount } holes</p>
			</header>

			{ round.status === "IN_PROGRESS" ? (
				<RoundProgress current={ Math.min( selectedHole, round.targetHoleCount ) } total={ round.targetHoleCount } />
			) : null }

			{ round.status === "IN_PROGRESS" ? (
				<section className="space-y-3">
					<div key={ selectedHole } className={ `space-y-3 ${ holeTransitionClassName }` }>
						<div className="rounded border border-slate-200 bg-white p-3">
							<div className="flex items-center justify-between">
								<button
									className="rounded border border-teal-600 p-2 text-lg text-teal-700 hover:bg-teal-50 disabled:opacity-40"
									type="button"
									onClick={ goToPreviousHole }
									disabled={ selectedHole <= 1 }
									aria-label="Previous hole"
								>
									<ChevronLeftIcon className="h-6 w-6" />
								</button>
								<div className="text-center">
									<p className="text-base font-semibold">Hole { selectedHole }</p>
									<p className="text-sm text-slate-600">{ selectedHoleLength } yards</p>
									{ enteredHoles.has( selectedHole ) ? (
										<p className="text-xs text-teal-700">Saved</p>
									) : (
										<p className="text-xs text-slate-500">Not saved</p>
									) }
								</div>
								<button
									className="rounded border border-teal-600 p-2 text-lg text-teal-700 hover:bg-teal-50 disabled:opacity-40"
									type="button"
									onClick={ goToNextHole }
									disabled={ selectedHole >= round.targetHoleCount }
									aria-label="Next hole"
								>
									<ChevronRightIcon className="h-6 w-6" />
								</button>
							</div>
						</div>

						<HoleEntryForm initialPayload={ initialHolePayload } onSave={ onSave } />
					</div>

					<button className="w-full rounded bg-emerald-700 px-4 py-2 text-white hover:bg-emerald-800" onClick={ onComplete } type="button">
						Complete round
					</button>
				</section>
			) : null }

			{ round.status !== "IN_PROGRESS" ? (
				<section className="rounded border border-slate-200 bg-white p-4">
					<h2 className="text-lg font-semibold">Scorecard</h2>
					<div className="mt-3 overflow-x-auto">
						<table className={ `w-full border-collapse ${ round.targetHoleCount <= 6 ? "table-fixed" : "min-w-[640px]" }` }>
							<tbody>
								<tr>
									{ scorecardEntries.map( ( entry ) => {
										const baseHole = ( ( entry.holeSequence - 1 ) % 6 ) + 1;
										const holeLength = holeLengthByBaseHole[ baseHole ];

										return (
											<td className="border border-slate-200 px-1 py-1 align-top text-center sm:px-2 sm:py-2" key={ entry.holeSequence }>
												<p className="text-xs font-semibold text-slate-900 sm:text-sm">{ entry.holeSequence }</p>
												<p className="mt-0.5 text-[10px] text-slate-600 sm:mt-1 sm:text-xs">{ holeLength } yds</p>
												<div className="mt-1 sm:mt-2">
													<span className={ getScoreStyle( entry.strokes ) }>{ entry.strokes }</span>
												</div>
											</td>
										);
									} ) }
								</tr>
							</tbody>
						</table>
					</div>
				</section>
			) : null }

			{ round.status !== "IN_PROGRESS" ? <RoundSummaryCard round={ round } hideHeader /> : null }
			<div className="flex justify-end">
				<DeleteRoundButton
					roundId={ round.id }
					onDeleted={ () => {
						router.push( "/rounds/history" );
					} }
				/>
			</div>
		</main>
	);
}
