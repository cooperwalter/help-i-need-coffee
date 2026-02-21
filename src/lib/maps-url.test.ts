import { describe, expect, it } from "bun:test";
import {
	buildAppleMapsUrl,
	buildGoogleMapsAppUrl,
	buildGoogleMapsWebUrl,
	buildMapsUrl,
	buildWazeUrl,
} from "./maps-url";
import type { Coordinates } from "./types";

const coords: Coordinates = { lat: 40.7128, lng: -74.006 };

describe("buildAppleMapsUrl", () => {
	it("should generate Apple Maps URL with correct coordinates and driving mode", () => {
		expect(buildAppleMapsUrl(coords)).toBe("maps://maps.apple.com/?daddr=40.7128,-74.006&dirflg=d");
	});
});

describe("buildGoogleMapsAppUrl", () => {
	it("should generate Google Maps navigation URL with correct coordinates", () => {
		expect(buildGoogleMapsAppUrl(coords)).toBe("google.navigation:q=40.7128,-74.006&mode=d");
	});
});

describe("buildWazeUrl", () => {
	it("should generate Waze URL with correct coordinates", () => {
		expect(buildWazeUrl(coords)).toBe("https://waze.com/ul?ll=40.7128,-74.006&navigate=yes");
	});
});

describe("buildGoogleMapsWebUrl", () => {
	it("should generate Google Maps web URL for desktop fallback", () => {
		expect(buildGoogleMapsWebUrl(coords)).toBe(
			"https://www.google.com/maps/dir/?api=1&destination=40.7128,-74.006&travelmode=driving",
		);
	});
});

describe("buildMapsUrl", () => {
	it("should return Apple Maps URL when platform is iOS", () => {
		expect(buildMapsUrl("ios", coords)).toBe(
			"maps://maps.apple.com/?daddr=40.7128,-74.006&dirflg=d",
		);
	});

	it("should return Google Maps app URL when platform is Android", () => {
		expect(buildMapsUrl("android", coords)).toBe("google.navigation:q=40.7128,-74.006&mode=d");
	});

	it("should return Google Maps web URL when platform is desktop", () => {
		expect(buildMapsUrl("desktop", coords)).toBe(
			"https://www.google.com/maps/dir/?api=1&destination=40.7128,-74.006&travelmode=driving",
		);
	});
});
