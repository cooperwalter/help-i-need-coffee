export function formatDriveTime(minutes: number): string {
	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;

	if (hours === 0) {
		return `${remainingMinutes} min drive`;
	}

	if (remainingMinutes === 0) {
		return `${hours} hr drive`;
	}

	return `${hours} hr ${remainingMinutes} min drive`;
}

export function formatOpenStatus(
	isOpen: boolean,
	todayHours: { open: string; close: string } | null,
): string {
	if (isOpen) {
		if (todayHours === null) {
			return "open";
		}
		return `open · closes at ${todayHours.close}`;
	}

	if (todayHours === null) {
		return "closed";
	}
	return `closed · opens at ${todayHours.open}`;
}
