import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// next-auth v4 expects NEXTAUTH_URL/NEXTAUTH_SECRET.
// Mirror AUTH_URL/AUTH_SECRET so local config remains compatible.
if ( !process.env.NEXTAUTH_URL && process.env.AUTH_URL ) {
	process.env.NEXTAUTH_URL = process.env.AUTH_URL;
}

if ( !process.env.NEXTAUTH_SECRET && process.env.AUTH_SECRET ) {
	process.env.NEXTAUTH_SECRET = process.env.AUTH_SECRET;
}

export const authOptions: NextAuthOptions = {
	secret: process.env.NEXTAUTH_SECRET,
	providers: [
		GoogleProvider( {
			clientId: process.env.AUTH_GOOGLE_ID ?? "",
			clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
		} ),
	],
	session: {
		strategy: "jwt",
	},
	callbacks: {
		async jwt( { token, user, profile } ) {
			const profilePicture = profile && "picture" in profile && typeof profile.picture === "string" ? profile.picture : undefined;
			const userImage = typeof user?.image === "string" ? user.image : undefined;
			const tokenPicture = typeof token.picture === "string" ? token.picture : undefined;

			token.picture = userImage ?? profilePicture ?? tokenPicture;
			return token;
		},
		async session( { session, token } ) {
			if ( session.user && token.sub ) {
				( session.user as { id?: string } ).id = token.sub;
				session.user.image = typeof token.picture === "string" ? token.picture : session.user.image ?? null;
			}
			return session;
		},
	},
};
