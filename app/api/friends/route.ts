import { NextRequest } from "next/server";
import { roundLogger } from "@/lib/observability/roundLogger";
import { addFriendByCode, listFriendSummaries } from "@/lib/friends/friendships";
import { friendErrorResponse, friendJsonResponse } from "@/lib/friends/http";
import { toFriendSummaryView } from "@/lib/friends/projections";
import { addFriendByCodeSchema } from "@/lib/friends/schemas";
import { getAuthenticatedUser } from "@/lib/rounds/ownership";

export async function GET() {
	const user = await getAuthenticatedUser();
	if ( !user ) {
		return friendErrorResponse( 401, "UNAUTHORIZED", "Authentication is required." );
	}

	const friends = await listFriendSummaries( user.id );
	return friendJsonResponse( { friends: friends.map( toFriendSummaryView ) } );
}

export async function POST( request: NextRequest ) {
	const startedAt = Date.now();
	const user = await getAuthenticatedUser();
	if ( !user ) {
		return friendErrorResponse( 401, "UNAUTHORIZED", "Authentication is required." );
	}

	const payloadResult = addFriendByCodeSchema.safeParse( await request.json() );
	if ( !payloadResult.success ) {
		return friendErrorResponse( 400, "INVALID_FRIEND_CODE", "Friend code must be 6 to 32 alphanumeric characters." );
	}

	const result = await addFriendByCode( user.id, payloadResult.data.friendCode );
	if ( result.status === "invalid" ) {
		return friendErrorResponse( 400, "INVALID_FRIEND_CODE", "Friend code not found. Check and try again." );
	}

	if ( result.status === "self" ) {
		return friendErrorResponse( 400, "SELF_FRIEND_CODE", "You cannot add your own friend code." );
	}

	if ( result.status === "duplicate" ) {
		roundLogger.warn( {
			action: "friend.add.duplicate",
			userId: user.id,
			durationMs: Date.now() - startedAt,
			meta: { friendUserId: result.friend.friendUserId },
		} );
		return friendErrorResponse( 409, "ALREADY_FRIENDS", "You are already connected with this friend." );
	}

	roundLogger.info( {
		action: "friend.add.created",
		userId: user.id,
		durationMs: Date.now() - startedAt,
		meta: { friendUserId: result.friend.friendUserId },
	} );

	return friendJsonResponse( toFriendSummaryView( result.friend ), 201 );
}
