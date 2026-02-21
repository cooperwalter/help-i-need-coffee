import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { CoffeeCup } from "../components/CoffeeCup";
import { LocationInput } from "../components/LocationInput";
import { ResultCard } from "../components/ResultCard";
import type { AppState, CoffeeShopResult, Coordinates } from "../lib/types";
import { searchNearbyShopsFn } from "../server/search-nearby-shops";

export const Route = createFileRoute("/")({
	component: Home,
});

const LOADING_MESSAGES = [
	"hang in there, pal",
	"brewing up results",
	"almost there",
	"searching the neighborhood",
	"finding your fix",
];

function DinerDivider() {
	return (
		<div className="flex items-center gap-3 my-7">
			<div className="flex-1 h-px bg-gradient-to-r from-transparent via-espresso/[0.12] to-transparent" />
			<div className="w-1.5 h-1.5 bg-burnt-orange rotate-45 opacity-50 rounded-[1px]" />
			<div className="flex-1 h-px bg-gradient-to-r from-transparent via-espresso/[0.12] to-transparent" />
		</div>
	);
}

function LoadingDots() {
	return (
		<span className="inline-flex gap-[3px] ml-1">
			<span
				className="inline-block w-1 h-1 rounded-full bg-mocha"
				style={{ animation: "dot-blink 1.4s infinite", animationDelay: "0s" }}
			/>
			<span
				className="inline-block w-1 h-1 rounded-full bg-mocha"
				style={{ animation: "dot-blink 1.4s infinite", animationDelay: "0.2s" }}
			/>
			<span
				className="inline-block w-1 h-1 rounded-full bg-mocha"
				style={{ animation: "dot-blink 1.4s infinite", animationDelay: "0.4s" }}
			/>
		</span>
	);
}

function FooterCupSvg() {
	return (
		<svg
			viewBox="0 0 80 72"
			className="w-20 h-[72px] opacity-30"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
		>
			<ellipse cx="34" cy="64" rx="28" ry="5" fill="#5C4033" opacity="0.35" />
			<ellipse cx="34" cy="62" rx="26" ry="4.5" fill="#3D2B1F" opacity="0.15" />

			<path d="M10 30 L14 58 Q34 64 54 58 L58 30 Z" fill="#5C4033" opacity="0.6" />
			<path d="M11 30 L15 57 Q34 62 53 57 L57 30 Z" fill="#8B6F5E" opacity="0.5" />
			<path
				d="M10 30 Q34 26 58 30"
				fill="none"
				stroke="#5C4033"
				strokeWidth="1"
				opacity="0.4"
			/>

			<ellipse cx="34" cy="30" rx="24" ry="7" fill="#D4860A" opacity="0.5" />
			<ellipse cx="34" cy="30" rx="22" ry="6" fill="#C8590A" opacity="0.3" />

			<path
				d="M34 26 C30 28 30 31 34 33 C38 31 38 28 34 26 Z"
				fill="#FFF6EC"
				opacity="0.6"
			/>
			<path d="M34 33 L34 36" stroke="#FFF6EC" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />

			<path
				d="M58 34 C64 34 68 38 68 43 C68 48 64 50 58 48"
				fill="none"
				stroke="#5C4033"
				strokeWidth="3"
				strokeLinecap="round"
				opacity="0.5"
			/>

			<path
				d="M30 22 C30 16 28 10 32 4"
				fill="none"
				stroke="#5C4033"
				strokeWidth="1.2"
				strokeLinecap="round"
				opacity="0.2"
			/>
			<path
				d="M37 21 C37 15 39 9 36 3"
				fill="none"
				stroke="#5C4033"
				strokeWidth="1.2"
				strokeLinecap="round"
				opacity="0.15"
			/>

			<g transform="translate(44,24) rotate(35)" opacity="0.4">
				<rect x="0" y="-12" width="2.5" height="14" rx="1" fill="#C8590A" />
			</g>
			<g transform="translate(47,23) rotate(25)" opacity="0.35">
				<rect x="0" y="-11" width="2" height="13" rx="1" fill="#A84A08" />
			</g>

			<g transform="translate(12,58) rotate(-10)" opacity="0.35">
				<path d="M0 0 L3 -2 L2.5 1 L5 3 L2 3 L0 6 L-2 3 L-5 3 L-2.5 1 L-3 -2 Z" fill="#C8590A" />
			</g>
		</svg>
	);
}

function NoiseOverlay() {
	return (
		<svg
			className="fixed inset-0 w-full h-full pointer-events-none z-50 opacity-[0.03]"
			aria-hidden="true"
		>
			<filter id="grain">
				<feTurbulence
					type="fractalNoise"
					baseFrequency="0.65"
					numOctaves="3"
					stitchTiles="stitch"
				/>
			</filter>
			<rect width="100%" height="100%" filter="url(#grain)" />
		</svg>
	);
}

