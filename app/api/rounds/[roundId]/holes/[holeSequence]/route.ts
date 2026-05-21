import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { roundLogger } from "@/lib/observability/roundLogger";
import { ensureCanonicalCourseHoles } from "@/lib/rounds/courseHoles";
import { errorResponse } from "@/lib/rounds/http";
import { getAuthenticatedUser, getOwnedRound } from "@/lib/rounds/ownership";
import { upsertHoleEntrySchema } from "@/lib/rounds/schemas";

interface RouteContext {
	params: {
		roundId: string;
		holeSequence: string;
	};
}

export async function PUT( request: NextRequest, { params }: RouteContext ) {
	const startedAt = Date.now();
	const user = await getAuthenticatedUser();
	if ( !user ) {
		return errorResponse( 401, "UNAUTHORIZED", "Authentication is required." );
	}

	const round = await getOwnedRound( params.roundId, user.id );
	if ( !round ) {
		return errorResponse( 404, "ROUND_NOT_FOUND", "Round not found." );
	}

	if ( round.status === "COMPLETED" ) {
		return errorResponse( 409, "ROUND_COMPLETED", "Completed rounds cannot be edited." );
	}

	const holeSequence = Number( params.holeSequence );
	if ( !Number.isInteger( holeSequence ) || holeSequence < 1 || holeSequence > round.targetHoleCount ) {
		return errorResponse( 400, "INVALID_HOLE_SEQUENCE", "Hole sequence is out of range." );
	}

	try {
		await ensureCanonicalCourseHoles();
		const payload = upsertHoleEntrySchema.parse( await request.json() );
		const persistedPayload = {
			...payload,
			penalties: payload.penalties ? 1 : 0,
			bunkers: payload.bunkers ? 1 : 0,
		};
		const baseHoleId = ( ( holeSequence - 1 ) % 6 ) + 1;

		const entry = await prisma.holeEntry.upsert( {
			where: {
				roundId_holeSequence: {
					roundId: params.roundId,
					holeSequence,
				},
			},
			update: {
				...persistedPayload,
				baseHoleId,
			},
			create: {
				roundId: params.roundId,
				holeSequence,
				baseHoleId,
				...persistedPayload,
			},
		} );

		roundLogger.info( {
			action: "round.hole.upsert",
			roundId: params.roundId,
			userId: user.id,
			durationMs: Date.now() - startedAt,
			meta: { holeSequence },
		} );

		return NextResponse.json( entry );
	} catch {
		return errorResponse( 400, "INVALID_HOLE_PAYLOAD", "Invalid hole entry payload." );
	}
}
