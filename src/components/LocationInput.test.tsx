import { afterEach, describe, expect, it, mock } from "bun:test";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

const mockAutocompleteFn = mock(() =>
	Promise.resolve({
		suggestions: [] as Array<{
			description: string;
			placeId: string;
			coordinates: { lat: number; lng: number };
		}>,
	}),
);

mock.module("~/server/get-place-autocomplete", () => ({
	getPlaceAutocompleteFn: mockAutocompleteFn,
}));

import { LocationInput } from "./LocationInput";

afterEach(() => {
	cleanup();
	mockAutocompleteFn.mockReset();
});

function setupGeolocation(
	behavior: "success" | "denied" | "timeout",
	coords = { latitude: 40.7, longitude: -74.0 },
) {
	const mockGetCurrentPosition = mock(
		(success: PositionCallback, error?: PositionErrorCallback | null) => {
			if (behavior === "success") {
				success({ coords } as GeolocationPosition);
			} else if (error) {
				error({
					code: behavior === "denied" ? 1 : 3,
					message: behavior === "denied" ? "User denied Geolocation" : "Timeout expired",
					PERMISSION_DENIED: 1,
					POSITION_UNAVAILABLE: 2,
					TIMEOUT: 3,
				});
			}
		},
	);

	Object.defineProperty(globalThis.navigator, "geolocation", {
		value: { getCurrentPosition: mockGetCurrentPosition },
		writable: true,
		configurable: true,
	});

	return mockGetCurrentPosition;
}

const mockSuggestions = [
	{
		description: "123 Main St, New York, NY",
		placeId: "p1",
		coordinates: { lat: 40.7, lng: -74.0 },
	},
	{
		description: "456 Oak Ave, Brooklyn, NY",
		placeId: "p2",
		coordinates: { lat: 40.65, lng: -73.95 },
	},
];

describe("LocationInput", () => {
	it("should render the geolocation button and address input", () => {
		render(<LocationInput onLocationSelected={() => {}} />);

		expect(screen.getByText("use my current location")).toBeTruthy();
		expect(screen.getByPlaceholderText("or type an address...")).toBeTruthy();
	});

	it("should call the geolocation API when the location button is clicked", () => {
		const mockGeo = setupGeolocation("success");
		const onLocationSelected = mock(() => {});

		render(<LocationInput onLocationSelected={onLocationSelected} />);
		fireEvent.click(screen.getByText("use my current location"));

		expect(mockGeo).toHaveBeenCalledTimes(1);
		expect(onLocationSelected).toHaveBeenCalledWith({ lat: 40.7, lng: -74.0 });
	});

	it("should display autocomplete suggestions when the user types an address", async () => {
		mockAutocompleteFn.mockImplementation(() => Promise.resolve({ suggestions: mockSuggestions }));

		render(<LocationInput onLocationSelected={() => {}} />);
		const input = screen.getByPlaceholderText("or type an address...");

		fireEvent.change(input, { target: { value: "123 Main" } });

		await waitFor(
			() => {
				expect(screen.getByText("123 Main St, New York, NY")).toBeTruthy();
				expect(screen.getByText("456 Oak Ave, Brooklyn, NY")).toBeTruthy();
			},
			{ timeout: 1000 },
		);
	});

	it("should select a suggestion and trigger search when a suggestion is clicked", async () => {
		mockAutocompleteFn.mockImplementation(() => Promise.resolve({ suggestions: mockSuggestions }));

		const onLocationSelected = mock(() => {});
		render(<LocationInput onLocationSelected={onLocationSelected} />);
		const input = screen.getByPlaceholderText("or type an address...");

		fireEvent.change(input, { target: { value: "123 Main" } });

		await waitFor(
			() => {
				expect(screen.getByText("123 Main St, New York, NY")).toBeTruthy();
			},
			{ timeout: 1000 },
		);

		fireEvent.click(screen.getByText("123 Main St, New York, NY"));
		expect(onLocationSelected).toHaveBeenCalledWith({ lat: 40.7, lng: -74.0 });
	});

	it("should show an error message when geolocation is denied", () => {
		setupGeolocation("denied");

		render(<LocationInput onLocationSelected={() => {}} />);
		fireEvent.click(screen.getByText("use my current location"));

		expect(screen.getByText("no worries, just type your address")).toBeTruthy();
	});

	it("should show an error message when geolocation times out", () => {
		setupGeolocation("timeout");

		render(<LocationInput onLocationSelected={() => {}} />);
		fireEvent.click(screen.getByText("use my current location"));

		expect(screen.getByText("no worries, just type your address")).toBeTruthy();
	});

	it("should debounce autocomplete requests by 300ms", async () => {
		mockAutocompleteFn.mockImplementation(() => Promise.resolve({ suggestions: [] }));

		render(<LocationInput onLocationSelected={() => {}} />);
		const input = screen.getByPlaceholderText("or type an address...");

		fireEvent.change(input, { target: { value: "1" } });
		fireEvent.change(input, { target: { value: "12" } });
		fireEvent.change(input, { target: { value: "123" } });

		expect(mockAutocompleteFn).not.toHaveBeenCalled();

		await waitFor(
			() => {
				expect(mockAutocompleteFn).toHaveBeenCalledTimes(1);
			},
			{ timeout: 1000 },
		);

		expect(mockAutocompleteFn).toHaveBeenCalledWith({ data: { query: "123" } });
	});
});
