export interface SyncedLyricsLine {
	time: number; // Time in milliseconds
	text: string;
}

export interface LyricWord {
	startTime: number;
	endTime: number;
	word: string;
}

export interface LyricLine {
	words: LyricWord[];
	translatedLyric?: string;
	romanLyric?: string;
	startTime: number;
	endTime: number;
	isBG?: boolean;
	isDuet?: boolean;
}

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
