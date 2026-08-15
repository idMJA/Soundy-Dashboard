/**
 * Unified Music Discovery & Metadata Service
 * Aggregates Deezer, Apple Music, Last.fm, and MusicBrainz/ListenBrainz
 */

export interface DiscoveryTrack {
	id: string;
	title: string;
	artist: string;
	album?: string;
	artworkUrl?: string;
	isrc?: string;
	durationMs?: number;
	source: "deezer" | "applemusic" | "lastfm" | "listenbrainz";
	previewUrl?: string;
}

interface DeezerTrackItem {
	id: number | string;
	title: string;
	artist?: { name: string };
	album?: {
		title?: string;
		cover_xl?: string;
		cover_medium?: string;
		cover_big?: string;
	};
	isrc?: string;
	duration?: number;
	preview?: string;
}

interface LastFmTrackItem {
	name: string;
	artist?: { name: string };
	image?: Array<{ "#text": string }>;
}

interface AppleMusicSearchItem {
	trackId: number;
	trackName: string;
	artistName: string;
	collectionName?: string;
	artworkUrl100?: string;
	trackTimeMillis?: number;
	previewUrl?: string;
}

const DEFAULT_HEADERS = {
	"User-Agent":
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
	Accept: "application/json",
};

/**
 * 1. DEEZER API - Metadata, Search & Trending Radio
 */
export async function fetchDeezerRecommendations(
	query = "indonesia hits",
): Promise<DiscoveryTrack[]> {
	try {
		// Try search query or chart
		const searchUrl = query
			? `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=15`
			: "https://api.deezer.com/chart/0/tracks?limit=15";

		const res = await fetch(searchUrl, {
			headers: DEFAULT_HEADERS,
			next: { revalidate: 3600 },
		});
		if (!res.ok) return [];
		const data = await res.json();
		const items = data.data || data.tracks?.data;
		if (!items || !Array.isArray(items)) return [];

		return (items as DeezerTrackItem[]).map((item) => ({
			id: String(item.id),
			title: item.title,
			artist: item.artist?.name || "Unknown Artist",
			album: item.album?.title,
			artworkUrl:
				item.album?.cover_medium ||
				item.album?.cover_big ||
				item.album?.cover_xl,
			isrc: item.isrc,
			durationMs: item.duration ? item.duration * 1000 : undefined,
			source: "deezer",
			previewUrl: item.preview,
		}));
	} catch (error) {
		console.error("Error fetching Deezer recommendations:", error);
		return [];
	}
}

export async function fetchDeezerTrackByISRC(
	isrc: string,
): Promise<DiscoveryTrack | null> {
	try {
		const res = await fetch(
			`https://api.deezer.com/track/isrc:${encodeURIComponent(isrc)}`,
			{
				headers: DEFAULT_HEADERS,
				next: { revalidate: 86400 },
			},
		);
		if (!res.ok) return null;
		const item = (await res.json()) as DeezerTrackItem & { error?: unknown };
		if (item.error) return null;

		return {
			id: String(item.id),
			title: item.title,
			artist: item.artist?.name || "Unknown Artist",
			album: item.album?.title,
			artworkUrl: item.album?.cover_xl || item.album?.cover_medium,
			isrc: item.isrc,
			durationMs: item.duration ? item.duration * 1000 : undefined,
			source: "deezer",
			previewUrl: item.preview,
		};
	} catch {
		return null;
	}
}

/**
 * 2. LAST.FM API - Similar Tracks & Genre Vibe Top Tracks (with Apple Music / Deezer Fallback)
 */
