"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuText,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function getInitials( name: string | null | undefined, email: string | null | undefined ) {
	const source = name?.trim() || email?.trim() || "U";
	const parts = source.split( /\s+/ ).filter( Boolean );
	if ( parts.length >= 2 ) {
		return `${ parts[0].slice( 0, 1 ) }${ parts[1].slice( 0, 1 ) }`.toUpperCase();
	}
	return source.slice( 0, 2 ).toUpperCase();
}

export function AuthButtons() {
	const { data: session, status } = useSession();

	function handleSignOut() {
		const callbackUrl = typeof window !== "undefined" ? window.location.origin : undefined;
		return signOut( callbackUrl ? { callbackUrl } : undefined );
	}

	function handleSignIn() {
		const callbackUrl = typeof window !== "undefined" ? window.location.origin : undefined;
		return signIn( "google", callbackUrl ? { callbackUrl } : undefined );
	}

	if ( status === "loading" ) {
		return <span className="text-sm text-slate-600">Checking session...</span>;
	}

	if ( !session?.user ) {
		return (
			<button
				className="rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white"
				onClick={ handleSignIn }
				type="button"
			>
				Sign in with Google
			</button>
		);
	}

	const email = session.user.email ?? "Signed in";
	const displayName = session.user.name ?? "Signed in user";
	const initials = getInitials( session.user.name, session.user.email );

	return (
		<div className="flex items-center gap-2">
			<div className="hidden items-center gap-2 md:flex">
				<span className="text-sm text-slate-700">{ email }</span>
				<button
					className="rounded border border-slate-300 px-3 py-2 text-sm"
					onClick={ handleSignOut }
					type="button"
				>
					Sign out
				</button>
			</div>

			<div className="md:hidden">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<button className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400" type="button" aria-label="Open account menu">
							<Avatar>
								<AvatarImage src={ session.user.image ?? undefined } alt={ displayName } />
								<AvatarFallback>{ initials }</AvatarFallback>
							</Avatar>
						</button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuText className="font-medium text-slate-800">{ displayName }</DropdownMenuText>
						<DropdownMenuText>{ email }</DropdownMenuText>
						<DropdownMenuSeparator className="my-1 h-px bg-slate-200" />
						<DropdownMenuItem onSelect={ handleSignOut }>Sign out</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}
