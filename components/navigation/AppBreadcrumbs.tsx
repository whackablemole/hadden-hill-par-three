"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface RoundBreadcrumbPayload {
	playedOn: string;
}

const staticRoundsSegments = new Set( [ "history", "new" ] );

function isRoundIdSegment( segments: string[], index: number ) {
	return segments[ 0 ] === "rounds" && index === 1 && !staticRoundsSegments.has( segments[ 1 ] );
}

function titleCase( value: string ) {
	return value
		.split( /[-_]/ )
		.filter( Boolean )
		.map( ( part ) => part.slice( 0, 1 ).toUpperCase() + part.slice( 1 ) )
		.join( " " );
}

function getOrdinalSuffix( day: number ) {
	if ( day >= 11 && day <= 13 ) {
		return "th";
	}

	const lastDigit = day % 10;
	if ( lastDigit === 1 ) {
		return "st";
	}
	if ( lastDigit === 2 ) {
		return "nd";
	}
	if ( lastDigit === 3 ) {
		return "rd";
	}

	return "th";
}

function formatRoundBreadcrumbDate( playedOn: string ) {
	const date = new Date( playedOn );
	if ( Number.isNaN( date.getTime() ) ) {
		return "Round";
	}

	const weekday = new Intl.DateTimeFormat( "en-GB", { weekday: "short", timeZone: "UTC" } ).format( date );
	const day = date.getUTCDate();
	const month = new Intl.DateTimeFormat( "en-GB", { month: "long", timeZone: "UTC" } ).format( date );
	const year = date.getUTCFullYear();

	return `${ weekday } ${ day }${ getOrdinalSuffix( day ) } ${ month } ${ year }`;
}

function getSegmentLabel( segment: string, allSegments: string[] ) {
	if ( segment === "rounds" ) {
		return "Rounds";
	}
	if ( segment === "history" ) {
		return "History";
	}
	if ( segment === "new" ) {
		return "New Round";
	}
	if ( segment === "stats" ) {
		return "My Stats";
	}
	if ( segment === "friends" ) {
		return "Friends";
	}
	if ( allSegments[ 0 ] === "friends" && allSegments[ 1 ] === segment ) {
		return "Friend";
	}
	if ( allSegments[ 0 ] === "friends" && allSegments[ 2 ] === "rounds" && allSegments[ 3 ] === segment ) {
		return "Round";
	}
	if ( allSegments[ 0 ] === "rounds" && allSegments[ 1 ] === segment && !staticRoundsSegments.has( segment ) ) {
		return "Round";
	}
	return titleCase( segment );
}

export function AppBreadcrumbs() {
	const pathname = usePathname();
	const segments = useMemo( () => pathname.split( "/" ).filter( Boolean ), [ pathname ] );
	const [ roundDateLabel, setRoundDateLabel ] = useState<string | null>( null );
	const roundId = useMemo( () => {
		if ( segments[ 0 ] !== "rounds" || !segments[ 1 ] || staticRoundsSegments.has( segments[ 1 ] ) ) {
			return null;
		}

		return segments[ 1 ];
	}, [ segments ] );

	useEffect( () => {
		setRoundDateLabel( null );

		if ( !roundId ) {
			return;
		}

		const controller = new AbortController();
		fetch( `/api/rounds/${ roundId }`, { cache: "no-store", signal: controller.signal } )
			.then( async ( response ) => {
				if ( !response.ok ) {
					return null;
				}
				const data = await response.json() as RoundBreadcrumbPayload;
				return data?.playedOn ? formatRoundBreadcrumbDate( data.playedOn ) : null;
			} )
			.then( ( label ) => {
				if ( label ) {
					setRoundDateLabel( label );
				}
			} )
			.catch( () => {
				// Keep default breadcrumb label if lookup fails.
			} );

		return () => {
			controller.abort();
		};
	}, [ roundId ] );

	if ( segments.length === 0 ) {
		return null;
	}

	return (
		<Breadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem>
					<Link className="transition-colors hover:text-slate-900" href="/">
						Home
					</Link>
				</BreadcrumbItem>
				{ segments.map( ( segment, index ) => {
					const href = index === 0 && segment === "rounds"
						? "/rounds/history"
						: index === 1 && segments[ 0 ] === "stats" && segment === "holes"
							? "/stats#most-frequent-score"
							: `/${ segments.slice( 0, index + 1 ).join( "/" ) }`;
					const currentIsRoundIdSegment = isRoundIdSegment( segments, index );
					const label = currentIsRoundIdSegment && roundDateLabel ? roundDateLabel : getSegmentLabel( segment, segments );
					const isLast = index === segments.length - 1;
					return (
						<div className="contents" key={ `${ index }-${ segment }-${ href }` }>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								{ isLast ? (
									<BreadcrumbPage>{ label }</BreadcrumbPage>
								) : (
									<Link className="transition-colors hover:text-slate-900" href={ href }>
										{ label }
									</Link>
								) }
							</BreadcrumbItem>
						</div>
					);
				} ) }
			</BreadcrumbList>
		</Breadcrumb>
	);
}
