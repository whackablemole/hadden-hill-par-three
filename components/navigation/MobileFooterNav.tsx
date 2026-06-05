"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartBarIcon, ClockIcon, HomeIcon, PlayIcon, UserGroupIcon } from "@heroicons/react/24/outline";

const links = [
	{ href: "/", label: "Clubhouse", icon: HomeIcon },
	{ href: "/rounds/new", label: "Start", icon: PlayIcon },
	{ href: "/friends", label: "Friends", icon: UserGroupIcon },
	{ href: "/rounds/history", label: "History", icon: ClockIcon },
	{ href: "/stats", label: "My Stats", icon: ChartBarIcon },
];

export function MobileFooterNav() {
	const pathname = usePathname();

	return (
		<nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85 sm:hidden" aria-label="Mobile navigation">
			<ul className="grid grid-cols-5 gap-2 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
				{ links.map( ( link ) => {
					const isActive = pathname === link.href;
					const Icon = link.icon;

					return (
						<li key={ link.href }>
							<Link
								href={ link.href }
								className={ `flex flex-col items-center justify-center gap-1 rounded px-1 py-2 text-center text-[11px] font-semibold ${ isActive ? "bg-teal-700 text-white" : "border border-teal-600 text-teal-700" }` }
							>
								<Icon className="h-4 w-4" aria-hidden="true" />
								{ link.label }
							</Link>
						</li>
					);
				} ) }
			</ul>
		</nav>
	);
}
