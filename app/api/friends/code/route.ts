import { getAuthenticatedUser } from "@/lib/rounds/ownership";
import { friendErrorResponse, friendJsonResponse } from "@/lib/friends/http";

export async function GET() {
	const user = await getAuthenticatedUser();
	if ( !user ) {
		return friendErrorResponse( 401, "UNAUTHORIZED", "Authentication is required." );
	}

	if ( !user.friendCode ) {
		return friendErrorResponse( 500, "FRIEND_CODE_UNAVAILABLE", "Unable to load friend code." );
	}

	return friendJsonResponse( { friendCode: user.friendCode } );
}
