"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { HoleEntryForm, HoleEntryPayload } from "@/components/round-entry/HoleEntryForm";
import { RoundProgress } from "@/components/round-entry/RoundProgress";
import { RoundSummaryCard } from "@/components/stats/RoundSummaryCard";
import { saveHoleEntry } from "@/lib/rounds/saveHoleEntry";

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

const holeLengthByBaseHole: Record<number, number> = {
	1: 150,
	2: 85,
	3: 140,
	4: 95,
	5: 115,
	6: 105,
};

export default function RoundDetailPage() {
	const params = useParams<{ roundId: string }>();
	const roundId = params.roundId;
	const { data: session, status } = useSession();
	const [ round, setRound ] = useState<RoundData | null>( null );
	const [ error, setError ] = useState<string | null>( null );
	const [ selectedHole, setSelectedHole ] = useState( 1 );

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
		return <main className="mx-auto max-w-3xl p-6">Checking session...</main>;
	}

	if ( !session?.user ) {
		const callbackUrl = typeof window !== "undefined" ? window.location.origin : undefined;
		return (
			<main className="mx-auto max-w-3xl p-6">
				<h1 className="text-2xl font-bold">Round details</h1>
				<p className="mt-2 text-slate-700">Sign in to view round details.</p>
				<button
					className="mt-4 rounded bg-slate-900 px-4 py-2 text-white"
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
		return <main className="mx-auto max-w-3xl p-6">Loading...</main>;
	}

	return (
		<main className="mx-auto max-w-3xl space-y-4 p-6">
			<h1 className="text-2xl font-bold">Round details</h1>

			<RoundProgress current={ Math.min( selectedHole, round.targetHoleCount ) } total={ round.targetHoleCount } />

			{ round.status === "IN_PROGRESS" ? (
				<section className="space-y-3">
					<div className="rounded border border-slate-200 bg-white p-3">
						<div className="flex items-center justify-between">
							<button
								className="rounded border border-slate-300 p-2 text-lg disabled:opacity-40"
								type="button"
								onClick={ () => setSelectedHole( ( value ) => Math.max( 1, value - 1 ) ) }
								disabled={ selectedHole <= 1 }
								aria-label="Previous hole"
							>
								<ChevronLeftIcon className="h-6 w-6" />
							</button>
							<div className="text-center">
								<p className="text-base font-semibold">Hole { selectedHole }</p>
								<p className="text-sm text-slate-600">{ selectedHoleLength } yards</p>
								{ enteredHoles.has( selectedHole ) ? (
									<p className="text-xs text-emerald-700">Saved</p>
								) : (
									<p className="text-xs text-slate-500">Not saved</p>
								) }
							</div>
							<button
								className="rounded border border-slate-300 p-2 text-lg disabled:opacity-40"
								type="button"
								onClick={ () => setSelectedHole( ( value ) => Math.min( round.targetHoleCount, value + 1 ) ) }
								disabled={ selectedHole >= round.targetHoleCount }
								aria-label="Next hole"
							>
								<ChevronRightIcon className="h-6 w-6" />
							</button>
						</div>
					</div>

					<HoleEntryForm initialPayload={ initialHolePayload } onSave={ onSave } />

					<button className="rounded bg-emerald-700 px-4 py-2 text-white" onClick={ onComplete } type="button">
						Complete round
					</button>
				</section>
			) : null }

			<RoundSummaryCard round={ round } />
		</main>
	);
}
