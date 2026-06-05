interface FriendAccessStateProps {
	status: "not-friend" | "not-found" | "error";
}

export function FriendAccessState( { status }: FriendAccessStateProps ) {
	if ( status === "not-found" ) {
		return (
			<section className="rounded border border-red-200 bg-red-50 p-4 text-red-900">
				<h2 className="text-lg font-semibold">Friend not found</h2>
				<p className="mt-1 text-sm">That user could not be found. Check the link or return to your friends list.</p>
			</section>
		);
	}

	if ( status === "not-friend" ) {
		return (
			<section className="rounded border border-amber-200 bg-amber-50 p-4 text-amber-900">
				<h2 className="text-lg font-semibold">Friend access required</h2>
				<p className="mt-1 text-sm">You can only view details for users already connected as friends.</p>
			</section>
		);
	}

	return (
		<section className="rounded border border-slate-300 bg-slate-100 p-4 text-slate-800">
			<h2 className="text-lg font-semibold">Unable to load friend details</h2>
			<p className="mt-1 text-sm">Try again in a moment.</p>
		</section>
	);
}
