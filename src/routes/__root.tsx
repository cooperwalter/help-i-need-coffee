/// <reference types="vite/client" />

import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import type { ReactNode } from "react";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
	notFoundComponent: () => (
		<div className="min-h-screen bg-cream flex items-center justify-center px-6">
			<div className="text-center max-w-[440px]">
				<p className="font-display italic text-4xl text-espresso mb-3">404</p>
				<p className="font-body text-lg text-mocha mb-6">
					wrong turn — there's no coffee down this road.
				</p>
				<a
					href="/"
					className="inline-block font-body font-bold text-sm tracking-wide uppercase bg-burnt-orange text-cream px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
				>
					back to safety
				</a>
			</div>
		</div>
	),
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{ title: "help, i need coffee" },
		],
		links: [
			{ rel: "stylesheet", href: appCss },
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com",
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous",
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Nunito:wght@400;600;700;800&display=swap",
			},
		],
	}),
	component: RootComponent,
});

function RootComponent() {
	return (
		<RootDocument>
			<Outlet />
		</RootDocument>
	);
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body suppressHydrationWarning>
				{children}
				<Scripts />
			</body>
		</html>
	);
}
