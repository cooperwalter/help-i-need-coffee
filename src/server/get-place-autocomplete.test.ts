import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { getPlaceAutocomplete } from "../server/get-place-autocomplete";

describe("getPlaceAutocomplete", () => {
	beforeEach(() => {
		process.env.GOOGLE_PLACES_API_KEY = "test-key-12345";
	});

	afterEach(() => {
		globalThis.fetch = undefined as unknown as typeof fetch;
	});

	it("should return up to 5 formatted address suggestions with coordinates", async () => {
		const predictions = [
			{ description: "123 Main St, Springfield, IL", place_id: "place1" },
			{ description: "456 Oak Ave, Chicago, IL", place_id: "place2" },
			{ description: "789 Pine Rd, Rockford, IL", place_id: "place3" },
			{ description: "321 Elm St, Peoria, IL", place_id: "place4" },
			{ description: "654 Maple Dr, Aurora, IL", place_id: "place5" },
		];

		const detailsResponses = [
			{ status: "OK", result: { geometry: { location: { lat: 39.7817, lng: -89.6501 } } } },
			{ status: "OK", result: { geometry: { location: { lat: 41.8781, lng: -87.6298 } } } },
			{ status: "OK", result: { geometry: { location: { lat: 42.2711, lng: -89.094 } } } },
			{ status: "OK", result: { geometry: { location: { lat: 40.6936, lng: -89.589 } } } },
			{ status: "OK", result: { geometry: { location: { lat: 41.7606, lng: -88.3201 } } } },
		];

		let callIndex = 0;
		const allResponses = [{ status: "OK", predictions }, ...detailsResponses];

		globalThis.fetch = mock(() => {
			const response = allResponses[callIndex++];
			return Promise.resolve({
				json: () => Promise.resolve(response),
			} as Response);
		}) as unknown as typeof globalThis.fetch;

		const result = await getPlaceAutocomplete({ query: "123 Main" });

		expect(result).toEqual({
			suggestions: [
				{
					description: "123 Main St, Springfield, IL",
					placeId: "place1",
					coordinates: { lat: 39.7817, lng: -89.6501 },
				},
				{
					description: "456 Oak Ave, Chicago, IL",
					placeId: "place2",
					coordinates: { lat: 41.8781, lng: -87.6298 },
				},
				{
					description: "789 Pine Rd, Rockford, IL",
					placeId: "place3",
					coordinates: { lat: 42.2711, lng: -89.094 },
				},
				{
					description: "321 Elm St, Peoria, IL",
					placeId: "place4",
					coordinates: { lat: 40.6936, lng: -89.589 },
				},
				{
					description: "654 Maple Dr, Aurora, IL",
					placeId: "place5",
					coordinates: { lat: 41.7606, lng: -88.3201 },
				},
			],
		});
	});

	it("should return empty suggestions array for queries with no matches", async () => {
		globalThis.fetch = mock(() =>
			Promise.resolve({
				json: () => Promise.resolve({ status: "ZERO_RESULTS", predictions: [] }),
			} as Response),
		) as unknown as typeof globalThis.fetch;

		const result = await getPlaceAutocomplete({ query: "xyzzy no place exists" });

		expect(result).toEqual({ suggestions: [] });
	});

	it("should handle Google Autocomplete API errors with a typed error response", async () => {
		globalThis.fetch = mock(() =>
			Promise.resolve({
				json: () => Promise.resolve({ status: "REQUEST_DENIED", predictions: [] }),
			} as Response),
		) as unknown as typeof globalThis.fetch;

		const result = await getPlaceAutocomplete({ query: "123 Main St" });

		expect(result).toEqual({
			error: true,
			message: "Google API error: REQUEST_DENIED",
			code: "API_ERROR",
		});
	});

	it("should return INVALID_INPUT error when query string is empty", async () => {
		const fetchMock = mock(() => Promise.resolve({} as Response));
		globalThis.fetch = fetchMock as unknown as typeof globalThis.fetch;

		const result = await getPlaceAutocomplete({ query: "" });

		expect(result).toEqual({
			error: true,
			message: "Search query cannot be empty",
			code: "INVALID_INPUT",
		});
		expect(fetchMock).not.toHaveBeenCalled();
	});
});
