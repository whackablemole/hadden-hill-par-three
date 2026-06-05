import { User } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { ensureUserFriendCode } from "@/lib/friends/codes";

export async function getAuthenticatedUser(): Promise<User | null> {
	const session = await getServerSession( authOptions );
	const email = session?.user?.email;

	if ( !email ) {
		return null;
	}

	const user = await prisma.user.upsert( {
		where: { email },
		update: {
			name: session.user?.name ?? null,
			imageUrl: session.user?.image ?? null,
		},
		create: {
			email,
			name: session.user?.name ?? null,
			imageUrl: session.user?.image ?? null,
		},
	} );

	const friendCode = await ensureUserFriendCode( user.id, user.friendCode );
	if ( friendCode !== user.friendCode ) {
		return {
			...user,
			friendCode,
		};
	}

	return user;
}

export async function getOwnedRound( roundId: string, userId: string ) {
	return prisma.round.findFirst( {
		where: { id: roundId, userId },
		include: {
			holeEntries: {
				orderBy: { holeSequence: "asc" },
			},
		},
	} );
}
