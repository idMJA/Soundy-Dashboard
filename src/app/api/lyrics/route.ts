import { lyricsClient } from "@mjba/lyrics";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const trackName = searchParams.get("track_name");
	const artistName = searchParams.get("artist_name");
	const albumName = searchParams.get("album_name");
	const duration = searchParams.get("duration");

	if (!trackName || !artistName) {
		return NextResponse.json(
			{ error: "Missing required parameters" },
			{ status: 400 },
		);
	}

	// 1. Try our Musixmatch client first
	try {
		console.log(
			`[Lyrics API] Searching Musixmatch for: ${trackName} - ${artistName}`,
		);
		const result = await lyricsClient.searchSynced(
			`${trackName} ${artistName}`,
		);

		if (
			result?.success &&
			(result.syncedLyrics || result.richSyncedLyrics || result.lyrics)
		) {
			console.log(
				`[Lyrics API] Musixmatch found synced lyrics: hasTimestamps=${result.hasTimestamps}`,
			);
			return NextResponse.json({
				success: true,
				source: "musixmatch",
				hasTimestamps: result.hasTimestamps,
				syncedLyrics: result.syncedLyrics,
				richSyncedLyrics: result.richSyncedLyrics,
				plainLyrics: result.lyrics,
			});
		}
	} catch (error) {
		console.error("[Lyrics API] Musixmatch query error:", error);
	}

	// 2. Fall back to LRCLIB if needed
	if (!albumName || !duration) {
		return NextResponse.json(
			{
				error:
					"Lyrics not found on Musixmatch and missing parameters for LRCLIB fallback",
			},
			{ status: 404 },
		);
	}

	try {
		console.log(`[Lyrics API] Falling back to LRCLIB for: ${trackName}`);
		const url = `https://lrclib.net/api/get?track_name=${encodeURIComponent(trackName)}&artist_name=${encodeURIComponent(artistName)}&album_name=${encodeURIComponent(albumName)}&duration=${duration}`;

		const response = await fetch(url, {
			headers: {
				"User-Agent": "Soundy v3.4.0 (https://github.com/idMJA/Soundy)",
			},
		});

		if (!response.ok) {
			if (response.status === 404) {
				return NextResponse.json(
					{ error: "Lyrics not found" },
					{ status: 404 },
				);
			}
			throw new Error(`LRCLIB error: ${response.status}`);
		}

		const data = await response.json();
		return NextResponse.json({
			success: true,
			source: "lrclib",
			lrclibData: data,
		});
	} catch (error: unknown) {
		console.error("[Lyrics API] LRCLIB fallback error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch lyrics" },
			{ status: 500 },
		);
	}
}
