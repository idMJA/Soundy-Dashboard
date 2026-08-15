"use client";

import { Clock, History, Music, Play } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWebSocket } from "@/components/WebSocketProvider";

interface RecentTrack {
	id: string;
	title: string;
	author: string;
	uri: string;
	artwork: string;
	length: number;
	isStream: boolean;
	playedAt: string;
	guildId?: string;
}

export default function RecentPage() {
	const { connected, userContext, sendCommand } = useWebSocket();
	const [tracks, setTracks] = useState<RecentTrack[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const formatDuration = useCallback((ms: number): string => {
		const seconds = Math.floor(ms / 1000);
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
	}, []);

	useEffect(() => {
		const fetchRecent = async () => {
			if (!userContext.userId) return;
			setLoading(true);
			setError(null);
			try {
				const res = await fetch(`/api/music/recent/${userContext.userId}`);
				if (!res.ok) {
					const data = await res.json();
					setError(data.error || "Failed to fetch recent tracks");
					setTracks([]);
				} else {
					const data = await res.json();
					setTracks(data.tracks || []);
				}
			} catch {
				setError("Failed to fetch recent tracks");
				setTracks([]);
			} finally {
				setLoading(false);
			}
		};
		fetchRecent();
	}, [userContext.userId]);

	const handlePlayTrack = (track: RecentTrack) => {
		if (!connected || !userContext.userId) return;
		const userId = userContext.userId;
		const guildId = userContext.guildId;
		const channelId = userContext.voiceChannelId;
		if (userId && ((guildId && channelId) || !guildId)) {
			const command = {
				type: "play",
				query: track.uri,
				userId,
				...(guildId && { guildId }),
				...(channelId && { voiceChannelId: channelId }),
			};
			sendCommand(command);
		}
	};

	return (
		<div className="space-y-6 animate-fade-in">
			{/* Header Section */}
			<Card className="bg-zinc-900/20 border border-zinc-800/50 rounded-lg p-6 shadow-none relative overflow-hidden">
				<CardContent className="p-0">
					<div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
						<div className="w-32 h-32 bg-zinc-950 rounded-lg flex items-center justify-center border border-zinc-800 flex-shrink-0">
							<History className="w-16 h-16 text-primary" />
						</div>
						<div className="flex-1 flex flex-col justify-between self-stretch text-center sm:text-left py-2">
							<div className="space-y-2">
								<p className="text-xs font-semibold text-primary uppercase tracking-widest">
									Collection
								</p>
								<h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
									Recently Played
								</h1>
							</div>
							<div className="flex items-center justify-center sm:justify-start space-x-2 text-xs text-muted-foreground mt-4 sm:mt-0 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 w-fit">
								<Music className="w-4 h-4 text-primary" />
								<span className="font-semibold text-foreground">
									{tracks.length} tracks
								</span>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Track List Section */}
			<Card className="bg-zinc-900/20 border border-zinc-800/50 rounded-lg shadow-none">
				<CardHeader className="border-b border-zinc-800 py-4 px-6">
					<CardTitle className="text-lg font-bold text-foreground">
						Tracks
					</CardTitle>
				</CardHeader>
				<CardContent className="p-6">
					{loading ? (
						<div className="space-y-2">
							{Array.from({ length: 8 }, (_, idx) => `skele-recent-${idx}`).map(
								(skelId) => (
									<div
										key={skelId}
										className="flex items-center justify-between p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg"
									>
										<div className="flex items-center space-x-4 flex-1">
											<Skeleton className="w-6 h-4" />
											<Skeleton className="w-10 h-10 rounded-lg" />
											<div className="flex-1 min-w-0">
												<Skeleton className="h-4 w-32 mb-1" />
												<Skeleton className="h-3 w-24" />
											</div>
											<Skeleton className="h-4 w-16" />
										</div>
									</div>
								),
							)}
						</div>
					) : error ? (
						<div className="text-center text-destructive py-8">{error}</div>
					) : tracks.length === 0 ? (
						<div className="text-center py-16 bg-zinc-950 rounded-lg border border-zinc-800">
							<div className="w-16 h-16 bg-zinc-900 rounded-lg flex items-center justify-center mx-auto mb-4 border border-zinc-800">
								<Music className="w-8 h-8 text-muted-foreground/60" />
							</div>
							<p className="font-semibold text-foreground mb-1">
								No recently played tracks
							</p>
							<p className="text-xs text-muted-foreground">
								Play some music on Discord or search to populate history.
							</p>
						</div>
					) : (
						<div className="space-y-2">
							{tracks.map((track, index) => (
								<div
									key={track.id + track.playedAt}
									className="flex items-center justify-between p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg hover:bg-zinc-900 transition-all duration-150"
								>
									<div className="flex items-center space-x-4 flex-1 min-w-0">
										<div className="w-6 text-sm font-mono text-muted-foreground text-center">
											{index + 1}
										</div>
										<div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center flex-shrink-0 border border-zinc-800 overflow-hidden">
											{track.artwork ? (
												<Image
													src={track.artwork}
													alt={track.title}
													width={48}
													height={48}
													className="w-full h-full object-cover"
													unoptimized
												/>
											) : (
												<Music className="w-5 h-5 text-primary" />
											)}
										</div>
										<div className="flex-1 min-w-0 text-left">
											<p className="font-bold text-sm text-foreground truncate">
												{track.title}
											</p>
											<p className="text-xs text-muted-foreground truncate mt-0.5">
												{track.author}
											</p>
										</div>
										<div className="flex items-center space-x-4">
											<span className="hidden md:inline text-[10px] text-muted-foreground font-mono">
												{new Date(track.playedAt).toLocaleString()}
											</span>
											<div className="flex items-center space-x-1.5 text-xs text-muted-foreground font-mono">
												<Clock className="w-3.5 h-3.5" />
												<span>{formatDuration(track.length)}</span>
											</div>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handlePlayTrack(track)}
												className="h-8 w-8 p-0 rounded-lg text-primary hover:bg-zinc-900 transition-all"
												title="Play track"
											>
												<Play className="w-4 h-4" fill="currentColor" />
											</Button>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
