export type Coordinates = {
	lat: number;
	lng: number;
};

export type CoffeeShopResult = {
	name: string;
	driveTimeMinutes: number;
	isOpen: boolean;
	todayHours: { open: string; close: string } | null;
	coordinates: Coordinates;
	placeId: string;
};

export type SearchErrorResponse = {
	error: true;
	message: string;
	code: "NO_RESULTS" | "API_ERROR" | "TIMEOUT";
};

export type AutocompleteSuggestion = {
	description: string;
	placeId: string;
	coordinates: Coordinates;
};

export type AutocompleteResponse = {
	suggestions: AutocompleteSuggestion[];
};

export type AutocompleteErrorResponse = {
	error: true;
	message: string;
	code: "API_ERROR" | "INVALID_INPUT";
};

export type DirectionsResult = {
	driveTimeMinutes: number;
	distanceMeters: number;
};

export type DirectionsErrorResponse = {
	error: true;
	message: string;
	code: "NO_ROUTE" | "API_ERROR" | "TIMEOUT";
};

export type AppState = "input" | "loading" | "result" | "error-no-results" | "error-api";

export type Platform = "ios" | "android" | "desktop";
