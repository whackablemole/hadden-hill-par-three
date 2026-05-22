"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

export function StartRoundForm() {
	const router = useRouter();
	const { data: session, status } = useSession();
	const [ playedOn, setPlayedOn ] = useState( new Date().toISOString().slice( 0, 10 ) );
	const [ targetHoleCount, setTargetHoleCount ] = useState<6 | 12 | 18>( 6 );
	const [ isSubmitting, setIsSubmitting ] = useState( false );
	const [ error, setError ] = useState<string | null>( null );

	async function onSubmit( event: FormEvent ) {
		event.preventDefault();
		if ( !session?.user ) {
			setError( "Please sign in to start a round." );
			return;
		}
		setError( null );
		setIsSubmitting( true );

		try {
			const response = await fetch( "/api/rounds", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify( { playedOn, targetHoleCount } ),
			} );

			if ( !response.ok ) {
				throw new Error( "Unable to create round" );
			}

			const round = await response.json();
			router.push( `/rounds/${ round.id }` );
		} catch ( err ) {
			setError( err instanceof Error ? err.message : "Unable to create round" );
		} finally {
			setIsSubmitting( false );
		}
	}

	if ( status === "loading" ) {
		return <p className="text-sm text-slate-600">Checking session...</p>;
	}

	if ( !session?.user ) {
		const callbackUrl = typeof window !== "undefined" ? window.location.origin : undefined;
		return (
			<div className="rounded border border-slate-200 bg-white p-4">
				<p className="text-sm text-slate-700">Sign in with Google to start a round.</p>
				<button
					className="mt-3 rounded bg-teal-700 px-4 py-2 text-white hover:bg-teal-800"
					onClick={ () => signIn( "google", callbackUrl ? { callbackUrl } : undefined ) }
					type="button"
				>
					Sign in
				</button>
			</div>
		);
	}

	return (
		<form className="space-y-4" onSubmit={ onSubmit }>
			<div>
				<label className="mb-1 block text-sm font-medium">Date</label>
				<input
					className="w-full rounded border border-teal-600 px-3 py-2"
					type="date"
					value={ playedOn }
					onChange={ ( e ) => setPlayedOn( e.target.value ) }
				/>
			</div>

			<div>
				<label className="mb-1 block text-sm font-medium">Total holes</label>
				<select
					className="w-full rounded border border-teal-600 px-3 py-2"
					value={ targetHoleCount }
					onChange={ ( e ) => setTargetHoleCount( Number( e.target.value ) as 6 | 12 | 18 ) }
				>
					<option value={ 6 }>6 holes</option>
					<option value={ 12 }>12 holes</option>
					<option value={ 18 }>18 holes</option>
				</select>
			</div>

			{ error ? <p className="text-sm text-red-600">{ error }</p> : null }

			<button
				className="rounded bg-teal-700 px-4 py-2 text-white hover:bg-teal-800 disabled:opacity-60"
				type="submit"
				disabled={ isSubmitting }
			>
				{ isSubmitting ? "Creating..." : "Start round" }
			</button>
		</form>
	);
}
