"use client";

import { FormEvent, useState } from "react";

interface AddFriendByCodeFormProps {
	onSubmit: ( friendCode: string ) => Promise<void>;
}

export function AddFriendByCodeForm( { onSubmit }: AddFriendByCodeFormProps ) {
	const [ friendCode, setFriendCode ] = useState( "" );
	const [ isSubmitting, setIsSubmitting ] = useState( false );

	async function submit( event: FormEvent<HTMLFormElement> ) {
		event.preventDefault();
		if ( !friendCode.trim() ) {
			return;
		}

		setIsSubmitting( true );
		try {
			await onSubmit( friendCode );
			setFriendCode( "" );
		} finally {
			setIsSubmitting( false );
		}
	}

	return (
		<form className="space-y-3 rounded border border-slate-200 bg-white p-4" onSubmit={ submit }>
			<label className="block text-sm font-medium text-slate-700" htmlFor="friend-code-input">
				Add a friend by code
			</label>
			<input
				id="friend-code-input"
				className="w-full rounded border border-teal-600 px-3 py-2 font-mono uppercase tracking-wider"
				type="text"
				autoComplete="off"
				spellCheck={ false }
				placeholder="Enter friend code"
				value={ friendCode }
				onChange={ ( event ) => setFriendCode( event.target.value ) }
				disabled={ isSubmitting }
			/>
			<button
				className="rounded bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
				type="submit"
				disabled={ isSubmitting || friendCode.trim().length === 0 }
			>
				{ isSubmitting ? "Adding..." : "Add friend" }
			</button>
		</form>
	);
}
