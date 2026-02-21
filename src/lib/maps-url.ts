import type { Coordinates, Platform } from "./types";

export function buildAppleMapsUrl(coords: Coordinates): string {
	return `maps://maps.apple.com/?daddr=${coords.lat},${coords.lng}&dirflg=d`;
}

export function buildGoogleMapsAppUrl(coords: Coordinates): string {
	return `google.navigation:q=${coords.lat},${coords.lng}&mode=d`;
}

export function buildGoogleMapsIOSAppUrl(coords: Coordinates): string {
	return `comgooglemaps://?daddr=${coords.lat},${coords.lng}&directionsmode=driving`;
}

export function buildGoogleMapsWebUrl(coords: Coordinates): string {
	return `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}&travelmode=driving`;
}

export function buildWazeUrl(coords: Coordinates): string {
	return `https://waze.com/ul?ll=${coords.lat},${coords.lng}&navigate=yes`;
}

export function buildMapsUrl(platform: Platform, coords: Coordinates): string {
	if (platform === "ios") {
		return buildAppleMapsUrl(coords);
	}
	if (platform === "android") {
		return buildGoogleMapsAppUrl(coords);
	}
	return buildGoogleMapsWebUrl(coords);
}
