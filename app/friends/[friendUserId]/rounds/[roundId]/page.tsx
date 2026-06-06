"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { FriendAccessState } from "@/components/friends/FriendAccessState";
import { RoundSummaryCard } from "@/components/stats/RoundSummaryCard";
import { Skeleton } from "@/components/ui/skeleton";
import { classifyScore } from "@/lib/scoring/calculateRoundStats";

interface FriendProfile {
	friendUserId: string;
	displayName: string;
}

interface FriendRoundDetail {
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
	holeEntries: Array<{
		holeSequence: number;
		strokes: number;
		penalties: number;
		bunkers: number;
		putts: number;
		greenInRegulation: boolean;
	}>;
}

type AccessState = "not-friend" | "not-found" | "error" | null;

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

	return "inline-flex h-8 w-8 items-center justify-center rounded-sm border-2 border-red-700 bg-red-100 text-sm font-bold text-red-900 ring-2 ring-red-700 ring-offset-1 ring-offset-red-100 sm:h-10 sm:w-10 sm:text-base";
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

function FriendRoundDetailSkeleton() {
	return (
		<main className="mx-auto max-w-3xl space-y-4 p-6" aria-hidden="true">
			<Skeleton className="h-5 w-40" />
			<Skeleton className="h-8 w-64" />
			<Skeleton className="h-40 w-full" />
			<Skeleton className="h-72 w-full" />
		</main>
	);
}

export default function FriendRoundDetailPage() {
	const params = useParams<{ friendUserId: string; roundId: string }>();
	const friendUserId = params.friendUserId;
	const roundId = params.roundId;
	const { data: session, status } = useSession();
	const [ profile, setProfile ] = useState<FriendProfile | null>( null );
	const [ round, setRound ] = useState<FriendRoundDetail | null>( null );
	const [ error, setError ] = useState<string | null>( null );
	const [ accessState, setAccessState ] = useState<AccessState>( null );
	const [ isLoading, setIsLoading ] = useState( true );

	const loadRoundDetails = useCallback( async () => {
		if ( !session?.user ) {
			return;
		}

		setIsLoading( true );
		setError( null );
		setAccessState( null );

		const profileResponse = await fetch( `/api/friends/${ friendUserId }/profile`, { cache: "no-store" } );
		if ( !profileResponse.ok ) {
			let code: string | undefined;
			try {
				const payload = await profileResponse.json() as { error?: { code?: string } };
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

		const roundResponse = await fetch( `/api/friends/${ friendUserId }/rounds/${ roundId }`, { cache: "no-store" } );
		if ( !roundResponse.ok ) {
			let code: string | undefined;
			try {
				const payload = await roundResponse.json() as { error?: { code?: string } };
				code = payload.error?.code;
			} catch {
				// Ignore parse failures and rely on status code mapping.
			}

			if ( code === "ROUND_NOT_FOUND" || roundResponse.status === 404 ) {
				setError( "Round not found." );
			} else {
				setAccessState( mapAccessState( roundResponse.status, code ) );
			}
			setIsLoading( false );
			return;
		}

		const roundPayload = await roundResponse.json() as FriendRoundDetail;
		setRound( roundPayload );
		setIsLoading( false );
	}, [ friendUserId, roundId, session?.user ] );

	useEffect( () => {
		if ( !session?.user ) {
			setIsLoading( false );
			return;
		}

		loadRoundDetails().catch( () => {
			setAccessState( "error" );
			setIsLoading( false );
		} );
	}, [ loadRoundDetails, session?.user ] );

	const scorecardEntries = useMemo(
		() => [ ...( round?.holeEntries ?? [] ) ].sort( ( left, right ) => left.holeSequence - right.holeSequence ),
		[ round?.holeEntries ],
	);

	if ( status === "loading" || isLoading ) {
		return <FriendRoundDetailSkeleton />;
	}

	if ( !session?.user ) {
		const callbackUrl = typeof window !== "undefined" ? window.location.origin : undefined;
		return (
			<main className="mx-auto max-w-3xl p-6">
				<h1 className="text-2xl font-bold">Friend round details</h1>
				<p className="mt-2 text-slate-700">Sign in to view friend round details.</p>
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
			<main className="mx-auto max-w-3xl p-6">
				<h1 className="text-2xl font-bold">Friend round details</h1>
				<div className="mt-4">
					<FriendAccessState status={ accessState } />
				</div>
			</main>
		);
	}

	if ( error ) {
		return (
			<main className="mx-auto max-w-3xl p-6">
				<Link className="text-sm font-medium text-teal-700 hover:text-teal-800" href={ `/friends/${ friendUserId }` }>
					Back to friend stats
				</Link>
				<p className="mt-4 text-red-600">{ error }</p>
			</main>
		);
	}

	if ( !round || !profile ) {
		return <FriendRoundDetailSkeleton />;
	}

	const roundTitleDate = formatRoundHeaderDate( round.playedOn );
	const isInProgress = round.status === "IN_PROGRESS";
	const statusLabel = isInProgress ? "In Progress" : round.status === "COMPLETED" ? "Completed" : round.status;
	const statusClassName = isInProgress
		? "bg-amber-100 text-amber-900 ring-1 ring-inset ring-amber-300"
		: "bg-teal-100 text-teal-900 ring-1 ring-inset ring-teal-300";

	return (
		<main className="mx-auto max-w-3xl space-y-4 p-6">
			<Link className="text-sm font-medium text-teal-700 hover:text-teal-800" href={ `/friends/${ friendUserId }` }>
				Back to friend stats
			</Link>
			<header>
				<div className="flex flex-wrap items-center gap-2">
					<h1 className="text-2xl font-bold">{ roundTitleDate }</h1>
					<span className={ `inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${ statusClassName }` }>
						{ statusLabel }
					</span>
				</div>
				<p className="mt-1 text-sm text-slate-600">{ profile.displayName } - { round.targetHoleCount } holes</p>
			</header>

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

			<RoundSummaryCard round={ round } hideHeader />
		</main>
	);
}
