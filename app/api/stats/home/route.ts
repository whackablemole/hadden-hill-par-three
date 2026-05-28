import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { errorResponse } from "@/lib/rounds/http";
import { getAuthenticatedUser } from "@/lib/rounds/ownership";

type Scope = "lifetime" | "last-round";

interface HomeStats {
	totalRounds: number;
	holesPlayed: number;
	totalStrokes: number;
	averagePuttsPerHole: number;
	bestRoundSixHoles: number | null;
	totalBirdies: number;
	totalPars: number;
	totalGir: number;
	girPercentage: number;
}

function calculateGirPercentage( totalGir: number, holesPlayed: number ) {
	if ( holesPlayed <= 0 ) {
		return 0;
	}
	return ( totalGir / holesPlayed ) * 100;
}

export async function GET( request: NextRequest ) {
	const user = await getAuthenticatedUser();
	if ( !user ) {
		return errorResponse( 401, "UNAUTHORIZED", "Authentication is required." );
	}

	const scopeParam = request.nextUrl.searchParams.get( "scope" );
	const scope: Scope = scopeParam === "last-round" ? "last-round" : "lifetime";

	const completedRounds = await prisma.round.findMany( {
		where: {
			userId: user.id,
			status: "COMPLETED",
		},
		orderBy: [
			{ playedOn: "desc" },
			{ createdAt: "desc" },
			{ id: "desc" },
		],
		select: {
			id: true,
			targetHoleCount: true,
			totalStrokes: true,
			totalPutts: true,
			totalBirdies: true,
			totalPars: true,
		},
	} );

	if ( completedRounds.length === 0 ) {
		const emptyStats: HomeStats = {
			totalRounds: 0,
			holesPlayed: 0,
			totalStrokes: 0,
			averagePuttsPerHole: 0,
			bestRoundSixHoles: null,
			totalBirdies: 0,
			totalPars: 0,
			totalGir: 0,
			girPercentage: 0,
		};
		return NextResponse.json( { scope, stats: emptyStats } );
	}

	const roundsForScope = scope === "last-round" ? [ completedRounds[ 0 ] ] : completedRounds;
	const roundIds = roundsForScope.map( ( round ) => round.id );

	const girCounts = await prisma.holeEntry.groupBy( {
		by: [ "roundId" ],
		where: {
			roundId: { in: roundIds },
			greenInRegulation: true,
		},
		_count: {
			_all: true,
		},
	} );

	const girCountByRoundId = new Map( girCounts.map( ( item ) => [ item.roundId, item._count._all ] ) );

	const holesPlayed = roundsForScope.reduce( ( sum, round ) => sum + round.targetHoleCount, 0 );
	const totalStrokes = roundsForScope.reduce( ( sum, round ) => sum + round.totalStrokes, 0 );
	const totalPutts = roundsForScope.reduce( ( sum, round ) => sum + round.totalPutts, 0 );
	const totalRounds = roundsForScope.length;
	const totalBirdies = roundsForScope.reduce( ( sum, round ) => sum + round.totalBirdies, 0 );
	const totalPars = roundsForScope.reduce( ( sum, round ) => sum + round.totalPars, 0 );
	const totalGir = roundsForScope.reduce( ( sum, round ) => sum + ( girCountByRoundId.get( round.id ) ?? 0 ), 0 );

	const sixHoleRoundsForScope = roundsForScope.filter( ( round ) => round.targetHoleCount === 6 );
	const bestRoundSixHoles = sixHoleRoundsForScope.length > 0
		? Math.min( ...sixHoleRoundsForScope.map( ( round ) => round.totalStrokes ) )
		: null;

	const stats: HomeStats = {
		totalRounds,
		holesPlayed,
		totalStrokes,
		averagePuttsPerHole: holesPlayed <= 0 ? 0 : totalPutts / holesPlayed,
		bestRoundSixHoles,
		totalBirdies,
		totalPars,
		totalGir,
		girPercentage: calculateGirPercentage( totalGir, holesPlayed ),
	};

	return NextResponse.json( { scope, stats } );
}
