import { type NextRequest, NextResponse } from "next/server";
import { DISCOVER_NICHE_SEEDS } from "@/config/discover-seeds";
import {
	type DiscoveryTrack,
	fetchAppleMusicCatalogSearch,
	fetchDeezerRecommendations,
	fetchLastFmSimilar,
	fetchLastFmTopByTag,
} from "@/lib/music-discovery";

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const artist = searchParams.get("artist");
	const track = searchParams.get("track");

	// Pick random unique seeds from configuration file
	const shuffledSeeds = [...DISCOVER_NICHE_SEEDS].sort(
		() => 0.5 - Math.random(),
	);

	try {
		const lastFmPromise =
			artist && track
				? fetchLastFmSimilar(artist, track)
				: fetchLastFmTopByTag(shuffledSeeds[0]);

		const [deezerRecs, lastFmTagTracks, appleTrends] = await Promise.all([
			fetchDeezerRecommendations(shuffledSeeds[1]),
			lastFmPromise,
			fetchAppleMusicCatalogSearch(shuffledSeeds[2]),
		]);

		// Combine all recommendations into a single unified stream
		const rawCombined: DiscoveryTrack[] = [
			...deezerRecs,
			...lastFmTagTracks,
			...appleTrends,
		];

		// Deduplicate by title & artist
		const seen = new Set<string>();
		const combinedTracks: DiscoveryTrack[] = [];

		for (const t of rawCombined) {
			const key = `${t.title.toLowerCase().trim()}-${t.artist.toLowerCase().trim()}`;
			if (!seen.has(key)) {
				seen.add(key);
				combinedTracks.push(t);
			}
		}

		// Shuffle for ultimate serendipity
		const finalFeed = combinedTracks.sort(() => 0.5 - Math.random());

		return NextResponse.json(
			{
				success: true,
				tracks: finalFeed,
				meta: {
					total: finalFeed.length,
					seeds: [shuffledSeeds[0], shuffledSeeds[1], shuffledSeeds[2]],
					seedArtist: artist || null,
				},
			},
			{
				headers: {
					"Cache-Control": "public, s-maxage=180, stale-while-revalidate=300",
				},
			},
		);
	} catch (error) {
		console.error("Error in /api/discover:", error);
		return NextResponse.json(
			{ success: false, error: String(error) },
			{ status: 500 },
		);
	}
}
