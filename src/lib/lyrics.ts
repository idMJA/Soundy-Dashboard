import type { LyricsResponse, SyncedLyric } from "@mjba/lyrics";
import type { LyricLine, LyricWord, SyncedLyricsLine } from "@/types/lyrics";

export type RichSyncedLyricLine = NonNullable<
	LyricsResponse["richSyncedLyrics"]
>[number];
export type WordSyncedLyric = RichSyncedLyricLine["words"][number];

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

/**
 * Convert SyncedLyricsLine array to Apple Music-like lyrics LyricLine format
 * @param syncedLines Array of synced lyrics lines
 * @returns Array of LyricLine objects for Apple Music-like lyrics component
 */
export function convertToAppleMusicFormat(
	syncedLines: SyncedLyricsLine[],
): LyricLine[] {
	if (!syncedLines || syncedLines.length === 0) return [];

	return syncedLines.map((line, index) => {
		const nextLine = syncedLines[index + 1];
		const endTime = nextLine ? nextLine.time : line.time + 3000; // Default 3 seconds if no next line

		let text = line.text?.trim() || "";
		if (text === "♪" || text === "🎵" || !text) {
			text = "•••";
		}

		const word: LyricWord = {
			startTime: line.time,
			endTime: endTime,
			word: text,
		};

		const lyricLine: LyricLine = {
			words: [word],
			translatedLyric: "",
			romanLyric: "",
			startTime: line.time,
			endTime: endTime,
			isBG: false,
			isDuet: false,
		};

		return lyricLine;
	});
}

export interface LyricsApiResponse {
	success: boolean;
	source: "musixmatch" | "lrclib";
	hasTimestamps?: boolean;
	syncedLyrics?: SyncedLyric[];
	richSyncedLyrics?: RichSyncedLyricLine[];
	plainLyrics?: string | null;
	lrclibData?: LrcLibLyricsResponse;
}

export function convertMusixmatchRichSyncToAppleMusic(
	richSyncedLyrics: RichSyncedLyricLine[],
): LyricLine[] {
	if (!richSyncedLyrics || richSyncedLyrics.length === 0) return [];

	return richSyncedLyrics.map((line) => {
		const startTime = Math.round(line.startTime.total * 1000);
		const endTime = Math.round(line.endTime.total * 1000);

		const words: LyricWord[] = line.words.map(
			(w: WordSyncedLyric, idx: number) => {
				const nextWord = line.words[idx + 1];
				const wStartTime = Math.round(w.time.total * 1000);
				const wEndTime = nextWord
					? Math.round(nextWord.time.total * 1000)
					: endTime;

				let text = w.text || "";
				if (text === "♪" || text === "🎵" || !text) {
					text = "•••";
				}

				return {
					startTime: wStartTime,
					endTime: wEndTime,
					word: text,
				};
			},
		);

		return {
			words,
			translatedLyric: "",
			romanLyric: "",
			startTime,
			endTime,
			isBG: false,
			isDuet: false,
		};
	});
}

export function convertMusixmatchSyncedToAppleMusic(
	syncedLyrics: SyncedLyric[],
): LyricLine[] {
	if (!syncedLyrics || syncedLyrics.length === 0) return [];

	return syncedLyrics.map((lyric, index) => {
		const nextLyric = syncedLyrics[index + 1];
		const startTime = Math.round(lyric.time.total * 1000);
		const endTime = nextLyric
			? Math.round(nextLyric.time.total * 1000)
			: startTime + 3000;

		let text = lyric.text?.trim() || "";
		if (text === "♪" || text === "🎵" || !text) {
			text = "•••";
		}

		return {
			words: [
				{
					startTime,
					endTime,
					word: text,
				},
			],
			translatedLyric: "",
			romanLyric: "",
			startTime,
			endTime,
			isBG: false,
			isDuet: false,
		};
	});
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
}): Promise<LyricsApiResponse | null> {
	try {
		const origin = typeof window !== "undefined" ? window.location.origin : "";
		const url = new URL("/api/lyrics", origin);
		url.searchParams.set("track_name", trackName);
		url.searchParams.set("artist_name", artistName);
		url.searchParams.set("album_name", albumName);
		url.searchParams.set("duration", String(duration));

		const response = await fetch(url.toString());
		if (!response.ok) {
			if (response.status === 404) return null;
			throw new Error(`Failed to fetch lyrics: ${response.status}`);
		}
		return (await response.json()) as LyricsApiResponse;
	} catch (error: unknown) {
		console.error("Error fetching lyrics:", error);
		return null;
	}
}
