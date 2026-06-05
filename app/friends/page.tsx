"use client";

import { useCallback, useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { AddFriendByCodeForm } from "@/components/friends/AddFriendByCodeForm";
import { FriendsList } from "@/components/friends/FriendsList";
import { Skeleton } from "@/components/ui/skeleton";

interface FriendSummary {
	friendUserId: string;
	displayName: string;
	connectedAt: string;
}

function mapAddFriendErrorCode( code: string | undefined, fallback: string ) {
	switch ( code ) {
		case "INVALID_FRIEND_CODE":
			return "Friend code not found. Check and try again.";
		case "SELF_FRIEND_CODE":
			return "You cannot add your own friend code.";
		case "ALREADY_FRIENDS":
			return "You are already connected with this friend.";
		default:
			return fallback;
	}
}

function FriendsPageSkeleton() {
	return (
		<main className="mx-auto max-w-3xl space-y-4 p-6" aria-hidden="true">
			<Skeleton className="h-8 w-32" />
			<Skeleton className="h-20 w-full" />
			<Skeleton className="h-36 w-full" />
		</main>
	);
}

export default function FriendsPage() {
	const { data: session, status } = useSession();
	const [ friendCode, setFriendCode ] = useState<string | null>( null );
	const [ friends, setFriends ] = useState<FriendSummary[]>( [] );
	const [ pageError, setPageError ] = useState<string | null>( null );
	const [ successMessage, setSuccessMessage ] = useState<string | null>( null );
	const [ isLoadingData, setIsLoadingData ] = useState( true );

	const loadFriendData = useCallback( async () => {
		if ( !session?.user ) {
			return;
		}

		setIsLoadingData( true );
		setPageError( null );

		try {
			const [ friendCodeResponse, friendsResponse ] = await Promise.all( [
				fetch( "/api/friends/code", { cache: "no-store" } ),
				fetch( "/api/friends", { cache: "no-store" } ),
			] );

			if ( !friendCodeResponse.ok || !friendsResponse.ok ) {
				throw new Error( "Unable to load friend details." );
			}

			const friendCodeData = await friendCodeResponse.json() as { friendCode?: string };
			const friendsData = await friendsResponse.json() as { friends?: FriendSummary[] };
			setFriendCode( friendCodeData.friendCode ?? null );
			setFriends( Array.isArray( friendsData.friends ) ? friendsData.friends : [] );
		} catch ( error ) {
			setPageError( error instanceof Error ? error.message : "Unable to load friend details." );
		} finally {
			setIsLoadingData( false );
		}
	}, [ session?.user ] );

	useEffect( () => {
		if ( !session?.user ) {
			setIsLoadingData( false );
			return;
		}

		loadFriendData().catch( console.error );
	}, [ loadFriendData, session?.user ] );

	async function handleAddFriend( submittedCode: string ) {
		setPageError( null );
		setSuccessMessage( null );

		const response = await fetch( "/api/friends", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify( { friendCode: submittedCode } ),
		} );

		if ( !response.ok ) {
			let code: string | undefined;
			let fallback = "Unable to add friend.";
			try {
				const errorData = await response.json() as {
					error?: {
						code?: string;
						message?: string;
					};
				};
				code = errorData.error?.code;
				if ( typeof errorData.error?.message === "string" && errorData.error.message ) {
					fallback = errorData.error.message;
				}
			} catch {
				// Use fallback message when server payload cannot be parsed.
			}

			setPageError( mapAddFriendErrorCode( code, fallback ) );
			throw new Error( "add-friend-failed" );
		}

		const friend = await response.json() as FriendSummary;
		setSuccessMessage( `Connected with ${ friend.displayName }.` );
		await loadFriendData();
	}

	if ( status === "loading" || isLoadingData ) {
		return <FriendsPageSkeleton />;
	}

	if ( !session?.user ) {
		const callbackUrl = typeof window !== "undefined" ? window.location.origin : undefined;
		return (
			<main className="mx-auto max-w-3xl p-6">
				<h1 className="text-2xl font-bold">Friends</h1>
				<p className="mt-2 text-slate-700">Sign in to share and view friend scores.</p>
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

	return (
		<main className="mx-auto max-w-3xl space-y-4 p-6">
			<h1 className="text-2xl font-bold">Friends</h1>
			<section className="rounded border border-slate-200 bg-white p-4">
				<p className="text-sm text-slate-600">Your friend code</p>
				<p className="mt-1 font-mono text-2xl font-semibold tracking-wider text-teal-700">{ friendCode ?? "Unavailable" }</p>
				<p className="mt-1 text-xs text-slate-500">Share this code so other players can add you.</p>
			</section>
			<AddFriendByCodeForm onSubmit={ handleAddFriend } />
			{ pageError ? <p className="text-sm text-red-600">{ pageError }</p> : null }
			{ successMessage ? <p className="text-sm text-teal-700">{ successMessage }</p> : null }
			<FriendsList friends={ friends } />
		</main>
	);
}
