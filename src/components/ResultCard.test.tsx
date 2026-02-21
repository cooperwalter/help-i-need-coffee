import { afterEach, describe, expect, it, mock } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { CoffeeShopResult } from "~/lib/types";
import { ResultCard } from "./ResultCard";

afterEach(cleanup);

function makeResult(overrides?: Partial<CoffeeShopResult>): CoffeeShopResult {
	return {
		name: "Test Coffee Shop",
		driveTimeMinutes: 5,
		isOpen: true,
		todayHours: { open: "7:00 AM", close: "9:00 PM" },
		coordinates: { lat: 40.7, lng: -74.0 },
		placeId: "test-place-id",
		...overrides,
	};
}

describe("ResultCard", () => {
	it("should display the coffee shop name, drive time, and open status", () => {
		render(<ResultCard result={makeResult()} onSearchAgain={() => {}} />);

		expect(screen.getByText("Test Coffee Shop")).toBeTruthy();
		expect(screen.getByText("5 min drive")).toBeTruthy();
		expect(screen.getByText(/open · closes at 9:00 PM/)).toBeTruthy();
	});

	it("should display today's closing time when the shop is open", () => {
		render(
			<ResultCard
				result={makeResult({ isOpen: true, todayHours: { open: "7:00 AM", close: "9:00 PM" } })}
				onSearchAgain={() => {}}
			/>,
		);

		expect(screen.getByText(/closes at 9:00 PM/)).toBeTruthy();
	});

	it("should display today's opening time when the shop is closed", () => {
		render(
			<ResultCard
				result={makeResult({
					isOpen: false,
					todayHours: { open: "7:00 AM", close: "9:00 PM" },
				})}
				onSearchAgain={() => {}}
			/>,
		);

		expect(screen.getByText(/opens at 7:00 AM/)).toBeTruthy();
	});

	it("should render the TAKE ME THERE button with the correct maps URL", () => {
		const coords = { lat: 40.7, lng: -74.0 };
		render(<ResultCard result={makeResult({ coordinates: coords })} onSearchAgain={() => {}} />);

		const link = screen.getByText(/take me there/i);
		const anchor = link.closest("a");
		expect(anchor).toBeTruthy();
		expect(anchor?.getAttribute("href")).toContain("40.7");
		expect(anchor?.getAttribute("href")).toContain("-74");
		expect(anchor?.getAttribute("target")).toBe("_blank");
	});

	it("should include origin coordinates in the maps URL when provided", () => {
		const dest = { lat: 40.7, lng: -74.0 };
		const orig = { lat: 40.75, lng: -73.99 };
		render(
			<ResultCard
				result={makeResult({ coordinates: dest })}
				origin={orig}
				onSearchAgain={() => {}}
			/>,
		);

		const link = screen.getByText(/take me there/i);
		const anchor = link.closest("a");
		expect(anchor?.getAttribute("href")).toContain("40.75");
		expect(anchor?.getAttribute("href")).toContain("-73.99");
	});

	it("should show the 'use a different app' options when the link is clicked", () => {
		render(<ResultCard result={makeResult()} onSearchAgain={() => {}} />);

		expect(screen.queryByText("apple maps")).toBeNull();
		expect(screen.queryByText("google maps")).toBeNull();
		expect(screen.queryByText("waze")).toBeNull();

		fireEvent.click(screen.getByText("use a different app"));

		expect(screen.getByText("apple maps")).toBeTruthy();
		expect(screen.getByText("google maps")).toBeTruthy();
		expect(screen.getByText("waze")).toBeTruthy();
	});

	it("should render the try-again link that resets to input state", () => {
		const onSearchAgain = mock(() => {});
		render(<ResultCard result={makeResult()} onSearchAgain={onSearchAgain} />);

		fireEvent.click(screen.getByText("search again"));

		expect(onSearchAgain).toHaveBeenCalledTimes(1);
	});
});
