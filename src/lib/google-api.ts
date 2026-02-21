const DEFAULT_TIMEOUT_MS = 10_000;
const RETRYABLE_STATUS_CODES = new Set([429, 500, 503]);

export type GoogleApiOptions = {
	url: string;
	params: Record<string, string>;
	timeoutMs?: number;
};

export async function fetchWithRetry(options: GoogleApiOptions): Promise<Response> {
	const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
	const url = new URL(options.url);
	for (const [key, value] of Object.entries(options.params)) {
		url.searchParams.set(key, value);
	}

	let lastError: unknown;

	for (let attempt = 0; attempt < 2; attempt++) {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

		try {
			const response = await fetch(url.toString(), { signal: controller.signal });
			clearTimeout(timeoutId);

			if (RETRYABLE_STATUS_CODES.has(response.status) && attempt === 0) {
				lastError = new Error(`HTTP ${response.status}`);
				continue;
			}

			return response;
		} catch (error) {
			clearTimeout(timeoutId);
			if (attempt === 0 && error instanceof DOMException && error.name === "AbortError") {
				lastError = new Error("Request timed out");
				continue;
			}
			throw error;
		}
	}

	throw lastError;
}

export function getApiKey(): string {
	const key = process.env.GOOGLE_PLACES_API_KEY;
	if (!key) {
		throw new Error("GOOGLE_PLACES_API_KEY environment variable is not set");
	}
	return key;
}

export function sanitizeResponse<T extends Record<string, unknown>>(data: T): T {
	const apiKey = process.env.GOOGLE_PLACES_API_KEY;
	if (!apiKey) return data;

	const json = JSON.stringify(data);
	if (json.includes(apiKey)) {
		return JSON.parse(json.replaceAll(apiKey, "[REDACTED]")) as T;
	}
	return data;
}
