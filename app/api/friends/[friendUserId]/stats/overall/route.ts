import { getUserStatsSummary } from "@/lib/rounds/getUserStatsSummary";
import { friendErrorResponse, friendJsonResponse } from "@/lib/friends/http";
import { resolveFriendAccess } from "@/lib/friends/permissions";
import { toFriendOverallStatsView } from "@/lib/friends/projections";
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
		return friendErrorResponse( access.status, access.code, access.message );
	}

	const stats = await getUserStatsSummary( access.targetUser.id );
	return friendJsonResponse( toFriendOverallStatsView( stats ) );
}
