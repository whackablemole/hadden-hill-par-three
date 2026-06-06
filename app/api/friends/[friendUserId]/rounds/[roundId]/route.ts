import { prisma } from "@/lib/db/prisma";
import { friendErrorResponse, friendJsonResponse } from "@/lib/friends/http";
import { resolveFriendAccess } from "@/lib/friends/permissions";
import { toFriendRoundDetailView } from "@/lib/friends/projections";
import { getAuthenticatedUser } from "@/lib/rounds/ownership";

interface RouteContext {
	params: {
		friendUserId: string;
		roundId: string;
	};
}

export async function GET( _request: Request, { params }: RouteContext ) {
	const user = await getAuthenticatedUser();
	if ( !user ) {
		return friendErrorResponse( 401, "UNAUTHORIZED", "Authentication is required." );
	}

	const access = await resolveFriendAccess( user.id, params.friendUserId );
	if ( !access.allowed ) {
		return friendErrorResponse( access.status, access.code, access.message );
	}

	const round = await prisma.round.findFirst( {
		where: {
			id: params.roundId,
			userId: access.targetUser.id,
			status: "COMPLETED",
		},
		select: {
			id: true,
			playedOn: true,
			targetHoleCount: true,
			status: true,
			totalStrokes: true,
			totalPutts: true,
			averagePuttsPerHole: true,
			totalBirdies: true,
			totalPars: true,
			totalBogeys: true,
			totalDoubleBogeys: true,
			totalTripleBogeyPlus: true,
			holeEntries: {
				orderBy: { holeSequence: "asc" },
				select: {
					holeSequence: true,
					baseHoleId: true,
					strokes: true,
					penalties: true,
					bunkers: true,
					putts: true,
					greenInRegulation: true,
				},
			},
		},
	} );

	if ( !round ) {
		return friendErrorResponse( 404, "ROUND_NOT_FOUND", "Round not found." );
	}

	return friendJsonResponse( toFriendRoundDetailView( round ) );
}
