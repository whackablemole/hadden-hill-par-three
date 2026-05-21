import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { roundLogger } from "@/lib/observability/roundLogger";
import { getAuthenticatedUser } from "@/lib/rounds/ownership";
import { createRoundSchema } from "@/lib/rounds/schemas";
import { errorResponse } from "@/lib/rounds/http";

export async function POST(request: NextRequest) {
  const startedAt = Date.now();
  const user = await getAuthenticatedUser();

  if (!user) {
    return errorResponse(401, "UNAUTHORIZED", "Authentication is required.");
  }

  try {
    const payload = createRoundSchema.parse(await request.json());
    const round = await prisma.round.create({
      data: {
        userId: user.id,
        playedOn: new Date(payload.playedOn),
        targetHoleCount: payload.targetHoleCount,
      },
    });

    roundLogger.info({
      action: "round.create",
      roundId: round.id,
      userId: user.id,
      durationMs: Date.now() - startedAt,
    });

    return NextResponse.json(round, { status: 201 });
  } catch (error) {
    roundLogger.error({
      action: "round.create.failed",
      userId: user.id,
      durationMs: Date.now() - startedAt,
      message: error instanceof Error ? error.message : "Unknown error",
    });

    return errorResponse(400, "INVALID_ROUND_PAYLOAD", "Invalid round payload.");
  }
}