export async function fetchLastFmSimilar(
	artist: string,
	track: string,
	apiKey?: string,
): Promise<DiscoveryTrack[]> {
	const key = apiKey || process.env.LASTFM_API_KEY;
	if (key) {
		try {
			const url = `https://ws.audioscrobbler.com/2.0/?method=track.getsimilar&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(track)}&api_key=${key}&format=json&limit=12`;
			const res = await fetch(url, {
				headers: DEFAULT_HEADERS,
				next: { revalidate: 3600 },
			});
			if (res.ok) {
				const data = await res.json();
				const tracks = data?.similartracks?.track;
				if (tracks && Array.isArray(tracks)) {
					return (tracks as LastFmTrackItem[]).map((item, idx) => ({
						id: `lastfm-${idx}-${item.name}`,
						title: item.name,
						artist: item.artist?.name || "Unknown Artist",
						artworkUrl:
							item.image?.[3]?.["#text"] ||
							item.image?.[2]?.["#text"] ||
							undefined,
						source: "lastfm",
					}));
				}
			}
		} catch (error) {
			console.error("Error fetching Last.fm similar tracks:", error);
		}
	}
	// Fallback to Deezer search for artist
	return fetchDeezerRecommendations(artist || track);
}

export async function fetchLastFmTopByTag(
	tag: string,
	apiKey?: string,
): Promise<DiscoveryTrack[]> {
	const key = apiKey || process.env.LASTFM_API_KEY;
	if (key) {
		try {
			const url = `https://ws.audioscrobbler.com/2.0/?method=tag.gettoptracks&tag=${encodeURIComponent(tag)}&api_key=${key}&format=json&limit=15`;
			const res = await fetch(url, {
				headers: DEFAULT_HEADERS,
				next: { revalidate: 3600 },
			});
			if (res.ok) {
				const data = await res.json();
				const tracks = data?.tracks?.track;
				if (tracks && Array.isArray(tracks) && tracks.length > 0) {
					return (tracks as LastFmTrackItem[]).map((item, idx) => ({
						id: `tag-${tag}-${idx}`,
						title: item.name,
						artist: item.artist?.name || "Unknown Artist",
						artworkUrl:
							item.image?.[3]?.["#text"] ||
							item.image?.[2]?.["#text"] ||
							undefined,
						source: "lastfm",
					}));
				}
			}
		} catch (error) {
			console.error("Error fetching Last.fm tag tracks:", error);
		}
	}

	// Fallback to Deezer search for genre tag
	return fetchDeezerRecommendations(tag);
}

/**
 * 3. APPLE MUSIC PUBLIC CATALOG SEARCH & CHARTS
 */
export async function fetchAppleMusicCatalogSearch(
	query: string,
	country = "us",
): Promise<DiscoveryTrack[]> {
	try {
		const res = await fetch(
			`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=12&country=${country}`,
			{ headers: DEFAULT_HEADERS, next: { revalidate: 3600 } },
		);
		if (!res.ok) return [];
		const data = await res.json();
		if (!data.results || !Array.isArray(data.results)) return [];

		return (data.results as AppleMusicSearchItem[]).map((item) => ({
			id: String(item.trackId),
			title: item.trackName,
			artist: item.artistName,
			album: item.collectionName,
			artworkUrl: item.artworkUrl100
				? item.artworkUrl100.replace("100x100bb", "600x600bb")
				: undefined,
			durationMs: item.trackTimeMillis,
			source: "applemusic",
			previewUrl: item.previewUrl,
		}));
	} catch (error) {
		console.error("Error fetching Apple Music search:", error);
		return [];
	}
}

/**
 * 4. MUSICBRAINZ ISRC LOOKUP (Open Source Standard)
 */
export async function fetchMusicBrainzByISRC(
	isrc: string,
): Promise<DiscoveryTrack | null> {
	try {
		const res = await fetch(
			`https://musicbrainz.org/ws/2/recording?query=isrc:${encodeURIComponent(isrc)}&fmt=json`,
			{
				headers: {
					"User-Agent": "SoundyDashboard/1.0 ( https://soundy.app )",
					Accept: "application/json",
				},
				next: { revalidate: 86400 },
			},
		);
		if (!res.ok) return null;
		const data = await res.json();
		const rec = data.recordings?.[0];
		if (!rec) return null;

		return {
			id: rec.id,
			title: rec.title,
			artist: rec["artist-credit"]?.[0]?.name || "Unknown Artist",
			isrc: isrc,
			source: "listenbrainz",
		};
	} catch {
		return null;
	}
}
