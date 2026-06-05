import { prisma } from "@/lib/db/prisma";
import { areUsersFriends } from "@/lib/friends/friendships";

export type FriendAccessResult =
	| { allowed: true }
	| { allowed: false; reason: "SELF" | "NOT_FRIEND" };

export type FriendTargetAccessResult =
	| { allowed: true; targetUser: { id: string; name: string | null } }
	| { allowed: false; status: 403 | 404; code: "FRIEND_NOT_FOUND" | "SELF_FRIEND_ACCESS_BLOCKED" | "FRIEND_ACCESS_REQUIRED"; message: string };

export async function evaluateFriendAccess( requesterUserId: string, friendUserId: string ): Promise<FriendAccessResult> {
	if ( requesterUserId === friendUserId ) {
		return { allowed: false, reason: "SELF" };
	}

	const allowed = await areUsersFriends( requesterUserId, friendUserId );
	if ( !allowed ) {
		return { allowed: false, reason: "NOT_FRIEND" };
	}

	return { allowed: true };
}

export async function resolveFriendAccess( requesterUserId: string, friendUserId: string ): Promise<FriendTargetAccessResult> {
	const targetUser = await prisma.user.findUnique( {
		where: { id: friendUserId },
		select: {
			id: true,
			name: true,
		},
	} );

	if ( !targetUser ) {
		return {
			allowed: false,
			status: 404,
			code: "FRIEND_NOT_FOUND",
			message: "Friend user not found.",
		};
	}

	if ( requesterUserId === targetUser.id ) {
		return {
			allowed: false,
			status: 403,
			code: "SELF_FRIEND_ACCESS_BLOCKED",
			message: "Use your own stats pages for personal data.",
		};
	}

	if ( !( await areUsersFriends( requesterUserId, targetUser.id ) ) ) {
		return {
			allowed: false,
			status: 403,
			code: "FRIEND_ACCESS_REQUIRED",
			message: "You can only view data for connected friends.",
		};
	}

	return {
		allowed: true,
		targetUser,
	};
}
