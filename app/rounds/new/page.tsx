import { StartRoundForm } from "@/components/round-entry/StartRoundForm";

export default function NewRoundPage() {
	return (
		<main className="mx-auto max-w-xl p-6">
			<h1 className="text-2xl font-bold">Start a new round</h1>
			<p className="mt-1 text-sm text-slate-600">
				Choose date and total holes (6, 12, or 18).
			</p>
			<div className="mt-4">
				<StartRoundForm />
			</div>
		</main>
	);
}
