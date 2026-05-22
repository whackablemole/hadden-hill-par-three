import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Providers from "@/app/providers";
import { AuthButtons } from "@/components/auth/AuthButtons";
import { AppBreadcrumbs } from "@/components/navigation/AppBreadcrumbs";
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
							<Link className="inline-flex items-center" href="/" aria-label="WM Caddy home">
								<Image src="/wm-logo.svg" alt="WM Caddy" width={ 40 } height={ 40 } priority />
							</Link>
							<AuthButtons />
						</div>
					</header>
					<div className="mx-auto max-w-5xl px-4 pt-3">
						<AppBreadcrumbs />
					</div>
					{ children }
					<MobileFooterNav />
				</Providers>
			</body>
		</html>
	);
}
