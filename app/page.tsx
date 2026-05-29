"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";

type StatScope = "lifetime" | "last-round";

interface HomeStats {
	totalRounds: number;
	holesPlayed: number;
	totalStrokes: number;
	averagePuttsPerHole: number;
	bestRoundSixHoles: number | null;
	totalBirdies: number;
	totalPars: number;
	totalGir: number;
	girPercentage: number;
}

interface HomeStatsResponse {
	scope: StatScope;
	stats: HomeStats;
}

interface RecentRound {
	id: string;
	playedOn: string;
	targetHoleCount: number;
	status: string;
	totalStrokes: number;
	totalBirdies: number;
	totalPars: number;
}

const EMPTY_STATS: HomeStats = {
	totalRounds: 0,
	holesPlayed: 0,
	totalStrokes: 0,
	averagePuttsPerHole: 0,
	bestRoundSixHoles: null,
	totalBirdies: 0,
	totalPars: 0,
	totalGir: 0,
	girPercentage: 0,
};

function formatGir( totalGir: number, girPercentage: number ) {
	const safePercentage = Number.isFinite( girPercentage ) ? girPercentage : 0;
	return `${ totalGir } (${ safePercentage.toFixed( 1 ) }%)`;
}

function formatParRelative( totalStrokes: number, holesPlayed: number ) {
	if ( holesPlayed <= 0 ) {
		return "-";
	}

	const par = holesPlayed * 3;
	const difference = totalStrokes - par;

	if ( difference > 0 ) {
		return `+${ difference }`;
	}

	if ( difference < 0 ) {
		return `${ difference }`;
	}

	return "E";
}

