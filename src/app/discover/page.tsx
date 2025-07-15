"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

export default function DiscoverPage() {
	// New Releases (dynamic)
	const [newReleases, setNewReleases] = useState<SpotifyAlbum[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchReleases() {
			setLoading(true);
			setError(null);
			try {
				const res = await fetch("/api/spotify/new-releases");
				if (!res.ok) throw new Error("Failed to fetch new releases");
				const data = await res.json();
				setNewReleases(Array.isArray(data.albums) ? data.albums : []);
			} catch {
				setError("Failed to load new releases");
				setNewReleases([]);
			} finally {
				setLoading(false);
			}
		}
		fetchReleases();
	}, []);

	return (
		<div className="space-y-6">
			{/* New Releases Only */}
			<Card>
				<CardHeader>
					<CardTitle>New Releases</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
						{loading ? (
							Array.from({ length: 6 }).map((_, i) => (
								<div
									key={`release-skel-${i}`}
									className="bg-muted rounded-lg aspect-square animate-pulse"
								/>
							))
						) : error ? (
							<div className="col-span-full text-center text-destructive text-sm py-8">
								{error}
							</div>
						) : newReleases.length === 0 ? (
							<div className="col-span-full text-center text-muted-foreground text-sm py-8">
								No new releases found.
							</div>
						) : (
							newReleases.map((release, index) => (
								<div
									key={`release-${release.id}-${index}`}
									className="group cursor-pointer"
								>
									<div className="bg-muted rounded-lg aspect-square flex items-center justify-center mb-2 group-hover:bg-accent transition-colors shadow-sm overflow-hidden relative">
										{release.images && release.images[0]?.url ? (
											<Image
												src={release.images[0].url}
												alt={release.name}
												width={200}
												height={200}
												className="object-cover w-full h-full rounded-lg"
												priority={false}
												unoptimized={false}
											/>
										) : (
											<div className="text-base">🆕</div>
										)}
									</div>
									<h3 className="font-medium text-s truncate group-hover:text-primary">
										{release.name}
									</h3>
									<p className="text-[10px] text-muted-foreground truncate">
										{release.artists
											?.map((a: { name: string }) => a.name)
											.join(", ")}
									</p>
									<p className="text-[10px] text-muted-foreground">
										{release.album_type}
									</p>
								</div>
							))
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
