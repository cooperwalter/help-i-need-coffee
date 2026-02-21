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

function CoffeeRingSvg() {
	return (
		<svg
			viewBox="0 0 48 48"
			className="w-12 h-12 opacity-[0.06]"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
		>
			<circle cx="24" cy="24" r="20" fill="none" stroke="#3D2B1F" strokeWidth="4" opacity="0.5" />
			<circle cx="24" cy="24" r="16" fill="none" stroke="#3D2B1F" strokeWidth="1" opacity="0.3" />
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
					<CoffeeRingSvg />
					<p className="font-body text-[0.75rem] font-semibold text-mocha opacity-30 tracking-[0.04em]">
						made with warmth and mild desperation
					</p>
				</footer>
			</div>
		</div>
	);
}
