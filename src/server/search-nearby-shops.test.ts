import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { searchNearbyShops } from "../server/search-nearby-shops";

const originalFetch = globalThis.fetch;
const originalEnv = process.env.GOOGLE_PLACES_API_KEY;

function makeNearbyResponse(results: unknown[], status = "OK") {
	return { status, results };
}

function makeShop(overrides: {
	name: string;
	place_id: string;
	lat: number;
	lng: number;
	open_now?: boolean;
	periods?: Array<{ open: { day: number; time: string }; close?: { day: number; time: string } }>;
}) {
	return {
		name: overrides.name,
		place_id: overrides.place_id,
		geometry: {
			location: {
				lat: overrides.lat,
				lng: overrides.lng,
			},
		},
		...(overrides.open_now !== undefined || overrides.periods
			? {
					opening_hours: {
						...(overrides.open_now !== undefined ? { open_now: overrides.open_now } : {}),
						...(overrides.periods ? { periods: overrides.periods } : {}),
					},
				}
			: {}),
	};
}

function makeDirectionsResponse(durationSeconds: number, status = "OK") {
	return {
		status,
		routes: [
			{
				legs: [
					{
						duration: { value: durationSeconds },
					},
				],
			},
		],
	};
}

function jsonResponse(data: unknown, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: { "Content-Type": "application/json" },
	});
}

beforeEach(() => {
	process.env.GOOGLE_PLACES_API_KEY = "test-key-12345";
});

afterEach(() => {
	globalThis.fetch = originalFetch;
	process.env.GOOGLE_PLACES_API_KEY = originalEnv;
});

