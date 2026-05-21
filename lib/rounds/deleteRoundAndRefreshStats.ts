import { prisma } from "@/lib/db/prisma";
import { getUserStatsSummary } from "@/lib/rounds/getUserStatsSummary";

export async function deleteRoundAndRefreshStats( roundId: string, userId: string ) {
	await prisma.round.deleteMany( {
		where: {
			id: roundId,
			userId,
		},
	} );

	return getUserStatsSummary( userId );
}
