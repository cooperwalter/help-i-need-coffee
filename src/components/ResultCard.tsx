import { useState } from "react";
import { formatDriveTime, formatOpenStatus } from "../lib/format";
import {
	buildAppleMapsUrl,
	buildGoogleMapsWebUrl,
	buildMapsUrl,
	buildWazeUrl,
} from "../lib/maps-url";
import { detectPlatform } from "../lib/platform";
import type { CoffeeShopResult } from "../lib/types";

type ResultCardProps = {
	result: CoffeeShopResult;
	onSearchAgain: () => void;
};

const RESULT_LABELS = ["nearest spot", "found one close by"] as const;

export function ResultCard({ result, onSearchAgain }: ResultCardProps) {
	const [showAlternativeApps, setShowAlternativeApps] = useState(false);

	const platform =
		typeof navigator !== "undefined" ? detectPlatform(navigator.userAgent) : "desktop";

	const primaryMapsUrl = buildMapsUrl(platform, result.coordinates);
	const appleMapsUrl = buildAppleMapsUrl(result.coordinates);
	const googleMapsUrl = buildGoogleMapsWebUrl(result.coordinates);
	const wazeUrl = buildWazeUrl(result.coordinates);

	const resultLabel = RESULT_LABELS[0];

	return (
		<div className="bg-cream-light rounded-[20px] p-7 relative overflow-hidden border border-espresso/[0.05] shadow-[0_2px_4px_rgba(44,24,16,0.06),0_8px_24px_rgba(44,24,16,0.08),0_1px_2px_rgba(44,24,16,0.04)] animate-[fade-up_0.6s_ease-out_0.3s_both]">
			<div className="flex flex-col gap-4">
				<div className="flex flex-col gap-1">
					<span className="font-body text-[0.7rem] font-bold tracking-[0.15em] uppercase text-burnt-orange opacity-80">
						{resultLabel}
					</span>
					<span className="font-display text-[0.9rem] italic text-mocha opacity-70">
						just a short drive away
					</span>
				</div>

				<h2 className="font-display text-[1.65rem] font-extrabold text-espresso leading-[1.15]">
					{result.name}
				</h2>

				<div className="flex flex-row gap-2 flex-wrap">
					<span className="bg-espresso/[0.06] text-espresso-light px-3 py-1.5 rounded-full text-[0.78rem] font-bold">
						{formatDriveTime(result.driveTimeMinutes)}
					</span>
					<span
						className={`px-3 py-1.5 rounded-full text-[0.78rem] font-bold flex items-center gap-1.5 ${
							result.isOpen
								? "bg-status-green/10 text-status-green"
								: "bg-status-red/10 text-status-red"
						}`}
					>
						<span
							className={`w-1.5 h-1.5 rounded-full shrink-0 ${
								result.isOpen ? "bg-status-green animate-pulse" : "bg-status-red"
							}`}
						/>
						{formatOpenStatus(result.isOpen, result.todayHours)}
					</span>
				</div>

				<a
					href={primaryMapsUrl}
					target="_blank"
					rel="noopener noreferrer"
					className="bg-burnt-orange hover:bg-[#A84A08] text-cream-light font-display text-[1.05rem] font-extrabold tracking-[0.05em] uppercase rounded-[14px] px-6 py-4.5 w-full text-center shadow-[0_4px_12px_rgba(200,89,10,0.3),0_1px_3px_rgba(200,89,10,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.01] active:translate-y-0 active:scale-[0.99] block"
				>
					take me there →
				</a>

				<div className="flex flex-col items-center gap-2">
					<button
						type="button"
						onClick={() => setShowAlternativeApps((prev) => !prev)}
						className="text-[0.78rem] font-body text-mocha opacity-60 hover:opacity-80 cursor-pointer underline bg-transparent border-none p-0"
					>
						use a different app
					</button>

					{showAlternativeApps && (
						<div className="flex flex-row gap-4">
							<a
								href={appleMapsUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="text-[0.8rem] font-body font-semibold text-burnt-orange hover:text-[#A84A08]"
							>
								apple maps
							</a>
							<a
								href={googleMapsUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="text-[0.8rem] font-body font-semibold text-burnt-orange hover:text-[#A84A08]"
							>
								google maps
							</a>
							<a
								href={wazeUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="text-[0.8rem] font-body font-semibold text-burnt-orange hover:text-[#A84A08]"
							>
								waze
							</a>
						</div>
					)}
				</div>

				<button
					type="button"
					onClick={onSearchAgain}
					className="text-[0.8rem] font-body text-mocha opacity-50 hover:opacity-70 underline cursor-pointer bg-transparent border-none p-0 self-center"
				>
					search again
				</button>
			</div>

			<div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-burnt-orange via-amber-warm to-burnt-orange opacity-60" />
		</div>
	);
}
