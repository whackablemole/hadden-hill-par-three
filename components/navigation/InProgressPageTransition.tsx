"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

interface InProgressHistoryResponse {
	rounds?: Array<{ id: string }>;
}

export function InProgressPageTransition( { children }: { children: ReactNode } ) {
	const pathname = usePathname();
	const { data: session, status } = useSession();
	const [ hasInProgressRound, setHasInProgressRound ] = useState( false );

	useEffect( () => {
		if ( status === "loading" ) {
			return;
		}

		if ( !session?.user ) {
			setHasInProgressRound( false );
			return;
		}

		const controller = new AbortController();

		fetch( "/api/rounds/history?status=IN_PROGRESS", {
			cache: "no-store",
			signal: controller.signal,
		} )
			.then( ( response ) => ( response.ok ? response.json() : null ) )
			.then( ( data: InProgressHistoryResponse | null ) => {
				if ( controller.signal.aborted ) {
					return;
				}

				setHasInProgressRound( Array.isArray( data?.rounds ) && data.rounds.length > 0 );
			} )
			.catch( () => {
				if ( controller.signal.aborted ) {
					return;
				}

				setHasInProgressRound( false );
			} );

		return () => {
			controller.abort();
		};
	}, [ pathname, session?.user, status ] );

	const animationClassName = hasInProgressRound
		? "motion-safe:animate-fade-up motion-safe:animate-duration-200 motion-safe:animate-ease-out motion-safe:animate-once"
		: "";

	return (
		<div key={ pathname } className={ animationClassName }>
			{ children }
		</div>
	);
}
