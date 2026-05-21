import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { roundLogger } from "@/lib/observability/roundLogger";
import { deleteRoundAndRefreshStats } from "@/lib/rounds/deleteRoundAndRefreshStats";
import { errorResponse } from "@/lib/rounds/http";
import { getAuthenticatedUser, getOwnedRound } from "@/lib/rounds/ownership";

interface RouteContext {
	params: {
		roundId: string;
	};
}

export async function GET( _request: NextRequest, { params }: RouteContext ) {
	const user = await getAuthenticatedUser();

	if ( !user ) {
		return errorResponse( 401, "UNAUTHORIZED", "Authentication is required." );
	}

	const round = await getOwnedRound( params.roundId, user.id );
	if ( !round ) {
		return errorResponse( 404, "ROUND_NOT_FOUND", "Round not found." );
	}

	return NextResponse.json( round );
}

export async function DELETE( _request: NextRequest, { params }: RouteContext ) {
	const user = await getAuthenticatedUser();

	if ( !user ) {
		return errorResponse( 401, "UNAUTHORIZED", "Authentication is required." );
	}

	const startedAt = Date.now();
	const round = await prisma.round.findFirst( { where: { id: params.roundId, userId: user.id } } );
	if ( !round ) {
		return errorResponse( 404, "ROUND_NOT_FOUND", "Round not found." );
	}

	const stats = await deleteRoundAndRefreshStats( params.roundId, user.id );

	roundLogger.info( {
		action: "round.delete",
		roundId: params.roundId,
		userId: user.id,
		durationMs: Date.now() - startedAt,
	} );

	return NextResponse.json( { deleted: true, stats } );
}
