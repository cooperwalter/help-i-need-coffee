import { describe, expect, it } from "bun:test";
import {
	buildAppleMapsUrl,
	buildGoogleMapsAppUrl,
	buildGoogleMapsIOSAppUrl,
	buildGoogleMapsWebUrl,
	buildMapsUrl,
	buildWazeUrl,
} from "./maps-url";
import type { Coordinates } from "./types";

const destination: Coordinates = { lat: 40.7128, lng: -74.006 };
const origin: Coordinates = { lat: 40.748, lng: -73.9856 };

describe("buildAppleMapsUrl", () => {
	it("should generate Apple Maps URL with destination coordinates and driving mode", () => {
		expect(buildAppleMapsUrl(destination)).toBe(
			"maps://maps.apple.com/?daddr=40.7128,-74.006&dirflg=d",
		);
	});

	it("should include origin coordinates as saddr when provided", () => {
		expect(buildAppleMapsUrl(destination, origin)).toBe(
			"maps://maps.apple.com/?saddr=40.748,-73.9856&daddr=40.7128,-74.006&dirflg=d",
		);
	});
});

describe("buildGoogleMapsAppUrl", () => {
	it("should generate Google Maps navigation URL with correct coordinates", () => {
		expect(buildGoogleMapsAppUrl(destination)).toBe("google.navigation:q=40.7128,-74.006&mode=d");
	});
});

describe("buildGoogleMapsIOSAppUrl", () => {
	it("should generate comgooglemaps:// URL with destination and driving mode", () => {
		expect(buildGoogleMapsIOSAppUrl(destination)).toBe(
			"comgooglemaps://?daddr=40.7128,-74.006&directionsmode=driving",
		);
	});

	it("should include origin coordinates as saddr when provided", () => {
		expect(buildGoogleMapsIOSAppUrl(destination, origin)).toBe(
			"comgooglemaps://?saddr=40.748,-73.9856&daddr=40.7128,-74.006&directionsmode=driving",
		);
	});
});

describe("buildWazeUrl", () => {
	it("should generate Waze URL with correct coordinates", () => {
		expect(buildWazeUrl(destination)).toBe("https://waze.com/ul?ll=40.7128,-74.006&navigate=yes");
	});
});

describe("buildGoogleMapsWebUrl", () => {
	it("should generate Google Maps web URL with destination and driving mode", () => {
		expect(buildGoogleMapsWebUrl(destination)).toBe(
			"https://www.google.com/maps/dir/?api=1&destination=40.7128,-74.006&travelmode=driving",
		);
	});

	it("should include origin coordinates when provided", () => {
		expect(buildGoogleMapsWebUrl(destination, origin)).toBe(
			"https://www.google.com/maps/dir/?api=1&origin=40.748,-73.9856&destination=40.7128,-74.006&travelmode=driving",
		);
	});
});

describe("buildMapsUrl", () => {
	it("should return Apple Maps URL with origin when platform is iOS", () => {
		expect(buildMapsUrl("ios", destination, origin)).toBe(
			"maps://maps.apple.com/?saddr=40.748,-73.9856&daddr=40.7128,-74.006&dirflg=d",
		);
	});

	it("should return Google Maps app URL when platform is Android", () => {
		expect(buildMapsUrl("android", destination, origin)).toBe(
			"google.navigation:q=40.7128,-74.006&mode=d",
		);
	});

	it("should return Google Maps web URL with origin when platform is desktop", () => {
		expect(buildMapsUrl("desktop", destination, origin)).toBe(
			"https://www.google.com/maps/dir/?api=1&origin=40.748,-73.9856&destination=40.7128,-74.006&travelmode=driving",
		);
	});
});
