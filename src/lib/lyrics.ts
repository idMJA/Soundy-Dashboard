import axios from "axios";
import type { SyncedLyricsLine } from "@/types/lyrics";

export interface LrcLibLyricsResponse {
	id: number;
	trackName: string;
	artistName: string;
	albumName: string;
	duration: number;
	instrumental: boolean;
	plainLyrics: string;
	syncedLyrics: string;
}

export interface LrcLibLyricsError {
	code: number;
	name: string;
	message: string;
}

/**
 * Parse synced lyrics from LRC format to structured array
 * @param syncedLyrics LRC format lyrics string
 * @returns Array of parsed lyrics lines with timestamps
 */
export function parseSyncedLyrics(syncedLyrics: string): SyncedLyricsLine[] {
	if (!syncedLyrics) return [];

	// Regular expression to match [mm:ss.xx] timestamp format
	const regex = /\[(\d{2}):(\d{2})\.(\d{2})\](.*)/g;
	const lines: SyncedLyricsLine[] = [];

	const matches = syncedLyrics.matchAll(regex);
	for (const match of matches) {
		const minutes = parseInt(match[1], 10);
		const seconds = parseInt(match[2], 10);
		const hundredths = parseInt(match[3], 10);
		const text = match[4].trim();

		// Convert to milliseconds
		const time = (minutes * 60 + seconds) * 1000 + hundredths * 10;

		lines.push({ time, text });
	}

	// Sort by timestamp
	return lines.sort((a, b) => a.time - b.time);
}

export async function fetchLyricsFromLrcLib({
	trackName,
	artistName,
	albumName,
	duration,
}: {
	trackName: string;
	artistName: string;
	albumName: string;
	duration: number;
}): Promise<LrcLibLyricsResponse | null> {
	try {
		// Use our internal API route instead of directly calling LRCLIB
		const response = await axios.get<LrcLibLyricsResponse>("/api/lyrics", {
			params: {
				track_name: trackName,
				artist_name: artistName,
				album_name: albumName,
				duration,
			},
		});
		return response.data;
	} catch (error: unknown) {
		if (axios.isAxiosError(error) && error.response?.status === 404) {
			return null;
		}
		console.error("Error fetching lyrics:", error);
		return null; // Return null on any error to prevent app crashes
	}
}
