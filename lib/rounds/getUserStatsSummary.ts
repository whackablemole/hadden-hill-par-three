import { prisma } from "@/lib/db/prisma";

interface UserStatsSummary {
  roundsPlayed: number;
  holesPlayed: number;
  totalStrokes: number;
  totalPutts: number;
  averagePuttsPerHole: number;
  totalBirdies: number;
  totalPars: number;
  totalBogeys: number;
  totalDoubleBogeys: number;
  totalTripleBogeyPlus: number;
}

export async function getUserStatsSummary(userId: string): Promise<UserStatsSummary> {
  const rounds = await prisma.round.findMany({
    where: { userId, status: "COMPLETED" },
    select: {
      targetHoleCount: true,
      totalStrokes: true,
      totalPutts: true,
      totalBirdies: true,
      totalPars: true,
      totalBogeys: true,
      totalDoubleBogeys: true,
      totalTripleBogeyPlus: true,
    },
  });

  const roundsPlayed = rounds.length;
  const holesPlayed = rounds.reduce((sum, r) => sum + r.targetHoleCount, 0);
  const totalStrokes = rounds.reduce((sum, r) => sum + r.totalStrokes, 0);
  const totalPutts = rounds.reduce((sum, r) => sum + r.totalPutts, 0);

  return {
    roundsPlayed,
    holesPlayed,
    totalStrokes,
    totalPutts,
    averagePuttsPerHole: holesPlayed === 0 ? 0 : totalPutts / holesPlayed,
    totalBirdies: rounds.reduce((sum, r) => sum + r.totalBirdies, 0),
    totalPars: rounds.reduce((sum, r) => sum + r.totalPars, 0),
    totalBogeys: rounds.reduce((sum, r) => sum + r.totalBogeys, 0),
    totalDoubleBogeys: rounds.reduce((sum, r) => sum + r.totalDoubleBogeys, 0),
    totalTripleBogeyPlus: rounds.reduce((sum, r) => sum + r.totalTripleBogeyPlus, 0),
  };
}
