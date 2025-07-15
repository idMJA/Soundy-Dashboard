"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Music, Clock, Trash2, Heart } from "lucide-react";
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
					trackId: song.trackId,
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
				<Card>
					<CardHeader>
						<CardTitle>Loading...</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center justify-center py-8">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<div className="flex items-start space-x-4">
						<div className="w-48 h-48 bg-gradient-to-br from-pink-200 to-pink-400 rounded-lg flex items-center justify-center">
							<Heart className="w-16 h-16 text-pink-600" />
						</div>
						<div className="flex-1 space-y-4">
							<div>
								<p className="text-sm text-muted-foreground">Collection</p>
								<h1 className="text-4xl font-bold">Liked Songs</h1>
							</div>
							<div className="flex items-center space-x-4 text-sm text-muted-foreground">
								<div className="flex items-center space-x-1">
									<Music className="w-4 h-4" />
									<span>{likedSongs.length} songs</span>
								</div>
							</div>
						</div>
					</div>
				</CardHeader>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle>Songs</CardTitle>
				</CardHeader>
				<CardContent>
					{likedSongs.length === 0 ? (
						<div className="text-center py-8">
							<Music className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
							<p className="text-muted-foreground">No liked songs</p>
						</div>
					) : (
						<div className="space-y-2">
							{likedSongs.map((song, index) => (
								<div
									key={song.id}
									className="flex items-center justify-between p-3 bg-muted rounded-md"
								>
									<div className="flex items-center space-x-4 flex-1">
										<div className="w-8 text-sm text-muted-foreground">
											{index + 1}
										</div>
										<div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
											{song.artwork ? (
												<Image
													src={song.artwork}
													alt={song.title}
													width={48}
													height={48}
													className="w-full h-full object-cover rounded"
													unoptimized
												/>
											) : (
												<Music className="w-6 h-6 text-muted-foreground" />
											)}
										</div>
										<div className="flex-1 min-w-0 text-left">
											<p className="font-medium truncate">{song.title}</p>
											<p className="text-sm text-muted-foreground truncate">
												{song.author}
											</p>
										</div>
										<div className="flex items-center space-x-2">
											<div className="flex items-center space-x-1 text-sm text-muted-foreground">
												<Clock className="w-3 h-3" />
												<span>{formatDuration(song.length)}</span>
											</div>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handlePlayTrack(song)}
												className="text-green-500 hover:text-green-700"
											>
												<Play className="w-4 h-4" />
											</Button>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleUnlike(song)}
												className="text-red-500 hover:text-red-700"
											>
												<Trash2 className="w-4 h-4" />
											</Button>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
			{error && <div className="text-red-500">{error}</div>}
		</div>
	);
}
