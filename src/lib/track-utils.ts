import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

// Utility functions for track handling

interface TrackData {
	id?: string;
	uri?: string;
	url?: string;
	title?: string;
	name?: string;
	artist?: string;
	author?: string;
}

import { PLATFORMS } from "./media-routes";

/**
 * Generate a URL-safe track ID for navigation
 * @param track Track data object
 * @returns URL-encoded track identifier
 */
export function generateTrackId(track: TrackData): string {
	const rawUrl = track.uri || track.url || track.id || "";

	if (rawUrl) {
		for (const platform of PLATFORMS) {
			const isMatch =
				typeof platform.domainPattern === "string"
					? rawUrl.includes(platform.domainPattern)
					: platform.domainPattern.test(rawUrl);

			if (isMatch) {
				const path = platform.toAestheticPath(rawUrl);
				if (path) return path;
			}
		}
	}

	return encodeURIComponent(
		rawUrl ||
			`${track.title || track.name || "Unknown"} ${track.artist || track.author || "Unknown"}`,
	);
}

/**
 * Navigate to track view page
 * @param track Track data object
 * @param router Next.js router instance
 */
export function navigateToTrackView(
	track: TrackData,
	router: AppRouterInstance,
): void {
	const trackId = generateTrackId(track);
	router.push(`/view/${trackId}`);
}

/**
 * Format duration from seconds to MM:SS
 * @param seconds Duration in seconds
 * @returns Formatted duration string
 */
export function formatDuration(seconds: number): string {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}
