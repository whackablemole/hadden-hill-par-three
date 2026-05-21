"use client";

import { FormEvent, useEffect, useState } from "react";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/solid";

export interface HoleEntryPayload {
	strokes: number;
	penalties: boolean;
	bunkers: boolean;
	putts: number;
	greenInRegulation: boolean;
}

interface HoleEntryFormProps {
	initialPayload: HoleEntryPayload;
	onSave: ( payload: HoleEntryPayload ) => Promise<void>;
}

export function HoleEntryForm( { initialPayload, onSave }: HoleEntryFormProps ) {
	const [ form, setForm ] = useState<HoleEntryPayload>( initialPayload );
	const [ isSaving, setIsSaving ] = useState( false );

	useEffect( () => {
		setForm( initialPayload );
	}, [ initialPayload ] );

	async function submit( event: FormEvent ) {
		event.preventDefault();
		setIsSaving( true );
		try {
			await onSave( form );
		} finally {
			setIsSaving( false );
		}
	}

	function renderToggle( label: string, checked: boolean, onChange: ( checked: boolean ) => void ) {
		return (
			<label className="flex items-center justify-between rounded border border-slate-200 px-3 py-2 text-sm">
				<span className="font-medium text-slate-700">{ label }</span>
				<span className="relative inline-flex cursor-pointer items-center">
					<input className="peer sr-only" type="checkbox" checked={ checked } onChange={ ( e ) => onChange( e.target.checked ) } />
					<span className="h-6 w-11 rounded-full bg-slate-300 transition-colors peer-checked:bg-emerald-600" />
					<span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
				</span>
			</label>
		);
	}

	function renderStepper(
		label: string,
		value: number,
		min: number,
		onChange: ( nextValue: number ) => void,
	) {
		return (
			<div className="rounded border border-slate-200 px-3 py-2">
				<p className="text-sm font-medium text-slate-700">{ label }</p>
				<div className="mt-2 grid grid-cols-[48px_1fr_48px] items-center gap-2">
					<button
						type="button"
						className="inline-flex h-12 w-12 items-center justify-center rounded border border-slate-300 text-slate-700 disabled:opacity-40"
						onClick={ () => onChange( Math.max( min, value - 1 ) ) }
						disabled={ value <= min }
						aria-label={ `Decrease ${ label.toLowerCase() }` }
					>
						<MinusIcon className="h-5 w-5" />
					</button>
					<div className="flex h-12 items-center justify-center rounded border border-slate-300 text-lg font-semibold text-slate-900">
						{ value }
					</div>
					<button
						type="button"
						className="inline-flex h-12 w-12 items-center justify-center rounded border border-slate-300 text-slate-700"
						onClick={ () => onChange( value + 1 ) }
						aria-label={ `Increase ${ label.toLowerCase() }` }
					>
						<PlusIcon className="h-5 w-5" />
					</button>
				</div>
			</div>
		);
	}

	return (
		<form className="grid gap-3 rounded border border-slate-200 bg-white p-4" onSubmit={ submit }>
			<div className="grid gap-2">
				{ renderStepper( "Strokes", form.strokes, 1, ( nextValue ) => setForm( { ...form, strokes: nextValue } ) ) }
				{ renderStepper( "Putts", form.putts, 0, ( nextValue ) => setForm( { ...form, putts: nextValue } ) ) }
			</div>
			<div className="grid gap-2">
				{ renderToggle( "Penalty", form.penalties, ( checked ) => setForm( { ...form, penalties: checked } ) ) }
				{ renderToggle( "Bunker", form.bunkers, ( checked ) => setForm( { ...form, bunkers: checked } ) ) }
				{ renderToggle( "Green in regulation", form.greenInRegulation, ( checked ) => setForm( { ...form, greenInRegulation: checked } ) ) }
			</div>
			<button className="rounded bg-slate-900 px-3 py-2 text-white" type="submit" disabled={ isSaving }>
				{ isSaving ? "Saving..." : "Save hole" }
			</button>
		</form>
	);
}
