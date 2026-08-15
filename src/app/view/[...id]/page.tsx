"use client";

import {
	ArrowLeft,
	Clock,
	Download,
	ExternalLink,
	Heart,
	Music,
	Pause,
	Play,
	Plus,
	Share2,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useWebSocket } from "@/components/WebSocketProvider";
import { PLATFORMS } from "@/lib/media-routes";
import { cn } from "@/lib/utils";

interface TrackDetails {
	title?: string;
	author?: string;
	duration?: number;
	uri?: string;
	artwork?: string;
	isStream?: boolean;
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

	const idParts = useMemo(() => {
		return Array.isArray(params.id) ? params.id : [params.id as string];
	}, [params.id]);

	// Fetch track details
	useEffect(() => {
		const fetchTrackDetails = async () => {
			if (!idParts || idParts.length === 0 || !idParts[0]) return;

			setLoading(true);
			setError(null);

			try {
				let searchQuery = "";
				const firstPart = idParts[0];

				const platform = PLATFORMS.find((p) => p.prefix === firstPart);
				if (platform) {
					searchQuery = platform.toFullUrl(idParts) || "";
				}

				if (!searchQuery) {
					searchQuery = decodeURIComponent(idParts.join("/"));
				}

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
	}, [idParts]);

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
		<div className="container mx-auto p-4 space-y-6 animate-fade-in">
			{/* Back Button */}
			<Button
				variant="outline"
				onClick={() => router.back()}
				className="border-zinc-800 text-muted-foreground hover:text-foreground hover:bg-zinc-900 rounded-lg px-3 h-9 font-semibold transition-all"
			>
				<ArrowLeft className="w-4 h-4 mr-2" />
				Back
			</Button>

			{/* Main Content */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Artwork */}
				<div className="lg:col-span-1">
					<div className="aspect-square rounded-lg overflow-hidden bg-zinc-950 border border-zinc-800 flex items-center justify-center relative group">
						{track.artwork ? (
							<Image
								src={track.artwork}
								alt={track.title || track.name || "Track artwork"}
								width={400}
								height={400}
								className="object-cover w-full h-full"
								priority
								loading="eager"
							/>
						) : (
							<Music className="w-24 h-24 text-primary" />
						)}
					</div>
				</div>

				{/* Track Information */}
				<div className="lg:col-span-2 space-y-6 flex flex-col justify-between py-2">
					<div className="space-y-3">
						<h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
							{track.title || track.name || "Unknown Title"}
						</h1>
						<p className="text-xl font-medium text-primary">
							{track.author || track.artist || "Unknown Artist"}
						</p>
						{track.album && (
							<Badge
								variant="secondary"
								className="bg-zinc-950 border border-zinc-800 text-foreground rounded-lg px-3 py-1 font-normal text-xs"
							>
								Album: {track.album}
							</Badge>
						)}
					</div>

					{/* Action Buttons */}
					<div className="flex items-center space-x-3 flex-wrap gap-y-3">
						<Button
							size="lg"
							onClick={handlePlayPause}
							disabled={!connected}
							className="bg-primary hover:bg-primary/90 text-zinc-950 font-bold rounded-lg transition-all px-6 min-w-[130px]"
						>
							{isPlaying ? (
								<Pause className="w-4 h-4 mr-2" fill="currentColor" />
							) : (
								<Play className="w-4 h-4 mr-2" fill="currentColor" />
							)}
							{isPlaying ? "Pause" : "Play"}
						</Button>

						<Button
							variant="outline"
							onClick={handleAddToPlaylist}
							disabled={!connected}
							className="border-zinc-800 text-foreground hover:bg-zinc-900 transition-all rounded-lg px-4"
						>
							<Plus className="w-4 h-4 mr-2" />
							Add to Queue
						</Button>

						<Button
							variant="outline"
							onClick={handleToggleLike}
							disabled={!userContext.userId}
							className={cn(
								"border-zinc-800 hover:bg-zinc-900 rounded-lg transition-all px-4",
								isLiked
									? "text-rose-500 border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 hover:text-rose-400"
									: "text-foreground",
							)}
						>
							<Heart
								className={cn("w-4 h-4 mr-2", isLiked && "fill-current")}
							/>
							{isLiked ? "Liked" : "Like"}
						</Button>

						<Button
							variant="outline"
							className="border-zinc-800 text-foreground hover:bg-zinc-900 transition-all rounded-lg px-4"
						>
							<Share2 className="w-4 h-4 mr-2" />
							Share
						</Button>

						{(track.uri || track.url) && (
							<Button
								variant="outline"
								asChild
								className="border-zinc-800 text-foreground hover:bg-zinc-900 transition-all rounded-lg px-4"
							>
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
					<Card className="bg-zinc-900/20 border border-zinc-800/50 rounded-lg p-6 shadow-none">
						<CardHeader className="p-0 pb-4 border-b border-zinc-800 mb-4">
							<CardTitle className="text-lg font-bold text-foreground">
								Track Details
							</CardTitle>
						</CardHeader>
						<CardContent className="p-0 space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{track.duration && (
									<div className="flex items-center text-sm">
										<Clock className="w-4 h-4 mr-2.5 text-muted-foreground" />
										<span className="text-muted-foreground mr-1">
											Duration:
										</span>
										<span className="font-semibold text-foreground">
											{formatDuration(track.duration)}
										</span>
									</div>
								)}

								{track.source && (
									<div className="flex items-center text-sm">
										<Download className="w-4 h-4 mr-2.5 text-muted-foreground" />
										<span className="text-muted-foreground mr-1">Source:</span>
										<span className="font-semibold text-foreground capitalize">
											{track.source}
										</span>
									</div>
								)}

								{track.isStream !== undefined && (
									<div className="flex items-center">
										<Badge
											variant={track.isStream ? "default" : "secondary"}
											className="rounded-lg px-2.5 py-0.5 text-xs"
										>
											{track.isStream ? "Live Stream" : "Track"}
										</Badge>
									</div>
								)}

								{track.views && (
									<div className="text-sm flex items-center">
										<span className="text-muted-foreground mr-1">Views:</span>
										<span className="font-semibold text-foreground">
											{track.views.toLocaleString()}
										</span>
									</div>
								)}

								{track.likes && (
									<div className="text-sm flex items-center">
										<span className="text-muted-foreground mr-1">Likes:</span>
										<span className="font-semibold text-foreground">
											{track.likes.toLocaleString()}
										</span>
									</div>
								)}

								{track.uploadDate && (
									<div className="text-sm flex items-center">
										<span className="text-muted-foreground mr-1">
											Upload Date:
										</span>
										<span className="font-semibold text-foreground">
											{new Date(track.uploadDate).toLocaleDateString()}
										</span>
									</div>
								)}
							</div>

							{track.description && (
								<>
									<Separator className="bg-zinc-800" />
									<div className="space-y-2">
										<h4 className="font-bold text-sm text-foreground">
											Description
										</h4>
										<p className="text-muted-foreground text-xs leading-relaxed max-h-36 overflow-y-auto custom-scrollbar font-light">
											{track.description}
										</p>
									</div>
								</>
							)}

							{track.tags && track.tags.length > 0 && (
								<>
									<Separator className="bg-zinc-800" />
									<div className="space-y-2">
										<h4 className="font-bold text-sm text-foreground">Tags</h4>
										<div className="flex flex-wrap gap-1.5">
											{track.tags.map((tag) => (
												<Badge
													key={tag}
													variant="outline"
													className="border-zinc-800 text-muted-foreground rounded-lg px-2.5 py-0.5 text-[10px] uppercase font-mono font-bold tracking-wider"
												>
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
