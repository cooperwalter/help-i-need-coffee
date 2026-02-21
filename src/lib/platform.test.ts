import { describe, expect, it } from "bun:test";
import { detectPlatform } from "./platform";

describe("detectPlatform", () => {
	it("should return ios for iPhone user agents", () => {
		expect(detectPlatform("Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)")).toBe("ios");
	});

	it("should return android for Android user agents", () => {
		expect(detectPlatform("Mozilla/5.0 (Linux; Android 13; Pixel 7)")).toBe("android");
	});

	it("should return desktop for non-mobile user agents", () => {
		expect(detectPlatform("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)")).toBe("desktop");
	});
});
