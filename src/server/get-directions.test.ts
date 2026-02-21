import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { getDirections } from "../server/get-directions";

function makeMockFetch(body: unknown, status = 200): typeof globalThis.fetch {
	return (() =>
		Promise.resolve(
			new Response(JSON.stringify(body), {
				status,
				headers: { "Content-Type": "application/json" },
			}),
		)) as unknown as typeof globalThis.fetch;
}

describe("getDirections", () => {
	beforeEach(() => {
		process.env.GOOGLE_PLACES_API_KEY = "test-key-12345";
	});

	afterEach(() => {
		globalThis.fetch = undefined as unknown as typeof fetch;
	});

	it("should return driving time in minutes and distance in meters between two coordinates", async () => {
		globalThis.fetch = makeMockFetch({
			status: "OK",
			routes: [
				{
					legs: [
						{
							duration: { value: 900 },
							distance: { value: 12500 },
						},
					],
				},
			],
		}) as unknown as typeof globalThis.fetch;

		const result = await getDirections({
			origin: { lat: 37.7749, lng: -122.4194 },
			destination: { lat: 37.7849, lng: -122.4094 },
		});

		expect(result).toEqual({ driveTimeMinutes: 15, distanceMeters: 12500 });
	});

	it("should handle Google Directions API errors with a typed error response", async () => {
		globalThis.fetch = makeMockFetch({
			status: "REQUEST_DENIED",
			routes: [],
		}) as unknown as typeof globalThis.fetch;

		const result = await getDirections({
			origin: { lat: 37.7749, lng: -122.4194 },
			destination: { lat: 37.7849, lng: -122.4094 },
		});

		expect(result).toEqual({
			error: true,
			message: "Google API error: REQUEST_DENIED",
			code: "API_ERROR",
		});
	});

	it("should return NO_ROUTE error when no driving route exists between coordinates", async () => {
		globalThis.fetch = makeMockFetch({
			status: "ZERO_RESULTS",
			routes: [],
			geocoded_waypoints: [],
		}) as unknown as typeof globalThis.fetch;

		const result = await getDirections({
			origin: { lat: 37.7749, lng: -122.4194 },
			destination: { lat: 37.7849, lng: -122.4094 },
		});

		expect(result).toEqual({
			error: true,
			message: "No driving route found",
			code: "NO_ROUTE",
		});
	});
});
