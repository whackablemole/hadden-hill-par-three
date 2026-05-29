import { AnimatedProgressBar } from "@/components/ui/AnimatedProgressBar";

interface RoundProgressProps {
	current: number;
	total: number;
}

export function RoundProgress( { current, total }: RoundProgressProps ) {
	const pct = Math.min( 100, Math.round( ( current / total ) * 100 ) );

	return (
		<div className="rounded border border-slate-200 bg-white p-3">
			<p className="text-sm font-medium">Progress: hole { current } of { total }</p>
			<div className="mt-2">
				<AnimatedProgressBar percentage={ pct } trackClassName="h-2 w-full rounded bg-slate-200" fillClassName="h-2 rounded bg-teal-600 transition-[width] duration-500 ease-out motion-reduce:transition-none" />
			</div>
		</div>
	);
}
