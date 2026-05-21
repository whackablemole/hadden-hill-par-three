import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import Providers from "@/app/providers";
import { AuthButtons } from "@/components/auth/AuthButtons";

export const metadata: Metadata = {
	title: "Hadden Hill Scorekeeper",
	description: "Live scorekeeping for Hadden Hill par-three rounds",
};

export default function RootLayout( {
	children,
}: Readonly<{ children: React.ReactNode }> ) {
	return (
		<html lang="en">
			<body className="min-h-screen bg-slate-50 text-slate-900">
				<Providers>
					<header className="border-b border-slate-200 bg-white">
						<div className="mx-auto flex max-w-5xl items-center justify-between p-4">
							<Link className="font-semibold" href="/">
								Hadden Hill Scorekeeper
							</Link>
							<AuthButtons />
						</div>
					</header>
					{ children }
				</Providers>
			</body>
		</html>
	);
}
