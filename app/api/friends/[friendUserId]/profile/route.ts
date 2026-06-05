import { roundLogger } from "@/lib/observability/roundLogger";
import { friendErrorResponse, friendJsonResponse } from "@/lib/friends/http";
import { resolveFriendAccess } from "@/lib/friends/permissions";
import { toFriendProfileView } from "@/lib/friends/projections";
import { getAuthenticatedUser } from "@/lib/rounds/ownership";

interface RouteContext {
	params: {
		friendUserId: string;
	};
}

export async function GET( _request: Request, { params }: RouteContext ) {
	const user = await getAuthenticatedUser();
	if ( !user ) {
		return friendErrorResponse( 401, "UNAUTHORIZED", "Authentication is required." );
	}

	const access = await resolveFriendAccess( user.id, params.friendUserId );
	if ( !access.allowed ) {
		roundLogger.warn( {
			action: "friend.access.denied",
			userId: user.id,
			meta: {
				friendUserId: params.friendUserId,
				reason: access.code,
			},
		} );
		return friendErrorResponse( access.status, access.code, access.message );
	}

	return friendJsonResponse( toFriendProfileView( access.targetUser ) );
}
