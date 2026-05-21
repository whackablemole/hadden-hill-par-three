"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";

interface OverallStats {
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

export default function StatsPage() {
	const { data: session, status } = useSession();
	const [ stats, setStats ] = useState<OverallStats | null>( null );

	useEffect( () => {
		if ( !session?.user ) {
			return;
		}
		fetch( "/api/stats/overall", { cache: "no-store" } )
			.then( ( response ) => ( response.ok ? response.json() : null ) )
			.then( ( data ) => setStats( data ) )
			.catch( console.error );
	}, [ session?.user ] );

	if ( status === "loading" ) {
		return <main className="mx-auto max-w-3xl p-6">Checking session...</main>;
	}

	if ( !session?.user ) {
		const callbackUrl = typeof window !== "undefined" ? window.location.origin : undefined;
		return (
			<main className="mx-auto max-w-3xl p-6">
				<h1 className="text-2xl font-bold">Overall stats</h1>
				<p className="mt-2 text-slate-700">Sign in to view your stats.</p>
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

	if ( !stats ) {
		return <main className="mx-auto max-w-3xl p-6">Loading stats...</main>;
	}

	const holePercentage = ( count: number ) => {
		if ( stats.holesPlayed <= 0 ) {
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
		{ label: "Birdies", value: stats.totalBirdies, progressPercent: holePercentage( stats.totalBirdies ) },
		{ label: "Pars", value: stats.totalPars, progressPercent: holePercentage( stats.totalPars ) },
		{ label: "Bogeys", value: stats.totalBogeys, progressPercent: holePercentage( stats.totalBogeys ) },
		{ label: "Double bogeys", value: stats.totalDoubleBogeys, progressPercent: holePercentage( stats.totalDoubleBogeys ) },
		{ label: "Triple bogeys", value: stats.totalTripleBogeyPlus, progressPercent: holePercentage( stats.totalTripleBogeyPlus ) },
	];

	return (
		<main className="mx-auto max-w-3xl p-6">
			<h1 className="text-2xl font-bold">Overall stats</h1>
			<div className="mt-4 grid grid-cols-2 gap-3">
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
		</main>
	);
}
