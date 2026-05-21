"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { DeleteRoundButton } from "@/components/stats/DeleteRoundButton";
import { RoundSummaryCard } from "@/components/stats/RoundSummaryCard";

interface RoundSummary {
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
}

export default function RoundHistoryPage() {
	const { data: session, status } = useSession();
	const [ rounds, setRounds ] = useState<RoundSummary[]>( [] );

	async function loadHistory() {
		const response = await fetch( "/api/rounds/history", { cache: "no-store" } );
		if ( !response.ok ) {
			return;
		}

		const data = await response.json();
		setRounds( data.rounds );
	}

	useEffect( () => {
		if ( !session?.user ) {
			return;
		}
		loadHistory().catch( console.error );
	}, [ session?.user ] );

	if ( status === "loading" ) {
		return <main className="mx-auto max-w-4xl p-6">Checking session...</main>;
	}

	if ( !session?.user ) {
		const callbackUrl = typeof window !== "undefined" ? window.location.origin : undefined;
		return (
			<main className="mx-auto max-w-4xl p-6">
				<h1 className="text-2xl font-bold">Round history</h1>
				<p className="mt-2 text-slate-700">Sign in to view your round history.</p>
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

	return (
		<main className="mx-auto max-w-4xl space-y-4 p-6">
			<h1 className="text-2xl font-bold">Round history</h1>
			{ rounds.length === 0 ? <p>No rounds yet.</p> : null }
			<div className="space-y-3">
				{ rounds.map( ( round ) => (
					<div className="flex flex-col gap-2" key={ round.id }>
						<RoundSummaryCard round={ round } />
						<div className="flex gap-2">
							<Link className="rounded border border-slate-300 px-3 py-1 text-sm" href={ `/rounds/${ round.id }` }>
								Open
							</Link>
							<DeleteRoundButton roundId={ round.id } onDeleted={ loadHistory } />
						</div>
					</div>
				) ) }
			</div>
		</main>
	);
}
