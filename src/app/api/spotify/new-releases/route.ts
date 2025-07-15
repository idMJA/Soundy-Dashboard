import { NextResponse } from "next/server";

interface SpotifyArtist {
	id: string;
	name: string;
	uri: string;
	href: string;
	external_urls: Record<string, string>;
	type: string;
}

interface SpotifyAlbum {
	id: string;
	name: string;
	type: string;
	album_type: string;
	release_date: string;
	release_date_precision: string;
	total_tracks: number;
	uri: string;
	href: string;
	external_urls: Record<string, string>;
	images: Array<{ url: string; height: number; width: number }>;
	artists: SpotifyArtist[];
}

interface SpotifyAlbumsResponse {
	albums?: {
		items?: SpotifyAlbum[];
	};
}

export async function GET() {
	try {
		const res = await fetch(
			`${process.env.RECOMMENDATION_API_URL}/api/spotify/new-releases`,
		);
		if (!res.ok) {
			return NextResponse.json(
				{ error: "Failed to fetch new releases" },
				{ status: 502 },
			);
		}
		const data = await res.json();

		const albums: SpotifyAlbum[] = (
			(data as SpotifyAlbumsResponse).albums?.items || []
		).map(
			(album: SpotifyAlbum): SpotifyAlbum => ({
				id: album.id,
				name: album.name,
				type: album.type,
				album_type: album.album_type,
				release_date: album.release_date,
				release_date_precision: album.release_date_precision,
				total_tracks: album.total_tracks,
				uri: album.uri,
				href: album.href,
				external_urls: album.external_urls,
				images: album.images,
				artists: Array.isArray(album.artists)
					? album.artists.map(
							(artist: SpotifyArtist): SpotifyArtist => ({
								id: artist.id,
								name: artist.name,
								uri: artist.uri,
								href: artist.href,
								external_urls: artist.external_urls,
								type: artist.type,
							}),
						)
					: [],
			}),
		);
		return NextResponse.json({ albums });
	} catch {
		return NextResponse.json(
			{ error: "Failed to fetch new releases" },
			{ status: 500 },
		);
	}
}