export default function HomePage() {
	const { data: session, status } = useSession();
	const [ scope, setScope ] = useState<StatScope>( "lifetime" );
	const [ stats, setStats ] = useState<HomeStats>( EMPTY_STATS );
	const [ loadingStats, setLoadingStats ] = useState( false );
	const [ recentRounds, setRecentRounds ] = useState<RecentRound[]>( [] );
	const [ loadingRecentRounds, setLoadingRecentRounds ] = useState( false );

	useEffect( () => {
		if ( !session?.user ) {
			setStats( EMPTY_STATS );
			return;
		}

		setLoadingStats( true );
		fetch( `/api/stats/home?scope=${ scope }`, { cache: "no-store" } )
			.then( ( response ) => ( response.ok ? response.json() : null ) )
			.then( ( data: HomeStatsResponse | null ) => {
				if ( !data?.stats ) {
					setStats( EMPTY_STATS );
					return;
				}
				setStats( data.stats );
			} )
			.catch( () => setStats( EMPTY_STATS ) )
			.finally( () => setLoadingStats( false ) );
	}, [ scope, session?.user ] );

	useEffect( () => {
		if ( !session?.user ) {
			setRecentRounds( [] );
			return;
		}

		setLoadingRecentRounds( true );
		fetch( "/api/rounds/history", { cache: "no-store" } )
			.then( ( response ) => ( response.ok ? response.json() : null ) )
			.then( ( data: { rounds?: RecentRound[] } | null ) => {
				if ( !data?.rounds?.length ) {
					setRecentRounds( [] );
					return;
				}
				setRecentRounds( data.rounds.slice( 0, 5 ) );
			} )
			.catch( () => setRecentRounds( [] ) )
			.finally( () => setLoadingRecentRounds( false ) );
	}, [ session?.user ] );

	const statCards = scope === "last-round"
		? [
			{ label: "Total holes", value: stats.holesPlayed },
			{ label: "Average putts", value: stats.averagePuttsPerHole.toFixed( 2 ) },
			{ label: "Total birdies", value: stats.totalBirdies },
			{ label: "Total pars", value: stats.totalPars },
			{ label: "Par relative", value: formatParRelative( stats.totalStrokes, stats.holesPlayed ) },
			{ label: "GIR", value: formatGir( stats.totalGir, stats.girPercentage ) },
		]
		: [
			{ label: "Total rounds", value: stats.totalRounds },
			{ label: "Total holes", value: stats.holesPlayed },
			{ label: "Best round (6 holes)", value: stats.bestRoundSixHoles ?? "-" },
			{ label: "Average round (6 holes)", value: stats.holesPlayed <= 0 ? "-" : Math.round( ( stats.totalStrokes / stats.holesPlayed ) * 6 ) },
			{ label: "Average putts", value: stats.averagePuttsPerHole.toFixed( 2 ) },
			{ label: "GIR", value: formatGir( stats.totalGir, stats.girPercentage ) },
		];

	const dateFormatter = new Intl.DateTimeFormat( "en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	} );

	return (
		<main className="mx-auto max-w-3xl p-6">
			<h1 className="text-3xl font-bold">WM Caddy</h1>
			<p className="mt-2 text-slate-700">
				Track your 6, 12, or 18-hole par-three rounds live.
			</p>

			<div className="mt-8 rounded border border-slate-200 bg-white p-4">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<h2 className="text-lg font-semibold">Quick stats</h2>
					<div className="inline-flex rounded-md border border-teal-600 p-1">
						<button
							type="button"
							onClick={ () => setScope( "lifetime" ) }
							className={ `rounded px-3 py-1 text-sm ${ scope === "lifetime" ? "bg-teal-700 text-white" : "text-slate-700" }` }
						>
							Lifetime
						</button>
						<button
							type="button"
							onClick={ () => setScope( "last-round" ) }
							className={ `rounded px-3 py-1 text-sm ${ scope === "last-round" ? "bg-teal-700 text-white" : "text-slate-700" }` }
						>
							Last round
						</button>
					</div>
				</div>

				{ status === "loading" ? <p className="mt-4 text-sm text-slate-600">Checking session...</p> : null }
				{ status !== "loading" && !session?.user ? (
					<div className="mt-4">
						<p className="text-sm text-slate-600">Sign in to view your stats dashboard.</p>
						<button
							className="mt-3 rounded bg-teal-700 px-4 py-2 text-white hover:bg-teal-800"
							type="button"
							onClick={ () => signIn( "google" ) }
						>
							Sign in
						</button>
					</div>
				) : null }

				{ session?.user ? (
					<>
						{ loadingStats ? <p className="mt-4 text-sm text-slate-600">Loading stats...</p> : null }
						<div className="mt-4 grid grid-cols-2 gap-3">
							{ statCards.map( ( card ) => (
								<article className="rounded border border-slate-200 p-3" key={ card.label }>
									<p className="text-xs text-slate-600">{ card.label }</p>
									<p className="mt-1 text-xl font-semibold text-slate-900">{ card.value }</p>
								</article>
							) ) }
						</div>

						<div className="mt-6 border-t border-slate-200 pt-4">
							<div className="flex items-center justify-between gap-3">
								<h3 className="text-base font-semibold">Recent rounds</h3>
								<Link className="text-sm font-medium text-teal-700 hover:text-teal-800" href="/rounds/history">
									View all
								</Link>
							</div>

							{ loadingRecentRounds ? <p className="mt-3 text-sm text-slate-600">Loading recent rounds...</p> : null }
							{ !loadingRecentRounds && recentRounds.length === 0 ? <p className="mt-3 text-sm text-slate-600">No rounds yet.</p> : null }

							{ !loadingRecentRounds && recentRounds.length > 0 ? (
								<ul className="mt-3 space-y-2">
									{ recentRounds.map( ( round ) => (
										<li key={ round.id }>
											<Link
												href={ `/rounds/${ round.id }` }
												className="flex items-center justify-between rounded border border-slate-200 px-3 py-2 transition hover:border-teal-600"
											>
												<div>
													<p className="text-sm font-medium text-slate-900">
														{ dateFormatter.format( new Date( round.playedOn ) ) }
													</p>
													<p className="text-xs text-slate-600">
														{ round.targetHoleCount } holes • { round.status === "COMPLETED" ? "Completed" : "In progress" }
													</p>
												</div>
												<p className="text-sm font-semibold text-slate-900">{ round.totalStrokes } strokes</p>
											</Link>
										</li>
									) ) }
								</ul>
							) : null }
						</div>
					</>
				) : null }
			</div>
		</main>
	);
}
