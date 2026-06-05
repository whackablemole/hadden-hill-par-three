import { Round, RoundStatus } from "@prisma/client";

export interface FriendProfileView {
	friendUserId: string;
	displayName: string;
}

export interface FriendSummaryView {
	friendUserId: string;
	displayName: string;
	connectedAt: string;
}

export interface FriendOverallStatsView {
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

export interface FriendRoundSummaryView {
	id: string;
	playedOn: string;
	targetHoleCount: number;
	status: RoundStatus;
	totalStrokes: number;
	totalPutts: number;
	averagePuttsPerHole: number;
	totalBirdies: number;
	totalPars: number;
	totalBogeys: number;
	totalDoubleBogeys: number;
	totalTripleBogeyPlus: number;
}

type FriendRoundSource = Pick<
	Round,
	| "id"
	| "playedOn"
	| "targetHoleCount"
	| "status"
	| "totalStrokes"
	| "totalPutts"
	| "averagePuttsPerHole"
	| "totalBirdies"
	| "totalPars"
	| "totalBogeys"
	| "totalDoubleBogeys"
	| "totalTripleBogeyPlus"
>;

function displayNameOrFallback( name: string | null | undefined ) {
	const value = name?.trim();
	return value && value.length > 0 ? value : "Unnamed golfer";
}

export function toFriendSummaryView( summary: FriendSummaryView ): FriendSummaryView {
	return {
		friendUserId: summary.friendUserId,
		displayName: displayNameOrFallback( summary.displayName ),
		connectedAt: summary.connectedAt,
	};
}

export function toFriendProfileView( user: { id: string; name: string | null } ): FriendProfileView {
	return {
		friendUserId: user.id,
		displayName: displayNameOrFallback( user.name ),
	};
}

export function toFriendOverallStatsView( stats: {
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
} ): FriendOverallStatsView {
	return {
		roundsPlayed: stats.roundsPlayed,
		holesPlayed: stats.holesPlayed,
		totalStrokes: stats.totalStrokes,
		totalPutts: stats.totalPutts,
		averagePuttsPerHole: stats.averagePuttsPerHole,
		totalBirdies: stats.totalBirdies,
		totalPars: stats.totalPars,
		totalBogeys: stats.totalBogeys,
		totalDoubleBogeys: stats.totalDoubleBogeys,
		totalTripleBogeyPlus: stats.totalTripleBogeyPlus,
	};
}

export function toFriendRoundSummaryView( round: FriendRoundSource ): FriendRoundSummaryView {
	return {
		id: round.id,
		playedOn: round.playedOn.toISOString().slice( 0, 10 ),
		targetHoleCount: round.targetHoleCount,
		status: round.status,
		totalStrokes: round.totalStrokes,
		totalPutts: round.totalPutts,
		averagePuttsPerHole: round.averagePuttsPerHole,
		totalBirdies: round.totalBirdies,
		totalPars: round.totalPars,
		totalBogeys: round.totalBogeys,
		totalDoubleBogeys: round.totalDoubleBogeys,
		totalTripleBogeyPlus: round.totalTripleBogeyPlus,
	};
}
