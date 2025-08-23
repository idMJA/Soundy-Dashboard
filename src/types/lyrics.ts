import type { LyricLine, LyricWord } from "@applemusic-like-lyrics/core";

export interface SyncedLyricsLine {
	time: number; // Time in milliseconds
	text: string;
}

export type { LyricLine, LyricWord };

export interface LyricsData {
	id: number;
	trackName: string;
	artistName: string;
	albumName: string;
	duration: number;
	instrumental: boolean;
	plainLyrics: string | null;
	syncedLyrics: string | null;
	parsedLyrics: SyncedLyricsLine[] | null;
}

export interface LyricsState {
	isLoading: boolean;
	error: string | null;
	lyricsData: LyricsData | null;
	activeLyricIndex: number | null;
}
