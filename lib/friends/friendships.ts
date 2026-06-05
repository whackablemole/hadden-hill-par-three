import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { normalizeFriendCode } from "@/lib/friends/codes";

export interface FriendSummary {
	friendUserId: string;
	displayName: string;
	connectedAt: string;
}

export type AddFriendByCodeResult =
	| { status: "created"; friend: FriendSummary }
	| { status: "duplicate"; friend: FriendSummary }
	| { status: "invalid" }
	| { status: "self" };

function displayNameOrFallback( name: string | null ) {
	const trimmed = name?.trim();
	return trimmed && trimmed.length > 0 ? trimmed : "Unnamed golfer";
}

export function canonicalizeFriendPair( userAId: string, userBId: string ) {
	return userAId < userBId
		? { userLowId: userAId, userHighId: userBId }
		: { userLowId: userBId, userHighId: userAId };
}

export async function findFriendshipBetween( userAId: string, userBId: string ) {
	if ( userAId === userBId ) {
		return null;
	}

	const pair = canonicalizeFriendPair( userAId, userBId );
	return prisma.friendship.findUnique( {
		where: {
			userLowId_userHighId: pair,
		},
	} );
}

export async function areUsersFriends( userAId: string, userBId: string ) {
	return Boolean( await findFriendshipBetween( userAId, userBId ) );
}

export async function listFriendSummaries( userId: string ): Promise<FriendSummary[]> {
	const friendships = await prisma.friendship.findMany( {
		where: {
			OR: [
				{ userLowId: userId },
				{ userHighId: userId },
			],
		},
		include: {
			userLow: {
				select: {
					id: true,
					name: true,
				},
			},
			userHigh: {
				select: {
					id: true,
					name: true,
				},
			},
		},
		orderBy: { createdAt: "desc" },
	} );

	return friendships.map( ( friendship ) => {
		const friend = friendship.userLowId === userId ? friendship.userHigh : friendship.userLow;
		return {
			friendUserId: friend.id,
			displayName: displayNameOrFallback( friend.name ),
			connectedAt: friendship.createdAt.toISOString(),
		};
	} );
}

export async function addFriendByCode( userId: string, friendCodeInput: string ): Promise<AddFriendByCodeResult> {
	const friendCode = normalizeFriendCode( friendCodeInput );
	if ( !friendCode ) {
		return { status: "invalid" };
	}

	const target = await prisma.user.findUnique( {
		where: { friendCode },
		select: { id: true, name: true },
	} );
	if ( !target ) {
		return { status: "invalid" };
	}

	if ( target.id === userId ) {
		return { status: "self" };
	}

	const pair = canonicalizeFriendPair( userId, target.id );

	try {
		const created = await prisma.friendship.create( {
			data: pair,
			select: {
				createdAt: true,
			},
		} );

		return {
			status: "created",
			friend: {
				friendUserId: target.id,
				displayName: displayNameOrFallback( target.name ),
				connectedAt: created.createdAt.toISOString(),
			},
		};
	} catch ( error ) {
		if ( !( error instanceof Prisma.PrismaClientKnownRequestError ) || error.code !== "P2002" ) {
			throw error;
		}

		const existing = await prisma.friendship.findUnique( {
			where: {
				userLowId_userHighId: pair,
			},
			select: {
				createdAt: true,
			},
		} );

		return {
			status: "duplicate",
			friend: {
				friendUserId: target.id,
				displayName: displayNameOrFallback( target.name ),
				connectedAt: existing?.createdAt.toISOString() ?? new Date().toISOString(),
			},
		};
	}
}
