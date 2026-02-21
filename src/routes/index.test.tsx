import { afterEach, describe, expect, it, mock } from "bun:test";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { CoffeeShopResult, SearchErrorResponse } from "~/lib/types";

const mockSearchFn = mock(
	(): Promise<CoffeeShopResult | SearchErrorResponse> =>
		Promise.resolve({
			name: "Test Cafe",
			driveTimeMinutes: 5,
			isOpen: true,
			todayHours: { open: "7:00 AM", close: "9:00 PM" },
			coordinates: { lat: 40.71, lng: -74.01 },
			placeId: "test-id",
		}),
);

const mockAutocompleteFn = mock(() =>
	Promise.resolve({
		suggestions: [] as Array<{
			description: string;
			placeId: string;
			coordinates: { lat: number; lng: number };
		}>,
	}),
);

mock.module("~/server/search-nearby-shops", () => ({
	searchNearbyShopsFn: mockSearchFn,
}));

mock.module("~/server/get-place-autocomplete", () => ({
	getPlaceAutocompleteFn: mockAutocompleteFn,
}));

import { Home } from "./index";

function setupGeolocation(lat = 40.7, lng = -74.0) {
	Object.defineProperty(globalThis.navigator, "geolocation", {
		value: {
			getCurrentPosition: mock((success: PositionCallback) => {
				success({ coords: { latitude: lat, longitude: lng } } as GeolocationPosition);
			}),
		},
		writable: true,
		configurable: true,
	});
}

afterEach(() => {
	cleanup();
	mockSearchFn.mockReset();
	mockAutocompleteFn.mockReset();
});

describe("App state transitions", () => {
	it("should start in the input state", () => {
		render(<Home />);

		expect(screen.getByText(/help, i need/i)).toBeTruthy();
		expect(screen.getByText("use my current location")).toBeTruthy();
		expect(screen.getByPlaceholderText("or type an address...")).toBeTruthy();
	});

	it("should transition to loading state when a location is provided", async () => {
		setupGeolocation();
		mockSearchFn.mockImplementation(() => new Promise(() => {}));

		render(<Home />);
		fireEvent.click(screen.getByText("use my current location"));

		await waitFor(() => {
			expect(screen.getByText(/hang in there, pal/i)).toBeTruthy();
		});
	});

	it("should transition to result state when a shop is found", async () => {
		setupGeolocation();
		mockSearchFn.mockImplementation(() =>
			Promise.resolve({
				name: "Best Coffee",
				driveTimeMinutes: 3,
				isOpen: true,
				todayHours: { open: "7:00 AM", close: "9:00 PM" },
				coordinates: { lat: 40.71, lng: -74.01 },
				placeId: "test-id",
			}),
		);

		render(<Home />);
		fireEvent.click(screen.getByText("use my current location"));

		await waitFor(() => {
			expect(screen.getByText("Best Coffee")).toBeTruthy();
			expect(screen.getByText(/take me there/i)).toBeTruthy();
		});
	});

	it("should transition to error state on API failure", async () => {
		setupGeolocation();
		mockSearchFn.mockImplementation(() =>
			Promise.resolve({
				error: true,
				message: "Google API error",
				code: "API_ERROR",
			}),
		);

		render(<Home />);
		fireEvent.click(screen.getByText("use my current location"));

		await waitFor(() => {
			expect(screen.getByText(/something went wrong/i)).toBeTruthy();
		});
	});

	it("should reset to input state when try-again is clicked", async () => {
		setupGeolocation();
		mockSearchFn.mockImplementation(() =>
			Promise.resolve({
				error: true,
				message: "API error",
				code: "API_ERROR",
			}),
		);

		render(<Home />);
		fireEvent.click(screen.getByText("use my current location"));

		await waitFor(() => {
			expect(screen.getByText(/something went wrong/i)).toBeTruthy();
		});

		fireEvent.click(screen.getByText("try again"));

		expect(screen.getByText("use my current location")).toBeTruthy();
		expect(screen.queryByText(/something went wrong/i)).toBeNull();
	});
});
