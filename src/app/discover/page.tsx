"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
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
							Array.from({ length: 6 }).map(() => (
								<div
									key={`release-skel-${crypto.randomUUID()}`}
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
								<Link
									key={`release-${release.id}-${index}`}
									href={`/view/${encodeURIComponent(`https://open.spotify.com/album/${release.id}`)}`}
									className="group music-card p-4 hover-lift animate-scale-in block cursor-pointer"
									style={{ animationDelay: `${index * 0.07}s` }}
								>
									<div className="relative aspect-square rounded-xl overflow-hidden mb-4 shadow-md group-hover:shadow-lg transition-all">
										{release.images?.[0]?.url ? (
											<Image
												src={release.images[0].url}
												alt={release.name}
												width={400}
												height={400}
												className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300 rounded-xl"
												priority={false}
												unoptimized={false}
											/>
										) : (
											<div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
												<div className="text-4xl opacity-50">🆕</div>
											</div>
										)}
										{/* Hover overlay */}
										<div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
											<div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-lg">
												<Play className="w-6 h-6 text-white" fill="currentColor" />
											</div>
										</div>
									</div>
									<div className="space-y-1">
										<h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
											{release.name}
										</h3>
										<p className="text-xs text-muted-foreground truncate">
											{release.artists?.map((a: { name: string }) => a.name).join(", ")}
										</p>
										<p className="text-xs text-muted-foreground">
											{release.album_type}
										</p>
									</div>
								</Link>
							))
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
