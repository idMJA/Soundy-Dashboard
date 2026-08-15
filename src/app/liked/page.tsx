"use client";

import { Clock, Heart, Music, Play, Trash2 } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWebSocket } from "@/components/WebSocketProvider";

interface LikedSong {
	id: string;
	trackId: string;
	title: string;
	author: string;
	uri: string;
	artwork: string;
	length: number;
	isStream: boolean;
	likedAt: string;
}

export default function LikedSongsPage() {
	const { connected, userContext, sendCommand } = useWebSocket();
	const [likedSongs, setLikedSongs] = useState<LikedSong[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const formatDuration = useCallback((ms: number): string => {
		const seconds = Math.floor(ms / 1000);
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
	}, []);

	useEffect(() => {
		const fetchLikedSongs = async () => {
			if (!userContext.userId) return;
			setLoading(true);
			setError(null);
			try {
				const res = await fetch(`/api/music/liked/${userContext.userId}`);
				if (!res.ok) throw new Error("Failed to fetch liked songs");
				const data = await res.json();
				setLikedSongs(data.likedSongs || []);
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "Failed to fetch liked songs",
				);
			} finally {
				setLoading(false);
			}
		};
		fetchLikedSongs();
	}, [userContext.userId]);

	const handlePlayTrack = (song: LikedSong) => {
		if (!connected || !userContext.userId) return;
		const userId = userContext.userId;
		const guildId = userContext.guildId;
		const channelId = userContext.voiceChannelId;
		if (userId && ((guildId && channelId) || !guildId)) {
			const command = {
				type: "play",
				query: song.uri,
				userId,
				...(guildId && { guildId }),
				...(channelId && { voiceChannelId: channelId }),
			};
			sendCommand(command);
		}
	};

	const handleUnlike = async (song: LikedSong) => {
		if (!userContext.userId) return;
		try {
			const res = await fetch("/api/music/like", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					userId: userContext.userId,
					trackId: song.id,
					action: "unlike",
				}),
			});
			if (res.ok) {
				setLikedSongs((prev) => prev.filter((s) => s.trackId !== song.trackId));
			} else {
				setError("Failed to unlike song");
			}
		} catch {
			setError("Error unliking song");
		}
	};

	if (loading) {
		return (
			<div className="space-y-6">
				<Card className="bg-zinc-900/20 border border-zinc-800/50 rounded-lg p-6 shadow-none">
					<CardContent className="flex items-center justify-center py-12">
						<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-6 animate-fade-in">
			<Card className="bg-zinc-900/20 border border-zinc-800/50 rounded-lg p-6 shadow-none relative overflow-hidden">
				<CardContent className="p-0">
					<div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
						<div className="w-32 h-32 bg-zinc-950 rounded-lg flex items-center justify-center border border-zinc-800 flex-shrink-0">
							<Heart className="w-16 h-16 text-rose-500" fill="currentColor" />
						</div>
						<div className="flex-1 flex flex-col justify-between self-stretch text-center sm:text-left py-2">
							<div className="space-y-2">
								<p className="text-xs font-semibold text-rose-500 uppercase tracking-widest">
									Collection
								</p>
								<h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
									Liked Songs
								</h1>
							</div>
							<div className="flex items-center justify-center sm:justify-start space-x-2 text-xs text-muted-foreground mt-4 sm:mt-0 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 w-fit">
								<Music className="w-4 h-4 text-primary" />
								<span className="font-semibold text-foreground">
									{likedSongs.length} songs
								</span>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card className="bg-zinc-900/20 border border-zinc-800/50 rounded-lg shadow-none">
				<CardHeader className="border-b border-zinc-800 py-4 px-6">
					<CardTitle className="text-lg font-bold text-foreground">
						Songs
					</CardTitle>
				</CardHeader>
				<CardContent className="p-6">
					{likedSongs.length === 0 ? (
						<div className="text-center py-16 bg-zinc-950 rounded-lg border border-zinc-800">
							<div className="w-16 h-16 bg-zinc-900 rounded-lg flex items-center justify-center mx-auto mb-4 border border-zinc-800">
								<Music className="w-8 h-8 text-muted-foreground/60" />
							</div>
							<p className="font-semibold text-foreground mb-1">
								No liked songs yet
							</p>
							<p className="text-xs text-muted-foreground">
								Tap the heart icon on any playing track to add it here
							</p>
						</div>
					) : (
						<div className="space-y-2">
							{likedSongs.map((song, index) => (
								<div
									key={song.id}
									className="flex items-center justify-between p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg hover:bg-zinc-900 transition-all duration-150"
								>
									<div className="flex items-center space-x-4 flex-1 min-w-0">
										<div className="w-6 text-sm font-mono text-muted-foreground text-center">
											{index + 1}
										</div>
										<div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center flex-shrink-0 border border-zinc-800 overflow-hidden">
											{song.artwork ? (
												<Image
													src={song.artwork}
													alt={song.title}
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
											<p className="font-bold text-sm text-foreground truncate hover:text-primary transition-colors cursor-pointer">
												{song.title}
											</p>
											<p className="text-xs text-muted-foreground truncate mt-0.5">
												{song.author}
											</p>
										</div>
										<div className="flex items-center space-x-4">
											<div className="flex items-center space-x-1.5 text-xs text-muted-foreground font-mono">
												<Clock className="w-3.5 h-3.5" />
												<span>{formatDuration(song.length)}</span>
											</div>
											<div className="flex items-center space-x-1.5">
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handlePlayTrack(song)}
													className="h-8 w-8 p-0 rounded-lg text-primary hover:bg-zinc-900 transition-all"
													title="Play track"
												>
													<Play className="w-4 h-4" fill="currentColor" />
												</Button>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleUnlike(song)}
													className="h-8 w-8 p-0 rounded-lg text-rose-500 hover:bg-zinc-900 transition-all"
													title="Unlike song"
												>
													<Trash2 className="w-4 h-4" />
												</Button>
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
			{error && (
				<div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-lg">
					{error}
				</div>
			)}
		</div>
	);
}
