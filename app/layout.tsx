import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Providers from "@/app/providers";
import { AuthButtons } from "@/components/auth/AuthButtons";
import { AppBreadcrumbs } from "@/components/navigation/AppBreadcrumbs";
import { InProgressPageTransition } from "@/components/navigation/InProgressPageTransition";
import { MobileFooterNav } from "@/components/navigation/MobileFooterNav";

export const metadata: Metadata = {
	title: "WM Caddy",
	description: "Live scorekeeping for Hadden Hill par-three rounds",
};

export default function RootLayout( {
	children,
}: Readonly<{ children: React.ReactNode }> ) {
	return (
		<html lang="en">
			<body className="min-h-screen bg-slate-50 pb-24 text-slate-900 sm:pb-0">
				<Providers>
					<header className="border-b border-slate-200 bg-white">
						<div className="mx-auto flex max-w-5xl items-center justify-between p-4">
							<div className="flex items-center gap-6">
								<Link className="inline-flex items-center" href="/" aria-label="WM Caddy home">
									<Image src="/wm-logo.svg" alt="WM Caddy" width={ 40 } height={ 40 } priority />
								</Link>
								<nav className="hidden items-center gap-4 text-sm font-medium text-slate-700 sm:flex" aria-label="Desktop navigation">
									<Link className="rounded px-2 py-1 hover:bg-slate-100 hover:text-teal-700" href="/">
										Clubhouse
									</Link>
									<Link className="rounded px-2 py-1 hover:bg-slate-100 hover:text-teal-700" href="/rounds/new">
										Start Round
									</Link>
									<Link className="rounded px-2 py-1 hover:bg-slate-100 hover:text-teal-700" href="/friends">
										Friends
									</Link>
									<Link className="rounded px-2 py-1 hover:bg-slate-100 hover:text-teal-700" href="/rounds/history">
										History
									</Link>
									<Link className="rounded px-2 py-1 hover:bg-slate-100 hover:text-teal-700" href="/stats">
										My Stats
									</Link>
								</nav>
							</div>
							<AuthButtons />
						</div>
					</header>
					<div className="mx-auto max-w-5xl px-4 pt-3">
						<AppBreadcrumbs />
					</div>
					<InProgressPageTransition>{ children }</InProgressPageTransition>
					<MobileFooterNav />
				</Providers>
			</body>
		</html>
	);
}
