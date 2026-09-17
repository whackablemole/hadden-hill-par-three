import { prisma } from "@/lib/db/prisma";

export interface HolesSinceStats {
	holesSinceLastThreePutt: number | null;
	holesSinceLastDoubleBogeyPlus: number | null;
}

export async function getHolesSinceStats( userId: string ): Promise<HolesSinceStats> {
	const holeEntries = await prisma.holeEntry.findMany( {
		where: {
			round: {
				userId,
				status: "COMPLETED",
			},
		},
		select: {
			strokes: true,
			putts: true,
		},
		orderBy: [
			{ round: { playedOn: "asc" } },
			{ round: { createdAt: "asc" } },
			{ holeSequence: "asc" },
		],
	} );

	let holesSinceLastThreePutt = 0;
	let holesSinceLastDoubleBogeyPlus = 0;
	let sawThreePutt = false;
	let sawDoubleBogeyPlus = false;

	for ( const entry of holeEntries ) {
		if ( entry.putts >= 3 ) {
			holesSinceLastThreePutt = 0;
			sawThreePutt = true;
		} else {
			holesSinceLastThreePutt += 1;
		}

		if ( entry.strokes >= 5 ) {
			holesSinceLastDoubleBogeyPlus = 0;
			sawDoubleBogeyPlus = true;
		} else {
			holesSinceLastDoubleBogeyPlus += 1;
		}
	}

	return {
		holesSinceLastThreePutt: sawThreePutt ? holesSinceLastThreePutt : null,
		holesSinceLastDoubleBogeyPlus: sawDoubleBogeyPlus ? holesSinceLastDoubleBogeyPlus : null,
	};
}
