import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { errorResponse } from "@/lib/rounds/http";
import { getAuthenticatedUser } from "@/lib/rounds/ownership";

export async function GET( request: NextRequest ) {
	const user = await getAuthenticatedUser();
	if ( !user ) {
		return errorResponse( 401, "UNAUTHORIZED", "Authentication is required." );
	}

	const status = request.nextUrl.searchParams.get( "status" );
	const rounds = await prisma.round.findMany( {
		where: {
			userId: user.id,
			status: status === "IN_PROGRESS" || status === "COMPLETED" ? status : undefined,
		},
		orderBy: [
			{ playedOn: "desc" },
			{ createdAt: "desc" },
			{ id: "desc" },
		],
	} );

	return NextResponse.json( { rounds } );
}
