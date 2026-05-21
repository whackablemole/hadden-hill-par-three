"use client";

import { useState } from "react";

interface DeleteRoundButtonProps {
	roundId: string;
	onDeleted?: () => void;
}

export function DeleteRoundButton( { roundId, onDeleted }: DeleteRoundButtonProps ) {
	const [ isDeleting, setIsDeleting ] = useState( false );
	const [ isDialogOpen, setIsDialogOpen ] = useState( false );

	async function removeRound() {
		setIsDeleting( true );
		try {
			const response = await fetch( `/api/rounds/${ roundId }`, { method: "DELETE" } );
			if ( !response.ok ) {
				throw new Error( "Failed to delete round" );
			}
			onDeleted?.();
		} catch ( error ) {
			console.error( error );
			alert( "Unable to delete round." );
		} finally {
			setIsDeleting( false );
		}
	}

	return (
		<>
			<button
				className="w-full rounded bg-red-700 px-3 py-2 text-sm text-white sm:w-auto"
				type="button"
				onClick={ () => setIsDialogOpen( true ) }
				disabled={ isDeleting }
			>
				Delete
			</button>

			{ isDialogOpen ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
					<div className="w-full max-w-md rounded border border-slate-200 bg-white p-4 shadow-lg">
						<h3 className="text-lg font-semibold text-slate-900">Delete round?</h3>
						<p className="mt-2 text-sm text-slate-700">
							This action cannot be undone. Deleting this round will update your overall stats.
						</p>
						<div className="mt-4 flex justify-end gap-2">
							<button
								className="rounded border border-slate-300 px-3 py-2 text-sm"
								type="button"
								onClick={ () => setIsDialogOpen( false ) }
								disabled={ isDeleting }
							>
								Cancel
							</button>
							<button
								className="rounded bg-red-700 px-3 py-2 text-sm text-white disabled:opacity-60"
								type="button"
								onClick={ async () => {
									await removeRound();
									setIsDialogOpen( false );
								} }
								disabled={ isDeleting }
							>
								{ isDeleting ? "Deleting..." : "Delete round" }
							</button>
						</div>
					</div>
				</div>
			) : null }
		</>
	);
}
