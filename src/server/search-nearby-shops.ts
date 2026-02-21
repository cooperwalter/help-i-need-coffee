import { fetchWithRetry, getApiKey, sanitizeResponse } from "~/lib/google-api";
import type { CoffeeShopResult, SearchErrorResponse } from "~/lib/types";

interface NearbySearchResult {
	name: string;
	place_id: string;
	geometry: {
		location: {
			lat: number;
			lng: number;
		};
	};
	opening_hours?: {
		open_now?: boolean;
		periods?: Array<{
			open: { day: number; time: string };
			close?: { day: number; time: string };
		}>;
	};
}

interface NearbySearchResponse {
	status: string;
	results: NearbySearchResult[];
}

interface DirectionsResponse {
	status: string;
	routes: Array<{
		legs: Array<{
			duration: {
				value: number;
			};
		}>;
	}>;
}

function formatTime(time: string): string {
	const hours = parseInt(time.slice(0, 2), 10);
	const minutes = time.slice(2);
	const period = hours >= 12 ? "PM" : "AM";
	const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
	return `${displayHour}:${minutes} ${period}`;
}

function getTodayHours(
	periods: Array<{ open: { day: number; time: string }; close?: { day: number; time: string } }>,
): { open: string; close: string } | null {
	const today = new Date().getDay();
	const todayPeriod = periods.find((p) => p.open.day === today);
	if (!todayPeriod || !todayPeriod.close) {
		return null;
	}
	return {
		open: formatTime(todayPeriod.open.time),
		close: formatTime(todayPeriod.close.time),
	};
}

async function fetchNearbyShops(
	lat: number,
	lng: number,
	radius: number,
	apiKey: string,
	timeoutMs?: number,
): Promise<NearbySearchResponse> {
	const response = await fetchWithRetry({
		url: "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
		params: {
			location: `${lat},${lng}`,
			radius: String(radius),
			type: "cafe",
			keyword: "coffee",
			key: apiKey,
		},
		timeoutMs,
	});
	return (await response.json()) as NearbySearchResponse;
}

async function fetchDriveTime(
	originLat: number,
	originLng: number,
	destLat: number,
	destLng: number,
	apiKey: string,
	timeoutMs?: number,
): Promise<DirectionsResponse> {
	const response = await fetchWithRetry({
		url: "https://maps.googleapis.com/maps/api/directions/json",
		params: {
			origin: `${originLat},${originLng}`,
			destination: `${destLat},${destLng}`,
			mode: "driving",
			key: apiKey,
		},
		timeoutMs,
	});
	return (await response.json()) as DirectionsResponse;
}

export async function searchNearbyShops(
	input: { lat: number; lng: number },
	options?: { timeoutMs?: number },
): Promise<CoffeeShopResult | SearchErrorResponse> {
	try {
		const apiKey = getApiKey();
		const { lat, lng } = input;
		const radii = [5000, 10000, 20000];
		let results: NearbySearchResult[] = [];

		for (const radius of radii) {
			const data = await fetchNearbyShops(lat, lng, radius, apiKey, options?.timeoutMs);

			if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
				return sanitizeResponse({
					error: true as const,
					message: `Google API error: ${data.status}`,
					code: "API_ERROR" as const,
				});
			}

			if (data.results.length > 0) {
				results = data.results;
				break;
			}
		}

		if (results.length === 0) {
			return sanitizeResponse({
				error: true as const,
				message: "No coffee shops found nearby",
				code: "NO_RESULTS" as const,
			});
		}

		const topResults = results.slice(0, 5);

		let bestShop: NearbySearchResult | null = null;
		let bestDriveTime = Infinity;

		for (const shop of topResults) {
			const shopLat = shop.geometry.location.lat;
			const shopLng = shop.geometry.location.lng;
			const directionsData = await fetchDriveTime(
				lat,
				lng,
				shopLat,
				shopLng,
				apiKey,
				options?.timeoutMs,
			);

			if (directionsData.status !== "OK") {
				return sanitizeResponse({
					error: true as const,
					message: `Google API error: ${directionsData.status}`,
					code: "API_ERROR" as const,
				});
			}

			const durationSeconds = directionsData.routes[0]?.legs[0]?.duration.value;
			if (durationSeconds === undefined) {
				continue;
			}

			const driveMinutes = Math.round(durationSeconds / 60);
			if (driveMinutes < bestDriveTime) {
				bestDriveTime = driveMinutes;
				bestShop = shop;
			}
		}

		if (!bestShop) {
			return sanitizeResponse({
				error: true as const,
				message: "No coffee shops found nearby",
				code: "NO_RESULTS" as const,
			});
		}

		const todayHours = bestShop.opening_hours?.periods
			? getTodayHours(bestShop.opening_hours.periods)
			: null;

		const result: CoffeeShopResult = {
			name: bestShop.name,
			driveTimeMinutes: bestDriveTime,
			isOpen: bestShop.opening_hours?.open_now ?? false,
			todayHours,
			coordinates: {
				lat: bestShop.geometry.location.lat,
				lng: bestShop.geometry.location.lng,
			},
			placeId: bestShop.place_id,
		};

		return sanitizeResponse(
			result as CoffeeShopResult & Record<string, unknown>,
		) as CoffeeShopResult;
	} catch (error) {
		if (error instanceof Error && error.message === "Request timed out") {
			return sanitizeResponse({
				error: true as const,
				message: "Request timed out",
				code: "TIMEOUT" as const,
			});
		}
		if (error instanceof DOMException && error.name === "AbortError") {
			return sanitizeResponse({
				error: true as const,
				message: "Request timed out",
				code: "TIMEOUT" as const,
			});
		}
		throw error;
	}
}
