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
		<div className="bg-[#FFFBF5] rounded-[20px] p-7 relative overflow-hidden border border-[rgba(44,24,16,0.05)] shadow-[0_2px_4px_rgba(44,24,16,0.06),0_8px_24px_rgba(44,24,16,0.08),0_1px_2px_rgba(44,24,16,0.04)] animate-[fade-up_0.6s_ease-out_0.3s_both]">
			<div className="flex flex-col gap-4">
				<div className="flex flex-col gap-1">
					<span className="font-['Nunito'] text-[0.7rem] font-bold tracking-[0.15em] uppercase text-[#C8590A] opacity-80">
						{resultLabel}
					</span>
					<span className="font-['Fraunces'] text-[0.9rem] italic text-[#5C4033] opacity-70">
						just a short drive away
					</span>
				</div>

				<h2 className="font-['Fraunces'] text-[1.65rem] font-extrabold text-[#2C1810] leading-[1.15]">
					{result.name}
				</h2>

				<div className="flex flex-row gap-2 flex-wrap">
					<span className="bg-[rgba(44,24,16,0.06)] text-[#3D2B1F] px-3 py-1.5 rounded-full text-[0.78rem] font-bold">
						{formatDriveTime(result.driveTimeMinutes)}
					</span>
					<span
						className={`px-3 py-1.5 rounded-full text-[0.78rem] font-bold flex items-center gap-1.5 ${
							result.isOpen
								? "bg-[rgba(74,122,61,0.1)] text-[#4A7A3D]"
								: "bg-[rgba(160,65,58,0.1)] text-[#A0413A]"
						}`}
					>
						<span
							className={`w-1.5 h-1.5 rounded-full shrink-0 ${
								result.isOpen ? "bg-[#4A7A3D] animate-pulse" : "bg-[#A0413A]"
							}`}
						/>
						{formatOpenStatus(result.isOpen, result.todayHours)}
					</span>
				</div>

				<a
					href={primaryMapsUrl}
					target="_blank"
					rel="noopener noreferrer"
					className="bg-[#C8590A] hover:bg-[#A84A08] text-[#FFFBF5] font-['Fraunces'] text-[1.05rem] font-extrabold tracking-[0.05em] uppercase rounded-[14px] px-6 py-4.5 w-full text-center shadow-[0_4px_12px_rgba(200,89,10,0.3),0_1px_3px_rgba(200,89,10,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.01] active:translate-y-0 active:scale-[0.99] block"
				>
					take me there →
				</a>

				<div className="flex flex-col items-center gap-2">
					<button
						type="button"
						onClick={() => setShowAlternativeApps((prev) => !prev)}
						className="text-[0.78rem] font-['Nunito'] text-[#5C4033] opacity-60 hover:opacity-80 cursor-pointer underline bg-transparent border-none p-0"
					>
						use a different app
					</button>

					{showAlternativeApps && (
						<div className="flex flex-row gap-4">
							<a
								href={appleMapsUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="text-[0.8rem] font-['Nunito'] font-semibold text-[#C8590A] hover:text-[#A84A08]"
							>
								apple maps
							</a>
							<a
								href={googleMapsUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="text-[0.8rem] font-['Nunito'] font-semibold text-[#C8590A] hover:text-[#A84A08]"
							>
								google maps
							</a>
							<a
								href={wazeUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="text-[0.8rem] font-['Nunito'] font-semibold text-[#C8590A] hover:text-[#A84A08]"
							>
								waze
							</a>
						</div>
					)}
				</div>

				<button
					type="button"
					onClick={onSearchAgain}
					className="text-[0.8rem] font-['Nunito'] text-[#5C4033] opacity-50 hover:opacity-70 underline cursor-pointer bg-transparent border-none p-0 self-center"
				>
					search again
				</button>
			</div>

			<div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C8590A] via-[#D4860A] to-[#C8590A] opacity-60" />
		</div>
	);
}
