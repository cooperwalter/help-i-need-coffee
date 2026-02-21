import { fetchWithRetry, getApiKey, sanitizeResponse } from "~/lib/google-api";
import type { Coordinates, DirectionsErrorResponse, DirectionsResult } from "~/lib/types";

type DirectionsApiResponse = {
	status: string;
	routes: Array<{
		legs: Array<{
			duration: { value: number };
			distance: { value: number };
		}>;
	}>;
};

export async function getDirections(
	input: {
		origin: Coordinates;
		destination: Coordinates;
	},
	options?: { timeoutMs?: number },
): Promise<DirectionsResult | DirectionsErrorResponse> {
	const { origin, destination } = input;
	const apiKey = getApiKey();

	try {
		const response = await fetchWithRetry({
			url: "https://maps.googleapis.com/maps/api/directions/json",
			params: {
				origin: `${origin.lat},${origin.lng}`,
				destination: `${destination.lat},${destination.lng}`,
				mode: "driving",
				key: apiKey,
			},
			timeoutMs: options?.timeoutMs,
		});

		const data = (await response.json()) as DirectionsApiResponse;

		if (data.status !== "OK") {
			if (data.routes.length === 0 && data.status === "ZERO_RESULTS") {
				return sanitizeResponse<DirectionsErrorResponse>({
					error: true,
					message: "No driving route found",
					code: "NO_ROUTE",
				});
			}
			return sanitizeResponse<DirectionsErrorResponse>({
				error: true,
				message: `Google API error: ${data.status}`,
				code: "API_ERROR",
			});
		}

		const leg = data.routes[0]?.legs[0];

		if (!leg) {
			return sanitizeResponse<DirectionsErrorResponse>({
				error: true,
				message: "No driving route found",
				code: "NO_ROUTE",
			});
		}

		const driveTimeMinutes = Math.round(leg.duration.value / 60);
		const distanceMeters = leg.distance.value;

		return sanitizeResponse<DirectionsResult>({
			driveTimeMinutes,
			distanceMeters,
		});
	} catch (error) {
		if (error instanceof Error && error.message === "Request timed out") {
			return sanitizeResponse<DirectionsErrorResponse>({
				error: true,
				message: "Request timed out",
				code: "TIMEOUT",
			});
		}
		if (error instanceof DOMException && error.name === "AbortError") {
			return sanitizeResponse<DirectionsErrorResponse>({
				error: true,
				message: "Request timed out",
				code: "TIMEOUT",
			});
		}
		throw error;
	}
}
