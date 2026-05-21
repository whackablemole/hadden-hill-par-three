import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { roundLogger } from "@/lib/observability/roundLogger";
import { calculateRoundStats } from "@/lib/scoring/calculateRoundStats";
import { errorResponse } from "@/lib/rounds/http";
import { getAuthenticatedUser, getOwnedRound } from "@/lib/rounds/ownership";

interface RouteContext {
  params: {
    roundId: string;
  };
}

export async function POST(_request: NextRequest, { params }: RouteContext) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return errorResponse(401, "UNAUTHORIZED", "Authentication is required.");
  }

  const round = await getOwnedRound(params.roundId, user.id);
  if (!round) {
    return errorResponse(404, "ROUND_NOT_FOUND", "Round not found.");
  }

  if (round.holeEntries.length !== round.targetHoleCount) {
    return errorResponse(400, "INCOMPLETE_ROUND", "All holes must be entered before completion.");
  }

  const stats = calculateRoundStats(
    round.holeEntries.map((entry: { strokes: number; putts: number }) => ({
      strokes: entry.strokes,
      putts: entry.putts,
    })),
  );

  const updated = await prisma.round.update({
    where: { id: round.id },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      ...stats,
    },
  });

  roundLogger.info({
    action: "round.complete",
    roundId: updated.id,
    userId: user.id,
  });

  return NextResponse.json(updated);
}
