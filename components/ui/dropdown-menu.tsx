"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";

function cx( ...classes: Array<string | undefined> ) {
	return classes.filter( Boolean ).join( " " );
}

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuGroup = DropdownMenuPrimitive.Group;
const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
const DropdownMenuSeparator = DropdownMenuPrimitive.Separator;

const DropdownMenuContent = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>( ( { className, sideOffset = 8, ...props }, ref ) => (
	<DropdownMenuPrimitive.Portal>
		<DropdownMenuPrimitive.Content
			ref={ ref }
			sideOffset={ sideOffset }
			className={ cx(
				"z-50 min-w-56 rounded-md border border-slate-200 bg-white p-1.5 text-slate-900 shadow-md",
				className,
			) }
			{ ...props }
		/>
	</DropdownMenuPrimitive.Portal>
) );
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const DropdownMenuLabel = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.Label>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label>
>( ( { className, ...props }, ref ) => (
	<DropdownMenuPrimitive.Label ref={ ref } className={ cx( "px-2 py-1.5 text-sm font-semibold", className ) } { ...props } />
) );
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

const DropdownMenuItem = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.Item>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>
>( ( { className, ...props }, ref ) => (
	<DropdownMenuPrimitive.Item
		ref={ ref }
		className={ cx(
			"relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-slate-100",
			className,
		) }
		{ ...props }
	/>
) );
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

const DropdownMenuText = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>( ( { className, ...props }, ref ) => (
	<div ref={ ref } className={ cx( "px-2 py-1.5 text-sm text-slate-600", className ) } { ...props } />
) );
DropdownMenuText.displayName = "DropdownMenuText";

export {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuSeparator,
	DropdownMenuText,
	DropdownMenuTrigger,
};
