"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

interface HoleStats {
	hole: number;
	attempts: number;
	scoreBreakdown: {
		birdies: number;
		pars: number;
		bogeys: number;
		doubleBogeys: number;
		tripleBogeyPlus: number;
	};
	puttBreakdown: {
		onePutts: number;
		twoPutts: number;
		threePutts: number;
		fourPlusPutts: number;
	};
	bunkerHits: number;
	penalties: number;
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

const normalizeHoleStats = ( data: unknown, fallbackHole: number ): HoleStats | null => {
	if ( !data || typeof data !== "object" ) {
		return null;
	}

	const raw = data as Record<string, unknown>;
	const rawScore = ( raw.scoreBreakdown && typeof raw.scoreBreakdown === "object" ? raw.scoreBreakdown : {} ) as Record<string, unknown>;
	const rawPutt = ( raw.puttBreakdown && typeof raw.puttBreakdown === "object" ? raw.puttBreakdown : {} ) as Record<string, unknown>;

	return {
		hole: numberOrZero( raw.hole ) || fallbackHole,
		attempts: numberOrZero( raw.attempts ),
		scoreBreakdown: {
			birdies: numberOrZero( rawScore.birdies ),
			pars: numberOrZero( rawScore.pars ),
			bogeys: numberOrZero( rawScore.bogeys ),
			doubleBogeys: numberOrZero( rawScore.doubleBogeys ),
			tripleBogeyPlus: numberOrZero( rawScore.tripleBogeyPlus ),
		},
		puttBreakdown: {
			onePutts: numberOrZero( rawPutt.onePutts ),
			twoPutts: numberOrZero( rawPutt.twoPutts ),
			threePutts: numberOrZero( rawPutt.threePutts ),
			fourPlusPutts: numberOrZero( rawPutt.fourPlusPutts ),
		},
		bunkerHits: numberOrZero( raw.bunkerHits ),
		penalties: numberOrZero( raw.penalties ),
	};
};

export default function HoleStatsPage() {
	const params = useParams<{ holeNumber: string }>();
	const hole = Number.parseInt( params.holeNumber, 10 );
	const safeHole = Number.isFinite( hole ) && hole >= 1 && hole <= 6 ? hole : 1;
	const { data: session, status } = useSession();
	const [ stats, setStats ] = useState<HoleStats | null>( null );

	useEffect( () => {
		if ( !session?.user ) {
			return;
		}
		fetch( `/api/stats/holes/${ safeHole }`, { cache: "no-store" } )
			.then( ( response ) => ( response.ok ? response.json() : null ) )
			.then( ( data ) => setStats( normalizeHoleStats( data, safeHole ) ) )
			.catch( () => setStats( null ) );
	}, [ safeHole, session?.user ] );

	const percentage = useMemo(
		() => ( count: number ) => {
			if ( !stats || stats.attempts <= 0 ) {
				return 0;
			}
			return ( count / stats.attempts ) * 100;
		},
		[ stats ],
	);

	if ( status === "loading" ) {
		return <main className="mx-auto max-w-3xl p-6">Checking session...</main>;
	}

	if ( !session?.user ) {
		const callbackUrl = typeof window !== "undefined" ? window.location.origin : undefined;
		return (
			<main className="mx-auto max-w-3xl p-6">
				<h1 className="text-2xl font-bold">Hole details</h1>
				<p className="mt-2 text-slate-700">Sign in to view hole stats.</p>
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
		return <main className="mx-auto max-w-3xl p-6">Loading hole stats...</main>;
	}

	const scoreBreakdown = [
		{ label: "Birdies", value: stats.scoreBreakdown.birdies },
		{ label: "Pars", value: stats.scoreBreakdown.pars },
		{ label: "Bogeys", value: stats.scoreBreakdown.bogeys },
		{ label: "Double bogeys", value: stats.scoreBreakdown.doubleBogeys },
		{ label: "Triple bogeys", value: stats.scoreBreakdown.tripleBogeyPlus },
	];

	const puttBreakdown = [
		{ label: "One putts", value: stats.puttBreakdown.onePutts },
		{ label: "Two putts", value: stats.puttBreakdown.twoPutts },
		{ label: "Three putts", value: stats.puttBreakdown.threePutts },
		{ label: "4+ putts", value: stats.puttBreakdown.fourPlusPutts },
	];

	return (
		<main className="mx-auto max-w-3xl space-y-4 p-6">
			<header className="flex items-center justify-between gap-3">
				<div>
					<h1 className="text-2xl font-bold">Hole { stats.hole } details</h1>
					<p className="mt-1 text-sm text-slate-600">{ stats.attempts } attempts</p>
				</div>
				<Link className="rounded border border-teal-600 px-3 py-1.5 text-sm font-medium text-teal-700 hover:bg-teal-50" href="/stats#most-frequent-score">
					Back to My stats
				</Link>
			</header>

			<article className="rounded border border-slate-200 bg-white p-4">
				<h2 className="text-sm font-semibold text-slate-800">Score breakdown</h2>
				<div className="mt-3 space-y-3">
					{ scoreBreakdown.map( ( stat ) => (
						<div className="grid grid-cols-[6.75rem_3.5rem_minmax(0,1fr)] items-center gap-4" key={ stat.label }>
							<p className="text-sm text-slate-700">{ stat.label }</p>
							<p className="text-right text-sm font-semibold tabular-nums text-slate-900">{ stat.value }</p>
							<div className="min-w-0">
								<div className="h-2 w-full rounded-full bg-slate-200">
									<div
										className="h-2 rounded-full bg-teal-600"
										style={ { width: `${ Math.max( 0, Math.min( percentage( stat.value ), 100 ) ) }%` } }
									/>
								</div>
								<p className="mt-1 text-xs text-slate-600">{ percentage( stat.value ).toFixed( 1 ) }%</p>
							</div>
						</div>
					) ) }
				</div>
			</article>

			<article className="rounded border border-slate-200 bg-white p-4">
				<h2 className="text-sm font-semibold text-slate-800">Putt breakdown</h2>
				<div className="mt-3 space-y-3">
					{ puttBreakdown.map( ( stat ) => (
						<div className="grid grid-cols-[6.75rem_3.5rem_minmax(0,1fr)] items-center gap-4" key={ stat.label }>
							<p className="text-sm text-slate-700">{ stat.label }</p>
							<p className="text-right text-sm font-semibold tabular-nums text-slate-900">{ stat.value }</p>
							<div className="min-w-0">
								<div className="h-2 w-full rounded-full bg-slate-200">
									<div
										className="h-2 rounded-full bg-teal-600"
										style={ { width: `${ Math.max( 0, Math.min( percentage( stat.value ), 100 ) ) }%` } }
									/>
								</div>
								<p className="mt-1 text-xs text-slate-600">{ percentage( stat.value ).toFixed( 1 ) }%</p>
							</div>
						</div>
					) ) }
				</div>
			</article>

			<div className="grid grid-cols-2 gap-3">
				<article className="rounded border border-slate-200 bg-white p-4">
					<p className="text-sm text-slate-600">Bunker hits</p>
					<p className="mt-1 text-2xl font-semibold text-slate-900">{ stats.bunkerHits }</p>
				</article>
				<article className="rounded border border-slate-200 bg-white p-4">
					<p className="text-sm text-slate-600">Penalties incurred</p>
					<p className="mt-1 text-2xl font-semibold text-slate-900">{ stats.penalties }</p>
				</article>
			</div>
		</main>
	);
}
