import { NextRequest, NextResponse } from "next/server";
import { getUserHoleStatsSummary } from "@/lib/rounds/getUserHoleStatsSummary";
import { errorResponse } from "@/lib/rounds/http";
import { getAuthenticatedUser } from "@/lib/rounds/ownership";

interface RouteContext {
	params: {
		holeNumber: string;
	};
}

export async function GET( _request: NextRequest, { params }: RouteContext ) {
	const user = await getAuthenticatedUser();
	if ( !user ) {
		return errorResponse( 401, "UNAUTHORIZED", "Authentication is required." );
	}

	const hole = Number.parseInt( params.holeNumber, 10 );
	if ( !Number.isFinite( hole ) || hole < 1 || hole > 6 ) {
		return errorResponse( 400, "INVALID_HOLE", "Hole must be between 1 and 6." );
	}

	const stats = await getUserHoleStatsSummary( user.id, hole );
	return NextResponse.json( stats );
}
