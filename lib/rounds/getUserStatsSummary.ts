import { prisma } from "@/lib/db/prisma";

interface UserStatsSummary {
	roundsPlayed: number;
	holesPlayed: number;
	totalStrokes: number;
	bestRoundSixHoles: number | null;
	totalPutts: number;
	totalChipIns: number;
	totalOnePutts: number;
	totalTwoPutts: number;
	totalThreePutts: number;
	totalFourPlusPutts: number;
	totalThreePuttPlus: number;
	totalGir: number;
	averagePuttsPerHole: number;
	totalBirdies: number;
	totalPars: number;
	totalBogeys: number;
	totalDoubleBogeys: number;
	totalTripleBogeyPlus: number;
	mostFrequentScoreByHole: Array<{
		hole: number;
		score: number | null;
		count: number;
	}>;
	optimumRound: {
		holes: Array<{
			hole: number;
			bestScore: number | null;
		}>;
		totalStrokes: number | null;
	};
}

export async function getUserStatsSummary( userId: string ): Promise<UserStatsSummary> {
	const rounds = await prisma.round.findMany( {
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
	} );

	const roundsPlayed = rounds.length;
	const holesPlayed = rounds.reduce( ( sum, r ) => sum + r.targetHoleCount, 0 );
	const totalStrokes = rounds.reduce( ( sum, r ) => sum + r.totalStrokes, 0 );
	const totalPutts = rounds.reduce( ( sum, r ) => sum + r.totalPutts, 0 );
	const sixHoleRounds = rounds.filter( ( round ) => round.targetHoleCount === 6 );
	const bestRoundSixHoles = sixHoleRounds.length > 0
		? Math.min( ...sixHoleRounds.map( ( round ) => round.totalStrokes ) )
		: null;

	const holeEntries = await prisma.holeEntry.findMany( {
		where: {
			round: {
				userId,
				status: "COMPLETED",
			},
		},
		select: {
			baseHoleId: true,
			strokes: true,
			putts: true,
			greenInRegulation: true,
		},
	} );

	const totalChipIns = holeEntries.filter( ( entry ) => entry.putts === 0 ).length;
	const totalOnePutts = holeEntries.filter( ( entry ) => entry.putts === 1 ).length;
	const totalTwoPutts = holeEntries.filter( ( entry ) => entry.putts === 2 ).length;
	const totalThreePutts = holeEntries.filter( ( entry ) => entry.putts === 3 ).length;
	const totalFourPlusPutts = holeEntries.filter( ( entry ) => entry.putts >= 4 ).length;
	const totalThreePuttPlus = holeEntries.filter( ( entry ) => entry.putts >= 3 ).length;
	const totalGir = holeEntries.filter( ( entry ) => entry.greenInRegulation ).length;

	const mostFrequentScoreByHole = Array.from( { length: 6 }, ( _, index ) => {
		const hole = index + 1;
		const entriesForHole = holeEntries.filter( ( entry ) => entry.baseHoleId === hole );

		if ( entriesForHole.length === 0 ) {
			return {
				hole,
				score: null,
				count: 0,
			};
		}

		const countsByScore = new Map<number, number>();
		for ( const entry of entriesForHole ) {
			countsByScore.set( entry.strokes, ( countsByScore.get( entry.strokes ) ?? 0 ) + 1 );
		}

		let bestScore: number | null = null;
		let bestCount = 0;
		for ( const [ score, count ] of countsByScore.entries() ) {
			const isBetterCount = count > bestCount;
			const isSameCountLowerScore = count === bestCount && ( bestScore === null || score < bestScore );
			if ( isBetterCount || isSameCountLowerScore ) {
				bestScore = score;
				bestCount = count;
			}
		}

		return {
			hole,
			score: bestScore,
			count: bestCount,
		};
	} );

	const optimumRoundHoles = Array.from( { length: 6 }, ( _, index ) => {
		const hole = index + 1;
		const entriesForHole = holeEntries.filter( ( entry ) => entry.baseHoleId === hole );
		if ( entriesForHole.length === 0 ) {
			return {
				hole,
				bestScore: null,
			};
		}

		const bestScore = Math.min( ...entriesForHole.map( ( entry ) => entry.strokes ) );
		return {
			hole,
			bestScore,
		};
	} );

	const optimumRoundTotalStrokes = optimumRoundHoles.some( ( hole ) => hole.bestScore === null )
		? null
		: optimumRoundHoles.reduce( ( sum, hole ) => sum + ( hole.bestScore ?? 0 ), 0 );

	return {
		roundsPlayed,
		holesPlayed,
		totalStrokes,
		bestRoundSixHoles,
		totalPutts,
		totalChipIns,
		totalOnePutts,
		totalTwoPutts,
		totalThreePutts,
		totalFourPlusPutts,
		totalThreePuttPlus,
		totalGir,
		averagePuttsPerHole: holesPlayed === 0 ? 0 : totalPutts / holesPlayed,
		totalBirdies: rounds.reduce( ( sum, r ) => sum + r.totalBirdies, 0 ),
		totalPars: rounds.reduce( ( sum, r ) => sum + r.totalPars, 0 ),
		totalBogeys: rounds.reduce( ( sum, r ) => sum + r.totalBogeys, 0 ),
		totalDoubleBogeys: rounds.reduce( ( sum, r ) => sum + r.totalDoubleBogeys, 0 ),
		totalTripleBogeyPlus: rounds.reduce( ( sum, r ) => sum + r.totalTripleBogeyPlus, 0 ),
		mostFrequentScoreByHole,
		optimumRound: {
			holes: optimumRoundHoles,
			totalStrokes: optimumRoundTotalStrokes,
		},
	};
}