export function Home() {
	const [appState, setAppState] = useState<AppState>("input");
	const [result, setResult] = useState<CoffeeShopResult | null>(null);
	const [userCoords, setUserCoords] = useState<Coordinates | null>(null);
	const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
	const [isEditingLocation, setIsEditingLocation] = useState(false);

	useEffect(() => {
		if (appState !== "loading") return;

		const interval = setInterval(() => {
			setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
		}, 2000);

		return () => clearInterval(interval);
	}, [appState]);

	const handleLocationSelected = useCallback(async (coords: Coordinates) => {
		setAppState("loading");
		setLoadingMessageIndex(0);
		setUserCoords(coords);

		const response = await searchNearbyShopsFn({ data: { lat: coords.lat, lng: coords.lng } });

		if ("error" in response) {
			if (response.code === "NO_RESULTS") {
				setAppState("error-no-results");
			} else {
				setAppState("error-api");
			}
		} else {
			setResult(response);
			setAppState("result");
		}
	}, []);

	const handleEditingChange = useCallback((editing: boolean) => {
		setIsEditingLocation(editing);
	}, []);

	const handleSearchAgain = useCallback(() => {
		setAppState("input");
		setResult(null);
		setUserCoords(null);
		setIsEditingLocation(false);
	}, []);

	return (
		<div className="min-h-screen bg-cream relative">
			<NoiseOverlay />

			<div className="fixed inset-0 pointer-events-none z-0">
				<div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(212,148,10,0.06)_0%,transparent_70%)]" />
				<div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(200,89,10,0.04)_0%,transparent_70%)]" />
			</div>

			<div className="relative z-10 max-w-[440px] mx-auto px-5 py-8 min-[520px]:px-8 min-[520px]:py-12 min-[768px]:py-16">
				<header
					className="text-center mb-10 pt-4"
					style={{ animation: "fade-up 0.6s ease-out both" }}
				>
					<div className="flex justify-center mb-4">
						<CoffeeCup isLoading={appState === "loading"} />
					</div>

					<p className="font-body text-[0.7rem] font-bold tracking-[0.18em] uppercase text-burnt-orange opacity-85 mb-2">
						caffeine emergency?
					</p>

					<h1 className="font-display text-[2.2rem] min-[520px]:text-[2.6rem] font-extrabold italic leading-[1.1] text-espresso mb-3">
						help, i need <span className="text-burnt-orange">coffee.</span>
					</h1>

					<p className="font-body text-[0.95rem] font-medium text-mocha leading-relaxed">
						find the nearest coffee shop, fast.
					</p>
				</header>

				<section className="relative z-20" style={{ animation: "fade-up 0.6s ease-out 0.1s both" }}>
					<div className="relative">
						<div
							className={`bg-cream-light rounded-2xl p-5 min-[520px]:p-7 border border-espresso/[0.06] shadow-[0_1px_3px_rgba(44,24,16,0.06),0_4px_12px_rgba(44,24,16,0.04)] transition-opacity duration-300 ${appState === "loading" ? "opacity-50 pointer-events-none" : ""}`}
						>
							<div className="absolute top-0 left-4 right-4 h-[3px] bg-gradient-to-r from-burnt-orange via-amber-warm to-burnt-orange opacity-50 rounded-b-full" />

							<p className="font-display text-[0.75rem] font-bold tracking-[0.12em] uppercase text-mocha opacity-70 mb-4">
								where are you?
							</p>

							<LocationInput
								onLocationSelected={handleLocationSelected}
								onEditingChange={handleEditingChange}
								isDisabled={appState === "loading"}
							/>
						</div>
					</div>
				</section>

				{appState === "loading" && (
					<div className="mt-6 text-center">
						<p className="font-body text-[0.85rem] font-semibold italic text-mocha opacity-60">
							{LOADING_MESSAGES[loadingMessageIndex]}
							<LoadingDots />
						</p>
					</div>
				)}

				{appState === "result" && result && (
					<>
						<DinerDivider />
						<section
							className={`transition-opacity duration-300 ${isEditingLocation ? "opacity-40" : ""}`}
							style={{ animation: "fade-up 0.6s ease-out 0.3s both" }}
						>
							<ResultCard result={result} origin={userCoords ?? undefined} onSearchAgain={handleSearchAgain} />
						</section>
					</>
				)}

				{appState === "error-no-results" && (
					<>
						<DinerDivider />
						<section
							className="text-center"
							style={{ animation: "fade-up 0.6s ease-out 0.3s both" }}
						>
							<div className="bg-cream-light rounded-2xl p-7 border border-espresso/[0.06] shadow-[0_1px_3px_rgba(44,24,16,0.06),0_4px_12px_rgba(44,24,16,0.04)]">
								<p className="font-display text-lg italic text-espresso mb-2">
									no coffee nearby? that's a crisis.
								</p>
								<button
									type="button"
									onClick={handleSearchAgain}
									className="font-body text-[0.85rem] font-semibold text-burnt-orange hover:text-[#A84A08] underline bg-transparent border-none cursor-pointer"
								>
									try again
								</button>
							</div>
						</section>
					</>
				)}

				{appState === "error-api" && (
					<>
						<DinerDivider />
						<section
							className="text-center"
							style={{ animation: "fade-up 0.6s ease-out 0.3s both" }}
						>
							<div className="bg-cream-light rounded-2xl p-7 border border-espresso/[0.06] shadow-[0_1px_3px_rgba(44,24,16,0.06),0_4px_12px_rgba(44,24,16,0.04)]">
								<p className="font-display text-lg italic text-espresso mb-2">
									something went wrong. give it another shot.
								</p>
								<button
									type="button"
									onClick={handleSearchAgain}
									className="font-body text-[0.85rem] font-semibold text-burnt-orange hover:text-[#A84A08] underline bg-transparent border-none cursor-pointer"
								>
									try again
								</button>
							</div>
						</section>
					</>
				)}

				<footer className="mt-10 pt-6 text-center flex flex-col items-center gap-2">
					<FooterCupSvg />
					<p className="font-body text-[0.75rem] font-semibold text-mocha opacity-30 tracking-[0.04em]">
						made with warmth and mild desperation
					</p>
				</footer>
			</div>
		</div>
	);
}
