import { useEffect, useRef, useState } from "react";
import type { AutocompleteSuggestion, Coordinates } from "~/lib/types";
import { getPlaceAutocompleteFn } from "~/server/get-place-autocomplete";

type LocationInputProps = {
	onLocationSelected: (coords: Coordinates) => void;
	isDisabled?: boolean;
};

export function LocationInput({ onLocationSelected, isDisabled = false }: LocationInputProps) {
	const [geoLoading, setGeoLoading] = useState(false);
	const [geoError, setGeoError] = useState<string | null>(null);
	const [query, setQuery] = useState("");
	const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
	const [highlightedIndex, setHighlightedIndex] = useState(-1);
	const [showDropdown, setShowDropdown] = useState(false);

	const containerRef = useRef<HTMLDivElement>(null);
	const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setShowDropdown(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	function handleGeoClick() {
		setGeoError(null);
		setGeoLoading(true);

		navigator.geolocation.getCurrentPosition(
			(position) => {
				setGeoLoading(false);
				onLocationSelected({
					lat: position.coords.latitude,
					lng: position.coords.longitude,
				});
			},
			() => {
				setGeoLoading(false);
				setGeoError("no worries, just type your address");
			},
			{ enableHighAccuracy: false, timeout: 8000 },
		);
	}

	function handleQueryChange(value: string) {
		setQuery(value);
		setHighlightedIndex(-1);

		if (debounceTimer.current) {
			clearTimeout(debounceTimer.current);
		}

		if (!value.trim()) {
			setSuggestions([]);
			setShowDropdown(false);
			return;
		}

		debounceTimer.current = setTimeout(async () => {
			const result = await getPlaceAutocompleteFn({ data: { query: value } });
			if ("error" in result) {
				setSuggestions([]);
				setShowDropdown(false);
			} else {
				setSuggestions(result.suggestions.slice(0, 5));
				setShowDropdown(result.suggestions.length > 0);
			}
		}, 300);
	}

	function handleSuggestionClick(suggestion: AutocompleteSuggestion) {
		setQuery("");
		setSuggestions([]);
		setShowDropdown(false);
		onLocationSelected(suggestion.coordinates);
	}

	function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
		if (!showDropdown) return;

		if (event.key === "ArrowDown") {
			event.preventDefault();
			setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
		} else if (event.key === "ArrowUp") {
			event.preventDefault();
			setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
		} else if (event.key === "Enter") {
			event.preventDefault();
			if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
				const suggestion = suggestions[highlightedIndex];
				if (suggestion) {
					handleSuggestionClick(suggestion);
				}
			}
		} else if (event.key === "Escape") {
			setShowDropdown(false);
			setHighlightedIndex(-1);
		}
	}

	function handleClear() {
		setQuery("");
		setSuggestions([]);
		setShowDropdown(false);
		setHighlightedIndex(-1);
	}

	return (
		<div ref={containerRef} className={isDisabled ? "opacity-50 pointer-events-none" : ""}>
			<button
				type="button"
				onClick={handleGeoClick}
				disabled={geoLoading}
				className="bg-cream hover:bg-[#F5E6D3] border-2 border-dashed border-espresso/15 hover:border-burnt-orange/35 rounded-xl px-5 py-3.5 font-body text-[0.95rem] font-bold text-espresso-light hover:text-burnt-orange transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 w-full"
			>
				{geoLoading ? "finding you..." : "use my current location"}
			</button>

			{geoError && <p className="text-sm font-body text-mocha mt-2 italic">{geoError}</p>}

			<p className="text-center text-xs font-body text-mocha opacity-50 my-3">or</p>

			<div className="relative">
				<span className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-mocha opacity-40 pointer-events-none">
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-hidden="true"
					>
						<circle cx="11" cy="11" r="8" />
						<line x1="21" y1="21" x2="16.65" y2="16.65" />
					</svg>
				</span>

				<input
					type="text"
					value={query}
					placeholder="or type an address..."
					onChange={(e) => handleQueryChange(e.target.value)}
					onKeyDown={handleKeyDown}
					className="bg-cream focus:bg-cream-light border-2 border-espresso/[0.08] focus:border-burnt-orange/40 rounded-xl py-3.5 pl-11 pr-10 font-body text-[0.95rem] font-medium text-espresso placeholder:text-mocha placeholder:opacity-45 focus:shadow-[0_0_0_3px_rgba(200,89,10,0.08)] outline-none transition-all duration-200 w-full"
				/>

				{query && (
					<button
						type="button"
						onClick={handleClear}
						className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-mocha opacity-40 hover:opacity-70 transition-opacity"
					>
						&times;
					</button>
				)}

				{showDropdown && suggestions.length > 0 && (
					<div
						role="listbox"
						className="absolute z-10 mt-2 w-full bg-cream-light rounded-xl border border-espresso/[0.08] shadow-[0_4px_12px_rgba(44,24,16,0.08)] overflow-hidden"
					>
						{suggestions.map((suggestion, index) => (
							<div
								key={suggestion.placeId}
								role="option"
								tabIndex={0}
								aria-selected={index === highlightedIndex}
								onClick={() => handleSuggestionClick(suggestion)}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") handleSuggestionClick(suggestion);
								}}
								className={`px-4 py-3 cursor-pointer text-sm font-body text-espresso hover:bg-cream transition-colors duration-150${index === highlightedIndex ? " bg-cream" : ""}`}
							>
								{suggestion.description}
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
