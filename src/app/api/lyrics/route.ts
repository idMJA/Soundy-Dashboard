import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const trackName = searchParams.get("track_name");
	const artistName = searchParams.get("artist_name");
	const albumName = searchParams.get("album_name");
	const duration = searchParams.get("duration");

	if (!trackName || !artistName || !albumName || !duration) {
		return NextResponse.json(
			{ error: "Missing required parameters" },
			{ status: 400 },
		);
	}

	try {
		const response = await axios.get("https://lrclib.net/api/get", {
			params: {
				track_name: trackName,
				artist_name: artistName,
				album_name: albumName,
				duration,
			},
			headers: {
				"User-Agent": "Soundy v3.4.0 (https://github.com/idMJA/Soundy)",
			},
		});

		return NextResponse.json(response.data);
	} catch (error: unknown) {
		console.error("Error fetching lyrics:", error);

		// If LRCLIB returns a 404, we should also return 404
		if (axios.isAxiosError(error) && error.response?.status === 404) {
			return NextResponse.json({ error: "Lyrics not found" }, { status: 404 });
		}

		return NextResponse.json(
			{ error: "Failed to fetch lyrics" },
			{ status: 500 },
		);
	}
}
