"use client";

import { Compass, Music, Play, RefreshCw } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWebSocket } from "@/components/WebSocketProvider";
import type { DiscoveryTrack } from "@/lib/music-discovery";

export default function DiscoverPage() {
	const [tracks, setTracks] = useState<DiscoveryTrack[]>([]);
	const [seeds, setSeeds] = useState<string[]>([]);
	const [seedArtist, setSeedArtist] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	const { playerState, userContext, sendCommand } = useWebSocket();

	const author = playerState?.track?.author;
	const title = playerState?.track?.title;

	const fetchFeed = async () => {
		setLoading(true);
		try {
			const queryParams = new URLSearchParams();
			if (author) queryParams.set("artist", author);
			if (title) queryParams.set("track", title);

			const res = await fetch(`/api/discover?${queryParams.toString()}`);
			if (res.ok) {
				const data = await res.json();
				if (data.tracks && Array.isArray(data.tracks)) {
					setTracks(data.tracks);
					if (data.meta) {
						setSeeds(data.meta.seeds || []);
						setSeedArtist(data.meta.seedArtist || null);
					}
				}
			}
		} catch (err) {
			console.error("Error loading discover feed:", err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		let isMounted = true;

		async function loadInitial() {
			try {
				const queryParams = new URLSearchParams();
				if (author) queryParams.set("artist", author);
				if (title) queryParams.set("track", title);

				const res = await fetch(`/api/discover?${queryParams.toString()}`);
				if (res.ok && isMounted) {
					const data = await res.json();
					if (data.tracks && Array.isArray(data.tracks) && isMounted) {
						setTracks(data.tracks);
						if (data.meta) {
							setSeeds(data.meta.seeds || []);
							setSeedArtist(data.meta.seedArtist || null);
						}
					}
				}
			} catch (err) {
				console.error("Error loading discover feed:", err);
			} finally {
				if (isMounted) setLoading(false);
			}
		}

		loadInitial();

		return () => {
			isMounted = false;
		};
	}, [author, title]);

	const handlePlayTrack = (track: DiscoveryTrack) => {
		if (!userContext.guildId) return;
		const query = track.isrc
			? `dzisrc:${track.isrc}`
			: `${track.title} ${track.artist}`;
		sendCommand({
			type: "play",
			guildId: userContext.guildId,
			query,
		});
	};

	return (
		<div className="container mx-auto p-6 space-y-8 max-w-7xl animate-fade-in">
			{/* Header Banner */}
			<div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/40 via-card to-background p-8 border border-border shadow-2xl backdrop-blur-xl">
				<div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
				<div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
					<div className="space-y-2">
						<div className="flex flex-wrap items-center gap-2">
							<Badge
								variant="outline"
								className="bg-primary/10 text-primary border-primary/30 px-3 py-1"
							>
								<Compass className="w-3.5 h-3.5 mr-1 text-primary" />
								Unified Discovery Stream
							</Badge>
							{seedArtist && (
								<Badge
									variant="secondary"
									className="bg-primary/10 text-primary border-primary/20 text-xs"
								>
									Based on: {seedArtist}
								</Badge>
							)}
							{seeds.map((s) => (
								<Badge
									key={`seed-${s}`}
									variant="outline"
									className="bg-muted text-muted-foreground border-border text-xs capitalize"
								>
									{s}
								</Badge>
							))}
						</div>
						<h1 className="text-4xl font-extrabold tracking-tight text-foreground font-heading">
							Discover Music
						</h1>
						<p className="text-muted-foreground text-sm max-w-2xl">
							Explore and pick tracks you love from a single unified stream
							aggregated across Deezer, Last.fm, Apple Music, and MusicBrainz.
						</p>
					</div>

					<Button
						onClick={fetchFeed}
						disabled={loading}
						className="rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 gap-2 cursor-pointer shadow-md shadow-primary/20 shrink-0"
					>
						<RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
						Shuffle Feed
					</Button>
				</div>
			</div>

			{/* Single Unified Exploration Grid */}
			<Card className="bg-card border-border rounded-3xl p-6 shadow-sm space-y-4">
				<CardHeader className="p-0 pb-2 flex flex-row items-center justify-between">
					<CardTitle className="text-xl font-bold text-foreground flex items-center gap-2 font-heading">
						<Music className="w-5 h-5 text-primary" /> Recommended Songs (
						{tracks.length})
					</CardTitle>
					<Badge
						variant="secondary"
						className="bg-primary/10 text-primary border-primary/20 text-xs"
					>
						1-Click Play
					</Badge>
				</CardHeader>
				<CardContent className="p-0">
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
						{loading ? (
							Array.from({ length: 12 }, (_, i) => `skel-disc-${i}`).map(
								(skelId) => (
									<div
										key={skelId}
										className="aspect-square bg-muted/40 rounded-2xl animate-pulse"
									/>
								),
							)
						) : tracks.length > 0 ? (
							tracks.map((track, idx) => (
								<button
									type="button"
									key={track.id || `track-${track.title}-${idx}`}
									onClick={() => handlePlayTrack(track)}
									className="text-left w-full group bg-muted/30 border border-border/60 p-3 rounded-2xl hover:border-primary/40 hover:bg-accent/40 transition-all cursor-pointer space-y-2 flex flex-col justify-between"
								>
									<div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-950 border border-border">
										<Image
											src={
												track.artworkUrl ||
												"https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80"
											}
											alt={track.title}
											width={200}
											height={200}
											className="object-cover w-full h-full group-hover:scale-105 transition-transform"
											unoptimized
										/>
										<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
											<div className="w-10 h-10 rounded-full bg-primary text-zinc-950 flex items-center justify-center shadow-lg">
												<Play className="w-5 h-5 ml-0.5" fill="currentColor" />
											</div>
										</div>
									</div>
									<div className="space-y-1">
										<h3
											className="font-bold text-xs text-foreground truncate group-hover:text-primary transition-colors"
											title={track.title}
										>
											{track.title}
										</h3>
										<p className="text-[10px] text-muted-foreground truncate">
											{track.artist}
										</p>
										<span className="inline-block text-[9px] uppercase font-bold text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
											{track.source}
										</span>
									</div>
								</button>
							))
						) : (
							<div className="col-span-full py-12 text-center text-muted-foreground text-xs">
								No discovery tracks found. Click Shuffle Feed to try again!
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