describe("searchNearbyShops", () => {
	it("should return the nearest coffee shop by driving time when multiple shops are found", async () => {
		const shops = [
			makeShop({ name: "Far Cafe", place_id: "p1", lat: 40.71, lng: -74.01 }),
			makeShop({ name: "Close Cafe", place_id: "p2", lat: 40.705, lng: -74.005 }),
			makeShop({ name: "Mid Cafe", place_id: "p3", lat: 40.708, lng: -74.008 }),
		];

		globalThis.fetch = mock((url: string) => {
			if (url.includes("nearbysearch")) {
				return Promise.resolve(jsonResponse(makeNearbyResponse(shops)));
			}
			if (url.includes("directions")) {
				if (url.includes("40.71")) {
					return Promise.resolve(jsonResponse(makeDirectionsResponse(600)));
				}
				if (url.includes("40.705")) {
					return Promise.resolve(jsonResponse(makeDirectionsResponse(180)));
				}
				if (url.includes("40.708")) {
					return Promise.resolve(jsonResponse(makeDirectionsResponse(420)));
				}
			}
			return Promise.resolve(jsonResponse({}));
		}) as unknown as typeof globalThis.fetch;

		const result = await searchNearbyShops({ lat: 40.7, lng: -74.0 });

		expect(result).toEqual({
			name: "Close Cafe",
			driveTimeMinutes: 3,
			isOpen: false,
			todayHours: null,
			coordinates: { lat: 40.705, lng: -74.005 },
			placeId: "p2",
		});
	});

	it("should expand search radius from 5km to 10km when no shops found at 5km", async () => {
		const shop = makeShop({ name: "Distant Cafe", place_id: "p1", lat: 40.75, lng: -74.05 });
		let callCount = 0;

		globalThis.fetch = mock((url: string) => {
			if (url.includes("nearbysearch")) {
				callCount++;
				if (url.includes("radius=5000")) {
					return Promise.resolve(jsonResponse(makeNearbyResponse([], "ZERO_RESULTS")));
				}
				if (url.includes("radius=10000")) {
					return Promise.resolve(jsonResponse(makeNearbyResponse([shop])));
				}
			}
			if (url.includes("directions")) {
				return Promise.resolve(jsonResponse(makeDirectionsResponse(300)));
			}
			return Promise.resolve(jsonResponse({}));
		}) as unknown as typeof globalThis.fetch;

		const result = await searchNearbyShops({ lat: 40.7, lng: -74.0 });

		expect(callCount).toBe(2);
		expect(result).toEqual({
			name: "Distant Cafe",
			driveTimeMinutes: 5,
			isOpen: false,
			todayHours: null,
			coordinates: { lat: 40.75, lng: -74.05 },
			placeId: "p1",
		});
	});

	it("should expand search radius from 10km to 20km when no shops found at 10km", async () => {
		const shop = makeShop({ name: "Very Far Cafe", place_id: "p1", lat: 40.8, lng: -74.1 });
		let callCount = 0;

		globalThis.fetch = mock((url: string) => {
			if (url.includes("nearbysearch")) {
				callCount++;
				if (url.includes("radius=5000") || url.includes("radius=10000")) {
					return Promise.resolve(jsonResponse(makeNearbyResponse([], "ZERO_RESULTS")));
				}
				if (url.includes("radius=20000")) {
					return Promise.resolve(jsonResponse(makeNearbyResponse([shop])));
				}
			}
			if (url.includes("directions")) {
				return Promise.resolve(jsonResponse(makeDirectionsResponse(900)));
			}
			return Promise.resolve(jsonResponse({}));
		}) as unknown as typeof globalThis.fetch;

		const result = await searchNearbyShops({ lat: 40.7, lng: -74.0 });

		expect(callCount).toBe(3);
		expect(result).toEqual({
			name: "Very Far Cafe",
			driveTimeMinutes: 15,
			isOpen: false,
			todayHours: null,
			coordinates: { lat: 40.8, lng: -74.1 },
			placeId: "p1",
		});
	});

	it("should return NO_RESULTS error when no shops found at any radius", async () => {
		globalThis.fetch = mock((url: string) => {
			if (url.includes("nearbysearch")) {
				return Promise.resolve(jsonResponse(makeNearbyResponse([], "ZERO_RESULTS")));
			}
			return Promise.resolve(jsonResponse({}));
		}) as unknown as typeof globalThis.fetch;

		const result = await searchNearbyShops({ lat: 40.7, lng: -74.0 });

		expect(result).toEqual({
			error: true,
			message: "No coffee shops found nearby",
			code: "NO_RESULTS",
		});
	});

	it("should include open/closed status and today's hours in the response", async () => {
		const today = new Date().getDay();
		const shop = makeShop({
			name: "Open Cafe",
			place_id: "p1",
			lat: 40.71,
			lng: -74.01,
			open_now: true,
			periods: [
				{
					open: { day: today, time: "0700" },
					close: { day: today, time: "2100" },
				},
			],
		});

		globalThis.fetch = mock((url: string) => {
			if (url.includes("nearbysearch")) {
				return Promise.resolve(jsonResponse(makeNearbyResponse([shop])));
			}
			if (url.includes("directions")) {
				return Promise.resolve(jsonResponse(makeDirectionsResponse(300)));
			}
			return Promise.resolve(jsonResponse({}));
		}) as unknown as typeof globalThis.fetch;

		const result = await searchNearbyShops({ lat: 40.7, lng: -74.0 });

		expect(result).toEqual({
			name: "Open Cafe",
			driveTimeMinutes: 5,
			isOpen: true,
			todayHours: { open: "7:00 AM", close: "9:00 PM" },
			coordinates: { lat: 40.71, lng: -74.01 },
			placeId: "p1",
		});
	});

	it("should handle Google Nearby Search API errors with a typed error response", async () => {
		globalThis.fetch = mock((url: string) => {
			if (url.includes("nearbysearch")) {
				return Promise.resolve(jsonResponse({ status: "REQUEST_DENIED", results: [] }));
			}
			return Promise.resolve(jsonResponse({}));
		}) as unknown as typeof globalThis.fetch;

		const result = await searchNearbyShops({ lat: 40.7, lng: -74.0 });

		expect(result).toEqual({
			error: true,
			message: "Google API error: REQUEST_DENIED",
			code: "API_ERROR",
		});
	});

	it("should handle Google Directions API errors with a typed error response", async () => {
		const shop = makeShop({ name: "Test Cafe", place_id: "p1", lat: 40.71, lng: -74.01 });

		globalThis.fetch = mock((url: string) => {
			if (url.includes("nearbysearch")) {
				return Promise.resolve(jsonResponse(makeNearbyResponse([shop])));
			}
			if (url.includes("directions")) {
				return Promise.resolve(jsonResponse({ status: "REQUEST_DENIED", routes: [] }));
			}
			return Promise.resolve(jsonResponse({}));
		}) as unknown as typeof globalThis.fetch;

		const result = await searchNearbyShops({ lat: 40.7, lng: -74.0 });

		expect(result).toEqual({
			error: true,
			message: "Google API error: REQUEST_DENIED",
			code: "API_ERROR",
		});
	});

	it("should retry once on 429/500/503 errors from Google API", async () => {
		const shop = makeShop({ name: "Retry Cafe", place_id: "p1", lat: 40.71, lng: -74.01 });
		let fetchCallCount = 0;

		globalThis.fetch = mock((url: string) => {
			fetchCallCount++;
			if (fetchCallCount === 1) {
				return Promise.resolve(new Response("Rate limited", { status: 429 }));
			}
			if (url.includes("nearbysearch")) {
				return Promise.resolve(jsonResponse(makeNearbyResponse([shop])));
			}
			if (url.includes("directions")) {
				return Promise.resolve(jsonResponse(makeDirectionsResponse(240)));
			}
			return Promise.resolve(jsonResponse({}));
		}) as unknown as typeof globalThis.fetch;

		const result = await searchNearbyShops({ lat: 40.7, lng: -74.0 });

		expect(fetchCallCount).toBeGreaterThanOrEqual(2);
		expect(result).toEqual({
			name: "Retry Cafe",
			driveTimeMinutes: 4,
			isOpen: false,
			todayHours: null,
			coordinates: { lat: 40.71, lng: -74.01 },
			placeId: "p1",
		});
	});

	it("should timeout after 10 seconds per Google API call", async () => {
		globalThis.fetch = mock(
			(_url: string, init: { signal: AbortSignal }) =>
				new Promise((_resolve, reject) => {
					init.signal.addEventListener("abort", () => {
						reject(new DOMException("The operation was aborted.", "AbortError"));
					});
				}),
		) as unknown as typeof globalThis.fetch;

		const result = await searchNearbyShops({ lat: 40.7, lng: -74.0 }, { timeoutMs: 50 });

		expect(result).toEqual({
			error: true,
			message: "Request timed out",
			code: "TIMEOUT",
		});
	});

	it("should never include the Google API key in the response", async () => {
		const shop = {
			name: "test-key-12345 Cafe",
			place_id: "test-key-12345",
			geometry: {
				location: { lat: 40.71, lng: -74.01 },
			},
		};

		globalThis.fetch = mock((url: string) => {
			if (url.includes("nearbysearch")) {
				return Promise.resolve(jsonResponse(makeNearbyResponse([shop])));
			}
			if (url.includes("directions")) {
				return Promise.resolve(jsonResponse(makeDirectionsResponse(300)));
			}
			return Promise.resolve(jsonResponse({}));
		}) as unknown as typeof globalThis.fetch;

		const result = await searchNearbyShops({ lat: 40.7, lng: -74.0 });
		const resultJson = JSON.stringify(result);

		expect(resultJson).not.toContain("test-key-12345");
		expect(resultJson).toContain("[REDACTED]");
	});
});
