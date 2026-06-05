import { Prisma } from "@prisma/client";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db/prisma";

const FRIEND_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const DEFAULT_FRIEND_CODE_LENGTH = 8;

export function normalizeFriendCode( value: string ) {
	return value.trim().toUpperCase().replace( /[^A-Z0-9]/g, "" );
}

export function generateFriendCode( length = DEFAULT_FRIEND_CODE_LENGTH ) {
	const bytes = randomBytes( length );
	let code = "";

	for ( let index = 0; index < length; index += 1 ) {
		code += FRIEND_CODE_ALPHABET[ bytes[ index ] % FRIEND_CODE_ALPHABET.length ];
	}

	return code;
}

export async function reserveUniqueFriendCode( attempts = 20 ) {
	for ( let attempt = 0; attempt < attempts; attempt += 1 ) {
		const candidate = generateFriendCode();
		const existing = await prisma.user.findUnique( {
			where: { friendCode: candidate },
			select: { id: true },
		} );

		if ( !existing ) {
			return candidate;
		}
	}

	throw new Error( "Unable to generate a unique friend code." );
}

export async function ensureUserFriendCode( userId: string, existingCode: string | null | undefined ) {
	if ( existingCode ) {
		return existingCode;
	}

	for ( let attempt = 0; attempt < 20; attempt += 1 ) {
		const candidate = await reserveUniqueFriendCode();

		try {
			const updated = await prisma.user.update( {
				where: { id: userId },
				data: { friendCode: candidate },
				select: { friendCode: true },
			} );

			if ( updated.friendCode ) {
				return updated.friendCode;
			}
		} catch ( error ) {
			if ( error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002" ) {
				continue;
			}
			throw error;
		}
	}

	throw new Error( "Unable to provision friend code for user." );
}
