import { NextResponse } from "next/server";

interface FriendErrorBody {
	error: {
		code: string;
		message: string;
	};
}

export function friendErrorResponse( status: number, code: string, message: string ) {
	const payload: FriendErrorBody = {
		error: { code, message },
	};

	return NextResponse.json( payload, { status } );
}

export function friendJsonResponse<T>( payload: T, status = 200 ) {
	return NextResponse.json( payload, { status } );
}

export function toFriendErrorMessage( data: unknown, fallback: string ) {
	if ( !data || typeof data !== "object" ) {
		return fallback;
	}

	const raw = data as {
		error?: {
			message?: unknown;
		};
	};

	return typeof raw.error?.message === "string" && raw.error.message.length > 0
		? raw.error.message
		: fallback;
}
