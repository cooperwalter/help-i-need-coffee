import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { fetchWithRetry, getApiKey, sanitizeResponse } from "./google-api";

const originalFetch = globalThis.fetch;
const originalEnv = process.env.GOOGLE_PLACES_API_KEY;

beforeEach(() => {
	process.env.GOOGLE_PLACES_API_KEY = "test-api-key-12345";
});

afterEach(() => {
	globalThis.fetch = originalFetch;
	process.env.GOOGLE_PLACES_API_KEY = originalEnv;
});

describe("fetchWithRetry", () => {
	it("should make a successful request on first attempt", async () => {
		const mockResponse = new Response(JSON.stringify({ status: "OK" }), { status: 200 });
		globalThis.fetch = mock(() =>
			Promise.resolve(mockResponse),
		) as unknown as typeof globalThis.fetch;

		const result = await fetchWithRetry({
			url: "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
			params: { key: "test-key", location: "40.7,-74.0" },
		});

		expect(result.status).toBe(200);
		expect(globalThis.fetch).toHaveBeenCalledTimes(1);
	});

	it("should retry once on HTTP 429 and succeed on second attempt", async () => {
		let callCount = 0;
		globalThis.fetch = mock(() => {
			callCount++;
			if (callCount === 1) {
				return Promise.resolve(new Response("Rate limited", { status: 429 }));
			}
			return Promise.resolve(new Response(JSON.stringify({ status: "OK" }), { status: 200 }));
		}) as unknown as typeof globalThis.fetch;

		const result = await fetchWithRetry({
			url: "https://maps.googleapis.com/maps/api/test",
			params: {},
		});

		expect(result.status).toBe(200);
		expect(callCount).toBe(2);
	});

	it("should retry once on HTTP 500 and succeed on second attempt", async () => {
		let callCount = 0;
		globalThis.fetch = mock(() => {
			callCount++;
			if (callCount === 1) {
				return Promise.resolve(new Response("Server error", { status: 500 }));
			}
			return Promise.resolve(new Response(JSON.stringify({ status: "OK" }), { status: 200 }));
		}) as unknown as typeof globalThis.fetch;

		const result = await fetchWithRetry({
			url: "https://maps.googleapis.com/maps/api/test",
			params: {},
		});

		expect(result.status).toBe(200);
		expect(callCount).toBe(2);
	});

	it("should retry once on HTTP 503 and succeed on second attempt", async () => {
		let callCount = 0;
		globalThis.fetch = mock(() => {
			callCount++;
			if (callCount === 1) {
				return Promise.resolve(new Response("Unavailable", { status: 503 }));
			}
			return Promise.resolve(new Response(JSON.stringify({ status: "OK" }), { status: 200 }));
		}) as unknown as typeof globalThis.fetch;

		const result = await fetchWithRetry({
			url: "https://maps.googleapis.com/maps/api/test",
			params: {},
		});

		expect(result.status).toBe(200);
		expect(callCount).toBe(2);
	});

	it("should return error response after both retry attempts fail with 429", async () => {
		globalThis.fetch = mock(() =>
			Promise.resolve(new Response("Rate limited", { status: 429 })),
		) as unknown as typeof globalThis.fetch;

		const result = await fetchWithRetry({
			url: "https://maps.googleapis.com/maps/api/test",
			params: {},
		});

		expect(result.status).toBe(429);
		expect(globalThis.fetch).toHaveBeenCalledTimes(2);
	});

	it("should throw after timeout on first attempt and timeout on retry", async () => {
		globalThis.fetch = mock(
			(_url: string, init: { signal: AbortSignal }) =>
				new Promise((_resolve, reject) => {
					init.signal.addEventListener("abort", () => {
						reject(new DOMException("The operation was aborted.", "AbortError"));
					});
				}),
		) as unknown as typeof globalThis.fetch;

		await expect(
			fetchWithRetry({
				url: "https://maps.googleapis.com/maps/api/test",
				params: {},
				timeoutMs: 50,
			}),
		).rejects.toThrow();
	});

	it("should include all params in the request URL", async () => {
		let capturedUrl = "";
		globalThis.fetch = mock((url: string) => {
			capturedUrl = url;
			return Promise.resolve(new Response(JSON.stringify({ status: "OK" }), { status: 200 }));
		}) as unknown as typeof globalThis.fetch;

		await fetchWithRetry({
			url: "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
			params: { key: "my-key", location: "40.7,-74.0", radius: "5000" },
		});

		expect(capturedUrl).toContain("key=my-key");
		expect(capturedUrl).toContain("location=40.7%2C-74.0");
		expect(capturedUrl).toContain("radius=5000");
	});
});

describe("getApiKey", () => {
	it("should return the API key from environment variables", () => {
		expect(getApiKey()).toBe("test-api-key-12345");
	});

	it("should throw when GOOGLE_PLACES_API_KEY is not set", () => {
		process.env.GOOGLE_PLACES_API_KEY = undefined;
		expect(() => getApiKey()).toThrow("GOOGLE_PLACES_API_KEY environment variable is not set");
	});
});

describe("sanitizeResponse", () => {
	it("should redact API key from response data when present", () => {
		const data = { result: "test-api-key-12345 was used", status: "OK" };
		const sanitized = sanitizeResponse(data);
		expect(sanitized.result).toBe("[REDACTED] was used");
		expect(sanitized.status).toBe("OK");
	});

	it("should return data unchanged when API key is not present in response", () => {
		const data = { result: "some safe data", status: "OK" };
		const sanitized = sanitizeResponse(data);
		expect(sanitized).toEqual(data);
	});

	it("should return data unchanged when GOOGLE_PLACES_API_KEY env var is not set", () => {
		process.env.GOOGLE_PLACES_API_KEY = undefined;
		const data = { result: "some data", status: "OK" };
		const sanitized = sanitizeResponse(data);
		expect(sanitized).toEqual(data);
	});
});
