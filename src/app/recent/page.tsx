"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWebSocket } from "@/components/WebSocketProvider";
import { Play, Music, Clock, History } from "lucide-react";

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
		<div className="space-y-6">
			{/* Header Section */}
			<Card>
				<CardHeader>
					<div className="flex items-start space-x-4">
						<div className="w-48 h-48 bg-gradient-to-br from-blue-200 to-blue-400 rounded-lg flex items-center justify-center">
							<History className="w-16 h-16 text-blue-600" />
						</div>
						<div className="flex-1 space-y-4">
							<div>
								<p className="text-sm text-muted-foreground">Collection</p>
								<h1 className="text-4xl font-bold">Recently Played</h1>
							</div>
							<div className="flex items-center space-x-4 text-sm text-muted-foreground">
								<div className="flex items-center space-x-1">
									<Music className="w-4 h-4" />
									<span>{tracks.length} tracks</span>
								</div>
							</div>
						</div>
					</div>
				</CardHeader>
			</Card>

			{/* Track List Section */}
			<Card>
				<CardHeader>
					<CardTitle>Tracks</CardTitle>
				</CardHeader>
				<CardContent>
					{loading ? (
						<div className="space-y-2">
							{Array.from({ length: 8 }).map(() => (
								<div
									key={crypto.randomUUID()}
									className="flex items-center justify-between p-3 bg-muted rounded-md"
								>
									<div className="flex items-center space-x-4 flex-1">
										<Skeleton className="w-8 h-4" />
										<Skeleton className="w-12 h-12 rounded" />
										<div className="flex-1 min-w-0">
											<Skeleton className="h-4 w-32" />
											<Skeleton className="h-3 w-24" />
										</div>
										<Skeleton className="h-4 w-16" />
									</div>
								</div>
							))}
						</div>
					) : error ? (
						<div className="text-center text-destructive py-8">{error}</div>
					) : tracks.length === 0 ? (
						<div className="text-center py-8">
							<Music className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
							<p className="text-muted-foreground">No recently played tracks</p>
						</div>
					) : (
						<div className="space-y-2">
							{tracks.map((track, index) => (
								<div
									key={track.id + track.playedAt}
									className="flex items-center justify-between p-3 bg-muted rounded-md"
								>
									<div className="flex items-center space-x-4 flex-1">
										<div className="w-8 text-sm text-muted-foreground">
											{index + 1}
										</div>
										<div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
											{track.artwork ? (
												<Image
													src={track.artwork}
													alt={track.title}
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
											<p className="font-medium truncate">{track.title}</p>
											<p className="text-sm text-muted-foreground truncate">
												{track.author}
											</p>
										</div>
										<div className="flex items-center space-x-2">
											<div className="flex items-center space-x-1 text-sm text-muted-foreground">
												<Clock className="w-3 h-3" />
												<span>{formatDuration(track.length)}</span>
											</div>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handlePlayTrack(track)}
												className="text-blue-500 hover:text-blue-700"
											>
												<Play className="w-4 h-4" />
											</Button>
										</div>
									</div>
									<div className="flex items-center space-x-2">
										<span className="text-xs text-muted-foreground">
											{new Date(track.playedAt).toLocaleString()}
										</span>
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
