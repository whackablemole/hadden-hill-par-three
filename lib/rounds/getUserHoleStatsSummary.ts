import { classifyScore } from "@/lib/scoring/calculateRoundStats";
import { prisma } from "@/lib/db/prisma";

export interface HoleStatsSummary {
	hole: number;
	attempts: number;
	scoreBreakdown: {
		birdies: number;
		pars: number;
		bogeys: number;
		doubleBogeys: number;
		tripleBogeyPlus: number;
	};
	puttBreakdown: {
		onePutts: number;
		twoPutts: number;
		threePutts: number;
		fourPlusPutts: number;
	};
	bunkerHits: number;
	penalties: number;
}

export async function getUserHoleStatsSummary( userId: string, hole: number ): Promise<HoleStatsSummary> {
	const entries = await prisma.holeEntry.findMany( {
		where: {
			baseHoleId: hole,
			round: {
				userId,
				status: "COMPLETED",
			},
		},
		select: {
			strokes: true,
			putts: true,
			bunkers: true,
			penalties: true,
		},
	} );

	const summary: HoleStatsSummary = {
		hole,
		attempts: entries.length,
		scoreBreakdown: {
			birdies: 0,
			pars: 0,
			bogeys: 0,
			doubleBogeys: 0,
			tripleBogeyPlus: 0,
		},
		puttBreakdown: {
			onePutts: 0,
			twoPutts: 0,
			threePutts: 0,
			fourPlusPutts: 0,
		},
		bunkerHits: 0,
		penalties: 0,
	};

	for ( const entry of entries ) {
		const scoreType = classifyScore( entry.strokes, 3 );
		if ( scoreType === "birdie" ) {
			summary.scoreBreakdown.birdies += 1;
		} else if ( scoreType === "par" ) {
			summary.scoreBreakdown.pars += 1;
		} else if ( scoreType === "bogey" ) {
			summary.scoreBreakdown.bogeys += 1;
		} else if ( scoreType === "double" ) {
			summary.scoreBreakdown.doubleBogeys += 1;
		} else {
			summary.scoreBreakdown.tripleBogeyPlus += 1;
		}

		if ( entry.putts <= 1 ) {
			summary.puttBreakdown.onePutts += 1;
		} else if ( entry.putts === 2 ) {
			summary.puttBreakdown.twoPutts += 1;
		} else if ( entry.putts === 3 ) {
			summary.puttBreakdown.threePutts += 1;
		} else {
			summary.puttBreakdown.fourPlusPutts += 1;
		}

		summary.bunkerHits += entry.bunkers;
		summary.penalties += entry.penalties;
	}

	return summary;
}
