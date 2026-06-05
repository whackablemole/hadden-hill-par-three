import { z } from "zod";
import { normalizeFriendCode } from "@/lib/friends/codes";

export const addFriendByCodeSchema = z.object( {
	friendCode: z.string().trim().min( 6 ).max( 32 ).transform( ( value ) => normalizeFriendCode( value ) ),
} );

export const friendHistoryStatusSchema = z.union( [ z.literal( "IN_PROGRESS" ), z.literal( "COMPLETED" ) ] );

export type AddFriendByCodeInput = z.infer<typeof addFriendByCodeSchema>;
