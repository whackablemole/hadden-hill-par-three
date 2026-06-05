import Link from "next/link";

interface FriendSummary {
	friendUserId: string;
	displayName: string;
	connectedAt: string;
}

interface FriendsListProps {
	friends: FriendSummary[];
}

function formatConnectedDate( connectedAt: string ) {
	const date = new Date( connectedAt );
	if ( Number.isNaN( date.getTime() ) ) {
		return "Connected recently";
	}

	return new Intl.DateTimeFormat( "en-GB", {
		year: "numeric",
		month: "short",
		day: "numeric",
	} ).format( date );
}

export function FriendsList( { friends }: FriendsListProps ) {
	if ( friends.length === 0 ) {
		return (
			<section className="rounded border border-slate-200 bg-white p-4">
				<h2 className="text-lg font-semibold text-slate-900">Connected friends</h2>
				<p className="mt-2 text-sm text-slate-600">No friends connected yet. Share your code or add one above.</p>
			</section>
		);
	}

	return (
		<section className="rounded border border-slate-200 bg-white p-4">
			<h2 className="text-lg font-semibold text-slate-900">Connected friends</h2>
			<ul className="mt-3 space-y-2">
				{ friends.map( ( friend ) => (
					<li key={ friend.friendUserId }>
						<Link
							href={ `/friends/${ friend.friendUserId }` }
							className="flex items-center justify-between rounded border border-slate-200 px-3 py-2 transition hover:border-teal-500 hover:bg-teal-50"
						>
							<div>
								<p className="font-medium text-slate-900">{ friend.displayName }</p>
								<p className="text-xs text-slate-600">Connected { formatConnectedDate( friend.connectedAt ) }</p>
							</div>
							<span className="text-xs font-semibold text-teal-700">View stats</span>
						</Link>
					</li>
				) ) }
			</ul>
		</section>
	);
}
