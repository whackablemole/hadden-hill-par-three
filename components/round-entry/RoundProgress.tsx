interface RoundProgressProps {
	current: number;
	total: number;
}

export function RoundProgress( { current, total }: RoundProgressProps ) {
	const pct = Math.min( 100, Math.round( ( current / total ) * 100 ) );

	return (
		<div className="rounded border border-slate-200 bg-white p-3">
			<p className="text-sm font-medium">Progress: hole { current } of { total }</p>
			<div className="mt-2 h-2 w-full rounded bg-slate-200">
				<div className="h-2 rounded bg-slate-900" style={ { width: `${ pct }%` } } />
			</div>
		</div>
	);
}
