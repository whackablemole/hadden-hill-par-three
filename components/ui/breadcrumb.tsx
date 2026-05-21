import * as React from "react";
import { ChevronRightIcon } from "@heroicons/react/24/solid";

function cx( ...classes: Array<string | undefined> ) {
	return classes.filter( Boolean ).join( " " );
}

const Breadcrumb = React.forwardRef<HTMLElement, React.ComponentPropsWithoutRef<"nav">>(
	( { className, ...props }, ref ) => (
		<nav ref={ ref } aria-label="Breadcrumb" className={ cx( className ) } { ...props } />
	),
);
Breadcrumb.displayName = "Breadcrumb";

const BreadcrumbList = React.forwardRef<HTMLOListElement, React.ComponentPropsWithoutRef<"ol">>(
	( { className, ...props }, ref ) => (
		<ol
			ref={ ref }
			className={ cx( "flex flex-wrap items-center gap-1.5 text-sm text-slate-600", className ) }
			{ ...props }
		/>
	),
);
BreadcrumbList.displayName = "BreadcrumbList";

const BreadcrumbItem = React.forwardRef<HTMLLIElement, React.ComponentPropsWithoutRef<"li">>(
	( { className, ...props }, ref ) => (
		<li ref={ ref } className={ cx( "inline-flex items-center gap-1.5", className ) } { ...props } />
	),
);
BreadcrumbItem.displayName = "BreadcrumbItem";

const BreadcrumbLink = React.forwardRef<HTMLAnchorElement, React.ComponentPropsWithoutRef<"a">>(
	( { className, ...props }, ref ) => (
		<a
			ref={ ref }
			className={ cx( "transition-colors hover:text-slate-900", className ) }
			{ ...props }
		/>
	),
);
BreadcrumbLink.displayName = "BreadcrumbLink";

const BreadcrumbPage = React.forwardRef<HTMLSpanElement, React.ComponentPropsWithoutRef<"span">>(
	( { className, ...props }, ref ) => (
		<span
			ref={ ref }
			role="link"
			aria-disabled="true"
			aria-current="page"
			className={ cx( "font-medium text-slate-900", className ) }
			{ ...props }
		/>
	),
);
BreadcrumbPage.displayName = "BreadcrumbPage";

function BreadcrumbSeparator( { className, children, ...props }: React.ComponentProps<"li"> ) {
	return (
		<li
			role="presentation"
			aria-hidden="true"
			className={ cx( "text-slate-400", className ) }
			{ ...props }
		>
			{ children ?? <ChevronRightIcon className="h-3.5 w-3.5" /> }
		</li>
	);
}

export {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
};
