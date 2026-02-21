import { fetchWithRetry, getApiKey, sanitizeResponse } from "~/lib/google-api";
import type { AutocompleteErrorResponse, AutocompleteResponse } from "~/lib/types";

type AutocompleteApiResponse = {
	status: string;
	predictions: Array<{
		description: string;
		place_id: string;
	}>;
};

type PlaceDetailsApiResponse = {
	status: string;
	result: {
		geometry: {
			location: {
				lat: number;
				lng: number;
			};
		};
	};
};

type GetPlaceAutocompleteInput = {
	query: string;
	locationBias?: { lat: number; lng: number };
};

export async function getPlaceAutocomplete(
	input: GetPlaceAutocompleteInput,
): Promise<AutocompleteResponse | AutocompleteErrorResponse> {
	if (!input.query.trim()) {
		return { error: true, message: "Search query cannot be empty", code: "INVALID_INPUT" };
	}

	try {
		const apiKey = getApiKey();

		const autocompleteParams: Record<string, string> = {
			input: input.query,
			types: "address",
			key: apiKey,
		};

		if (input.locationBias) {
			autocompleteParams.location = `${input.locationBias.lat},${input.locationBias.lng}`;
			autocompleteParams.radius = "50000";
		}

		const autocompleteResponse = await fetchWithRetry({
			url: "https://maps.googleapis.com/maps/api/place/autocomplete/json",
			params: autocompleteParams,
		});

		const autocompleteData = (await autocompleteResponse.json()) as AutocompleteApiResponse;

		if (autocompleteData.status !== "OK" && autocompleteData.status !== "ZERO_RESULTS") {
			return sanitizeResponse({
				error: true as const,
				message: `Google API error: ${autocompleteData.status}`,
				code: "API_ERROR" as const,
			});
		}

		const predictions = autocompleteData.predictions.slice(0, 5);

		const suggestions = await Promise.all(
			predictions.map(async (prediction) => {
				const detailsResponse = await fetchWithRetry({
					url: "https://maps.googleapis.com/maps/api/place/details/json",
					params: {
						place_id: prediction.place_id,
						fields: "geometry",
						key: apiKey,
					},
				});

				const detailsData = (await detailsResponse.json()) as PlaceDetailsApiResponse;
				const location = detailsData.result.geometry.location;

				return {
					description: prediction.description,
					placeId: prediction.place_id,
					coordinates: { lat: location.lat, lng: location.lng },
				};
			}),
		);

		return sanitizeResponse({ suggestions });
	} catch (error) {
		return sanitizeResponse({
			error: true as const,
			message: `Google API error: ${error instanceof Error ? error.message : "Unknown error"}`,
			code: "API_ERROR" as const,
		});
	}
}
