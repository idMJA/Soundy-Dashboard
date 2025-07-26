"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useWebSocket } from "@/components/WebSocketProvider";
import {
	ArrowLeft,
	Play,
	Pause,
	Heart,
	Share2,
	Clock,
	Music,
	ExternalLink,
	Download,
	Plus,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface TrackDetails {
	title?: string;
	author?: string;
	duration?: number;
	uri?: string;
	artwork?: string;
	isStream?: boolean;
	// Additional properties that might be returned
	id?: string;
	name?: string;
	artist?: string;
	album?: string;
	url?: string;
	source?: string;
	description?: string;
	views?: number;
	likes?: number;
	uploadDate?: string;
	tags?: string[];
}

export default function TrackViewPage() {
	const params = useParams();
	const router = useRouter();
	const { connected, playerState, sendCommand, userContext } = useWebSocket();

	const [track, setTrack] = useState<TrackDetails | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isLiked, setIsLiked] = useState(false);

	const trackId = params.id as string;

	// Fetch track details
	useEffect(() => {
		const fetchTrackDetails = async () => {
			if (!trackId) return;

			setLoading(true);
			setError(null);

			try {
				// Try to search for the track using its ID or URL
				const searchQuery = decodeURIComponent(trackId);
				const res = await fetch(
					`/api/music/search?q=${encodeURIComponent(searchQuery)}`,
				);

				if (!res.ok) {
					throw new Error("Failed to fetch track details");
				}

				const data = await res.json();

				// Find the first result or the one that matches our ID
				if (data.tracks && data.tracks.length > 0) {
					setTrack(data.tracks[0]);
				} else {
					throw new Error("Track not found");
				}
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to load track");
			} finally {
				setLoading(false);
			}
		};

		fetchTrackDetails();
	}, [trackId]);

	// Format duration
	const formatDuration = (milliseconds: number) => {
		const seconds = Math.floor(milliseconds / 1000);
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
	};

	// Handle play/pause
	const handlePlayPause = () => {
		if (!connected || !track || !userContext.userId) return;

		const isCurrentTrack = playerState.track?.uri === track.uri;
		if (isCurrentTrack && playerState.playing) {
			sendCommand({ type: "pause", guildId: userContext.guildId });
		} else if (isCurrentTrack && !playerState.playing) {
			sendCommand({ type: "resume", guildId: userContext.guildId });
		} else {
			// Play new track - following the same pattern as search page
			const guildId = userContext.guildId;
			const channelId = userContext.voiceChannelId;
			const userId = userContext.userId;
			const query = track.uri || track.url || `${track.title} ${track.author}`;

			if (userId && ((guildId && channelId) || !guildId)) {
				const command = {
					type: "play",
					query,
					userId,
					...(guildId && { guildId }),
					...(channelId && { voiceChannelId: channelId }),
				};
				sendCommand(command);
			} else {
				console.log(
					"Missing required fields for play. Need userId and either (guildId+channelId) or just userId",
				);
			}
		}
	};

	// Add to playlist
	const handleAddToPlaylist = () => {
		if (!connected || !track || !userContext.userId) return;

		const guildId = userContext.guildId;
		const channelId = userContext.voiceChannelId;
		const userId = userContext.userId;
		const query = track.uri || track.url || `${track.title} ${track.author}`;

		if (userId && ((guildId && channelId) || !guildId)) {
			const command = {
				type: "add",
				query,
				userId,
				...(guildId && { guildId }),
				...(channelId && { voiceChannelId: channelId }),
			};
			sendCommand(command);
		} else {
			console.log(
				"Missing required fields for add. Need userId and either (guildId+channelId) or just userId",
			);
		}
	};

	// Toggle like status
	const handleToggleLike = async () => {
		if (!userContext.userId || !track) return;

		try {
			const payload = {
				userId: userContext.userId,
				uri: track.uri || track.url,
				action: isLiked ? "unlike" : "like",
			};

			const res = await fetch("/api/music/like", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (res.ok) {
				setIsLiked(!isLiked);
			}
		} catch (err) {
			console.error("Error toggling like:", err);
		}
	};

	if (loading) {
		return (
			<div className="container mx-auto p-6 space-y-6">
				<Button variant="ghost" onClick={() => router.back()}>
					<ArrowLeft className="w-4 h-4 mr-2" />
					Back
				</Button>
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<div className="lg:col-span-1">
						<div className="aspect-square bg-muted rounded-lg animate-pulse" />
					</div>
					<div className="lg:col-span-2 space-y-4">
						<div className="h-8 bg-muted rounded animate-pulse" />
						<div className="h-6 bg-muted rounded animate-pulse w-3/4" />
						<div className="h-4 bg-muted rounded animate-pulse w-1/2" />
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container mx-auto p-6 space-y-6">
				<Button variant="ghost" onClick={() => router.back()}>
					<ArrowLeft className="w-4 h-4 mr-2" />
					Back
				</Button>
				<Card>
					<CardContent className="p-6 text-center">
						<div className="text-destructive mb-2">Error</div>
						<p className="text-muted-foreground">{error}</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (!track) {
		return (
			<div className="container mx-auto p-6 space-y-6">
				<Button variant="ghost" onClick={() => router.back()}>
					<ArrowLeft className="w-4 h-4 mr-2" />
					Back
				</Button>
				<Card>
					<CardContent className="p-6 text-center">
						<p className="text-muted-foreground">Track not found</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	const isCurrentTrack = playerState.track?.uri === track.uri;
	const isPlaying = isCurrentTrack && playerState.playing;

	return (
		<div className="container mx-auto p-6 space-y-6">
			{/* Back Button */}
			<Button variant="ghost" onClick={() => router.back()}>
				<ArrowLeft className="w-4 h-4 mr-2" />
				Back
			</Button>

			{/* Main Content */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Artwork */}
				<div className="lg:col-span-1">
					<div className="aspect-square rounded-lg overflow-hidden bg-muted flex items-center justify-center">
						{track.artwork ? (
							<Image
								src={track.artwork}
								alt={track.title || track.name || "Track artwork"}
								width={400}
								height={400}
								className="object-cover w-full h-full"
								priority
							/>
						) : (
							<Music className="w-24 h-24 text-muted-foreground" />
						)}
					</div>
				</div>

				{/* Track Information */}
				<div className="lg:col-span-2 space-y-6">
					{/* Title and Artist */}
					<div>
						<h1 className="text-4xl font-bold mb-2">
							{track.title || track.name || "Unknown Title"}
						</h1>
						<p className="text-xl text-muted-foreground mb-4">
							{track.author || track.artist || "Unknown Artist"}
						</p>
						{track.album && (
							<p className="text-lg text-muted-foreground">
								Album: {track.album}
							</p>
						)}
					</div>

					{/* Action Buttons */}
					<div className="flex items-center space-x-4 flex-wrap">
						<Button
							size="lg"
							onClick={handlePlayPause}
							disabled={!connected}
							className="min-w-[120px]"
						>
							{isPlaying ? (
								<Pause className="w-5 h-5 mr-2" />
							) : (
								<Play className="w-5 h-5 mr-2" />
							)}
							{isPlaying ? "Pause" : "Play"}
						</Button>

						<Button
							variant="outline"
							onClick={handleAddToPlaylist}
							disabled={!connected}
						>
							<Plus className="w-4 h-4 mr-2" />
							Add to Queue
						</Button>

						<Button
							variant="outline"
							onClick={handleToggleLike}
							disabled={!userContext.userId}
							className={cn(isLiked && "text-red-500")}
						>
							<Heart
								className={cn("w-4 h-4 mr-2", isLiked && "fill-current")}
							/>
							{isLiked ? "Liked" : "Like"}
						</Button>

						<Button variant="outline">
							<Share2 className="w-4 h-4 mr-2" />
							Share
						</Button>

						{(track.uri || track.url) && (
							<Button variant="outline" asChild>
								<a
									href={track.uri || track.url}
									target="_blank"
									rel="noopener noreferrer"
								>
									<ExternalLink className="w-4 h-4 mr-2" />
									Open Source
								</a>
							</Button>
						)}
					</div>

					{/* Track Details */}
					<Card>
						<CardHeader>
							<CardTitle>Track Details</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{track.duration && (
									<div className="flex items-center">
										<Clock className="w-4 h-4 mr-2 text-muted-foreground" />
										<span>Duration: {formatDuration(track.duration)}</span>
									</div>
								)}

								{track.source && (
									<div className="flex items-center">
										<Download className="w-4 h-4 mr-2 text-muted-foreground" />
										<span>Source: {track.source}</span>
									</div>
								)}

								{track.isStream !== undefined && (
									<div className="flex items-center">
										<Badge variant={track.isStream ? "default" : "secondary"}>
											{track.isStream ? "Live Stream" : "Track"}
										</Badge>
									</div>
								)}

								{track.views && (
									<div>
										<span className="text-muted-foreground">Views: </span>
										<span>{track.views.toLocaleString()}</span>
									</div>
								)}

								{track.likes && (
									<div>
										<span className="text-muted-foreground">Likes: </span>
										<span>{track.likes.toLocaleString()}</span>
									</div>
								)}

								{track.uploadDate && (
									<div>
										<span className="text-muted-foreground">Upload Date: </span>
										<span>
											{new Date(track.uploadDate).toLocaleDateString()}
										</span>
									</div>
								)}
							</div>

							{track.description && (
								<>
									<Separator />
									<div>
										<h4 className="font-semibold mb-2">Description</h4>
										<p className="text-muted-foreground text-sm leading-relaxed">
											{track.description}
										</p>
									</div>
								</>
							)}

							{track.tags && track.tags.length > 0 && (
								<>
									<Separator />
									<div>
										<h4 className="font-semibold mb-2">Tags</h4>
										<div className="flex flex-wrap gap-2">
											{track.tags.map((tag) => (
												<Badge key={tag} variant="outline">
													{tag}
												</Badge>
											))}
										</div>
									</div>
								</>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
