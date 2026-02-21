import { describe, expect, it } from "bun:test";
import { formatDriveTime, formatOpenStatus } from "./format";

describe("formatDriveTime", () => {
	it('should format 3 minutes as "3 min drive"', () => {
		expect(formatDriveTime(3)).toBe("3 min drive");
	});

	it('should format 65 minutes as "1 hr 5 min drive"', () => {
		expect(formatDriveTime(65)).toBe("1 hr 5 min drive");
	});

	it('should format 1 minute as "1 min drive"', () => {
		expect(formatDriveTime(1)).toBe("1 min drive");
	});

	it('should format exactly 60 minutes as "1 hr drive"', () => {
		expect(formatDriveTime(60)).toBe("1 hr drive");
	});

	it('should format 120 minutes as "2 hr drive"', () => {
		expect(formatDriveTime(120)).toBe("2 hr drive");
	});
});

describe("formatOpenStatus", () => {
	it('should display "open" with closing time when shop is currently open', () => {
		expect(formatOpenStatus(true, { open: "7:00 AM", close: "9:00 PM" })).toBe(
			"open · closes at 9:00 PM",
		);
	});

	it('should display "closed" with opening time when shop is currently closed', () => {
		expect(formatOpenStatus(false, { open: "7:00 AM", close: "9:00 PM" })).toBe(
			"closed · opens at 7:00 AM",
		);
	});

	it('should display "open" without hours when todayHours is null and shop is open', () => {
		expect(formatOpenStatus(true, null)).toBe("open");
	});

	it('should display "closed" without hours when todayHours is null and shop is closed', () => {
		expect(formatOpenStatus(false, null)).toBe("closed");
	});
});
