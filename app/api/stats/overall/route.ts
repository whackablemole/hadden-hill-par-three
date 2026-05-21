import { NextResponse } from "next/server";
import { getUserStatsSummary } from "@/lib/rounds/getUserStatsSummary";
import { errorResponse } from "@/lib/rounds/http";
import { getAuthenticatedUser } from "@/lib/rounds/ownership";

export async function GET() {
	const user = await getAuthenticatedUser();
	if ( !user ) {
		return errorResponse( 401, "UNAUTHORIZED", "Authentication is required." );
	}

	const stats = await getUserStatsSummary( user.id );
	return NextResponse.json( stats );
}
