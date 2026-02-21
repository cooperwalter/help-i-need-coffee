import type { Platform } from "./types";

export function detectPlatform(userAgent: string): Platform {
	if (/iPhone|iPad|iPod/.test(userAgent)) {
		return "ios";
	}
	if (/Android/.test(userAgent)) {
		return "android";
	}
	return "desktop";
}
