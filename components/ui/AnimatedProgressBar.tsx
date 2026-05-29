"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedProgressBarProps {
	percentage: number;
	trackClassName?: string;
	fillClassName?: string;
}

function clampPercentage( value: number ) {
	if ( !Number.isFinite( value ) ) {
		return 0;
	}

	return Math.max( 0, Math.min( value, 100 ) );
}

export function AnimatedProgressBar( {
	percentage,
	trackClassName = "h-2 w-full rounded-full bg-slate-200",
	fillClassName = "h-2 rounded-full bg-teal-600 transition-[width] duration-500 ease-out motion-reduce:transition-none",
}: AnimatedProgressBarProps ) {
	const [ displayPercentage, setDisplayPercentage ] = useState( 0 );
	const hasAnimatedOnMount = useRef( false );

	useEffect( () => {
		const targetPercentage = clampPercentage( percentage );

		if ( !hasAnimatedOnMount.current ) {
			hasAnimatedOnMount.current = true;
			const timeoutId = window.setTimeout( () => {
				setDisplayPercentage( targetPercentage );
			}, 30 );

			return () => {
				window.clearTimeout( timeoutId );
			};
		}

		setDisplayPercentage( targetPercentage );
	}, [ percentage ] );

	return (
		<div className={ trackClassName }>
			<div className={ fillClassName } style={ { width: `${ displayPercentage }%` } } />
		</div>
	);
}
