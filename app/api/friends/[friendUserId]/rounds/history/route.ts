import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { friendErrorResponse, friendJsonResponse } from "@/lib/friends/http";
import { resolveFriendAccess } from "@/lib/friends/permissions";
import { toFriendRoundSummaryView } from "@/lib/friends/projections";
import { friendHistoryStatusSchema } from "@/lib/friends/schemas";
import { getAuthenticatedUser } from "@/lib/rounds/ownership";

interface RouteContext {
	params: {
		friendUserId: string;
	};
}

export async function GET( request: NextRequest, { params }: RouteContext ) {
	const user = await getAuthenticatedUser();
	if ( !user ) {
		return friendErrorResponse( 401, "UNAUTHORIZED", "Authentication is required." );
	}

	const access = await resolveFriendAccess( user.id, params.friendUserId );
	if ( !access.allowed ) {
		return friendErrorResponse( access.status, access.code, access.message );
	}

	const statusParam = request.nextUrl.searchParams.get( "status" );
	let parsedStatus: "IN_PROGRESS" | "COMPLETED" | undefined;
	if ( statusParam ) {
		const statusResult = friendHistoryStatusSchema.safeParse( statusParam );
		if ( !statusResult.success ) {
			return friendErrorResponse( 400, "INVALID_STATUS", "Status must be IN_PROGRESS or COMPLETED." );
		}
		parsedStatus = statusResult.data;
	}

	const rounds = await prisma.round.findMany( {
		where: {
			userId: access.targetUser.id,
			status: parsedStatus,
		},
		orderBy: [
			{ playedOn: "desc" },
			{ createdAt: "desc" },
		],
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
		},
	} );

	return friendJsonResponse( { rounds: rounds.map( toFriendRoundSummaryView ) } );
}
