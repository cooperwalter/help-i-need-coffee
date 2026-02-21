import type { Coordinates, Platform } from "./types";

export function buildAppleMapsUrl(destination: Coordinates, origin?: Coordinates): string {
	const originParam = origin ? `saddr=${origin.lat},${origin.lng}&` : "";
	return `maps://maps.apple.com/?${originParam}daddr=${destination.lat},${destination.lng}&dirflg=d`;
}

export function buildGoogleMapsAppUrl(destination: Coordinates): string {
	return `google.navigation:q=${destination.lat},${destination.lng}&mode=d`;
}

export function buildGoogleMapsIOSAppUrl(destination: Coordinates, origin?: Coordinates): string {
	const originParam = origin ? `saddr=${origin.lat},${origin.lng}&` : "";
	return `comgooglemaps://?${originParam}daddr=${destination.lat},${destination.lng}&directionsmode=driving`;
}

export function buildGoogleMapsWebUrl(destination: Coordinates, origin?: Coordinates): string {
	const originParam = origin ? `&origin=${origin.lat},${origin.lng}` : "";
	return `https://www.google.com/maps/dir/?api=1${originParam}&destination=${destination.lat},${destination.lng}&travelmode=driving`;
}

export function buildWazeUrl(destination: Coordinates): string {
	return `https://waze.com/ul?ll=${destination.lat},${destination.lng}&navigate=yes`;
}

export function buildMapsUrl(
	platform: Platform,
	destination: Coordinates,
	origin?: Coordinates,
): string {
	if (platform === "ios") {
		return buildAppleMapsUrl(destination, origin);
	}
	if (platform === "android") {
		return buildGoogleMapsAppUrl(destination);
	}
	return buildGoogleMapsWebUrl(destination, origin);
}
