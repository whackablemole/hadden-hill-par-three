"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { FriendAccessState } from "@/components/friends/FriendAccessState";
import { FriendRoundsHistory } from "@/components/friends/FriendRoundsHistory";
import { FriendStatsPanel } from "@/components/friends/FriendStatsPanel";
import { Skeleton } from "@/components/ui/skeleton";

interface FriendProfile {
	friendUserId: string;
	displayName: string;
}

interface FriendOverallStats {
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

interface FriendRoundSummary {
	id: string;
	playedOn: string;
	targetHoleCount: number;
	status: "IN_PROGRESS" | "COMPLETED";
	totalStrokes: number;
	totalPutts: number;
	averagePuttsPerHole: number;
	totalBirdies: number;
	totalPars: number;
	totalBogeys: number;
	totalDoubleBogeys: number;
	totalTripleBogeyPlus: number;
}

type AccessState = "not-friend" | "not-found" | "error" | null;

function FriendDetailSkeleton() {
	return (
		<main className="mx-auto max-w-4xl space-y-4 p-6" aria-hidden="true">
			<Skeleton className="h-8 w-56" />
			<Skeleton className="h-32 w-full" />
			<Skeleton className="h-40 w-full" />
		</main>
	);
}

function mapAccessState( status: number, code: string | undefined ): AccessState {
	if ( status === 404 || code === "FRIEND_NOT_FOUND" ) {
		return "not-found";
	}

	if ( status === 403 || code === "FRIEND_ACCESS_REQUIRED" || code === "SELF_FRIEND_ACCESS_BLOCKED" ) {
		return "not-friend";
	}

	return "error";
}

export default function FriendDetailPage() {
	const params = useParams<{ friendUserId: string }>();
	const friendUserId = params.friendUserId;
	const { data: session, status } = useSession();
	const [ profile, setProfile ] = useState<FriendProfile | null>( null );
	const [ stats, setStats ] = useState<FriendOverallStats | null>( null );
	const [ rounds, setRounds ] = useState<FriendRoundSummary[]>( [] );
	const [ accessState, setAccessState ] = useState<AccessState>( null );
	const [ isLoading, setIsLoading ] = useState( true );

	const loadFriendDetails = useCallback( async () => {
		if ( !session?.user ) {
			return;
		}

		setIsLoading( true );
		setAccessState( null );

		const profileResponse = await fetch( `/api/friends/${ friendUserId }/profile`, { cache: "no-store" } );
		if ( !profileResponse.ok ) {
			let code: string | undefined;
			try {
				const payload = await profileResponse.json() as {
					error?: { code?: string };
				};
				code = payload.error?.code;
			} catch {
				// Ignore parse failures and rely on status code mapping.
			}
			setAccessState( mapAccessState( profileResponse.status, code ) );
			setIsLoading( false );
			return;
		}

		const profilePayload = await profileResponse.json() as FriendProfile;
		setProfile( profilePayload );

		const [ statsResponse, historyResponse ] = await Promise.all( [
			fetch( `/api/friends/${ friendUserId }/stats/overall`, { cache: "no-store" } ),
			fetch( `/api/friends/${ friendUserId }/rounds/history?status=COMPLETED`, { cache: "no-store" } ),
		] );

		if ( !statsResponse.ok || !historyResponse.ok ) {
			setAccessState( "error" );
			setIsLoading( false );
			return;
		}

		const statsPayload = await statsResponse.json() as FriendOverallStats;
		const historyPayload = await historyResponse.json() as { rounds?: FriendRoundSummary[] };
		setStats( statsPayload );
		setRounds( Array.isArray( historyPayload.rounds ) ? historyPayload.rounds : [] );
		setIsLoading( false );
	}, [ friendUserId, session?.user ] );

	useEffect( () => {
		if ( !session?.user ) {
			setIsLoading( false );
			return;
		}

		loadFriendDetails().catch( () => {
			setAccessState( "error" );
			setIsLoading( false );
		} );
	}, [ loadFriendDetails, session?.user ] );

	if ( status === "loading" || isLoading ) {
		return <FriendDetailSkeleton />;
	}

	if ( !session?.user ) {
		const callbackUrl = typeof window !== "undefined" ? window.location.origin : undefined;
		return (
			<main className="mx-auto max-w-4xl p-6">
				<h1 className="text-2xl font-bold">Friend details</h1>
				<p className="mt-2 text-slate-700">Sign in to view friend scores.</p>
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

	if ( accessState ) {
		return (
			<main className="mx-auto max-w-4xl p-6">
				<h1 className="text-2xl font-bold">Friend details</h1>
				<div className="mt-4">
					<FriendAccessState status={ accessState } />
				</div>
			</main>
		);
	}

	if ( !profile || !stats ) {
		return (
			<main className="mx-auto max-w-4xl p-6">
				<h1 className="text-2xl font-bold">Friend details</h1>
				<div className="mt-4">
					<FriendAccessState status="error" />
				</div>
			</main>
		);
	}

	return (
		<main className="mx-auto max-w-4xl space-y-4 p-6">
			<h1 className="text-2xl font-bold">{ profile.displayName }</h1>
			<FriendStatsPanel stats={ stats } />
			<FriendRoundsHistory rounds={ rounds } />
		</main>
	);
}
