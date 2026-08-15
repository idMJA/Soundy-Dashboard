"use client";

import { Calendar, Clock, Music, Play, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWebSocket } from "@/components/WebSocketProvider";

interface Track {
	id: string; // This is the database ID
	url: string;
	playlistId: string;
	info: string;
}

interface TrackInfo {
	title?: string;
	author?: string;
	artworkUrl?: string;
	artwork?: string;
	length?: number;
}

interface Playlist {
	id: string;
	userId: string;
	name: string;
	guildId: string;
	createdAt: string;
	tracks: Track[];
}

interface PlaylistClientProps {
	playlistId: string;
}

export default function PlaylistClient({ playlistId }: PlaylistClientProps) {
	const { connected, userContext, sendCommand } = useWebSocket();
	const [playlist, setPlaylist] = useState<Playlist | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const formatDuration = useCallback((ms: number): string => {
		const seconds = Math.floor(ms / 1000);
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
	}, []);

	// Fetch playlist details
	useEffect(() => {
		const fetchPlaylist = async () => {
			if (!userContext.userId) return;

			try {
				setIsLoading(true);
				const response = await fetch(
					`/api/playlist/list/${userContext.userId}`,
				);
				if (!response.ok) {
					throw new Error("Failed to fetch playlists");
				}

				const data = await response.json();
				const targetPlaylist = data.playlists.find(
					(p: Playlist) => p.id === playlistId,
				);
				if (targetPlaylist) {
					setPlaylist(targetPlaylist);
				}
			} catch (error) {
				console.error("Error fetching playlist:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchPlaylist();
	}, [playlistId, userContext.userId]);

	const handlePlayTrack = (track: Track) => {
		if (!connected || !userContext.userId) return;

		const guildId = userContext.guildId;
		const channelId = userContext.voiceChannelId;
		const userId = userContext.userId;

		if (userId && ((guildId && channelId) || !guildId)) {
			const command = {
				type: "play",
				query: track.url,
				userId,
				...(guildId && { guildId }),
				...(channelId && { voiceChannelId: channelId }),
			};

			sendCommand(command);
		}
	};

	const handlePlayPlaylist = () => {
		if (!connected || !userContext.userId || !playlist) return;

		const guildId = userContext.guildId;
		const channelId = userContext.voiceChannelId;
		const userId = userContext.userId;

		if (userId && ((guildId && channelId) || !guildId)) {
			const command = {
				type: "load-playlist",
				playlistId: playlist.id,
				userId,
				...(guildId && { guildId }),
				...(channelId && { voiceChannelId: channelId }),
			};
			sendCommand(command);
		}
	};

	const handleRemoveTrack = async (track: Track) => {
		if (!userContext.userId || !playlist) return;

		try {
			const response = await fetch("/api/playlist/remove", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					userId: userContext.userId,
					playlistId: playlist.id,
					trackId: track.id, // Send the database ID instead of trackUri
				}),
			});

			if (response.ok) {
				// Refresh playlist data
				const updatedResponse = await fetch(
					`/api/playlist/list/${userContext.userId}`,
				);
				if (updatedResponse.ok) {
					const data = await updatedResponse.json();
					const updatedPlaylist = data.playlists.find(
						(p: Playlist) => p.id === playlistId,
					);
					if (updatedPlaylist) {
						setPlaylist(updatedPlaylist);
					}
				}
			} else {
				console.error("Failed to remove track");
			}
		} catch (error) {
			console.error("Error removing track:", error);
		}
	};

	const handleAddTrackFromUrl = async (url: string) => {
		if (!userContext.userId || !playlist) return;

		try {
			// First, get track info
			const searchResponse = await fetch(
				`/api/music/search?q=${encodeURIComponent(url)}`,
			);

			if (!searchResponse.ok) {
				console.error("Failed to get track info");
				return;
			}

			const searchData = await searchResponse.json();
			if (!searchData.tracks || searchData.tracks.length === 0) {
				console.error("No track found");
				return;
			}

			const trackInfo = searchData.tracks[0];

			// Add track to playlist
			const response = await fetch("/api/playlist/add", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					userId: userContext.userId,
					playlist: playlist.name,
					tracks: [
						{
							url: url,
							info: {
								identifier: trackInfo.identifier,
								author: trackInfo.author,
								length: trackInfo.duration,
								isStream: false,
								title: trackInfo.title,
								uri: url,
								artworkUrl: trackInfo.artwork,
								isrc: trackInfo.isrc || "",
							},
						},
					],
				}),
			});

			if (response.ok) {
				// Refresh playlist data
				const updatedResponse = await fetch(
					`/api/playlist/list/${userContext.userId}`,
				);
				if (updatedResponse.ok) {
					const data = await updatedResponse.json();
					const updatedPlaylist = data.playlists.find(
						(p: Playlist) => p.id === playlistId,
					);
					if (updatedPlaylist) {
						setPlaylist(updatedPlaylist);
					}
				}
			} else {
				console.error("Failed to add track");
			}
		} catch (error) {
			console.error("Error adding track:", error);
		}
	};

	if (isLoading) {
		return (
			<div className="space-y-6">
				<Card className="bg-zinc-900/20 backdrop-blur-md border border-white/5 shadow-xl rounded-3xl p-6">
					<CardContent className="flex items-center justify-center py-12">
						<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (!playlist) {
		return (
			<div className="space-y-6">
				<Card className="bg-zinc-900/20 backdrop-blur-md border border-white/5 shadow-xl rounded-3xl p-6">
					<CardHeader>
						<CardTitle className="text-lg font-bold text-foreground">
							Playlist Not Found
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">
							The requested playlist could not be found.
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-6 animate-fade-in">
			{/* Playlist Header */}
			<Card className="bg-zinc-900/20 border border-zinc-800/50 rounded-lg p-6 shadow-none relative overflow-hidden">
				<CardContent className="p-0">
					<div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
						<div className="w-32 h-32 bg-zinc-950 rounded-lg flex items-center justify-center border border-zinc-800 flex-shrink-0">
							<Music className="w-16 h-16 text-primary" />
						</div>
						<div className="flex-1 flex flex-col justify-between self-stretch text-center sm:text-left py-2">
							<div className="space-y-2">
								<p className="text-xs font-semibold text-primary uppercase tracking-widest">
									Playlist
								</p>
								<h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
									{playlist.name}
								</h1>
							</div>
							<div className="flex flex-col sm:flex-row sm:items-center justify-center sm:justify-start gap-4 mt-6">
								<div className="flex items-center justify-center sm:justify-start space-x-4 text-xs text-muted-foreground font-mono bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 w-fit self-center sm:self-auto">
									<div className="flex items-center space-x-1">
										<Music className="w-3.5 h-3.5" />
										<span>{playlist.tracks.length} tracks</span>
									</div>
									<div className="w-1 h-1 bg-zinc-800 rounded-full" />
									<div className="flex items-center space-x-1">
										<Calendar className="w-3.5 h-3.5" />
										<span>
											{new Date(playlist.createdAt).toLocaleDateString()}
										</span>
									</div>
								</div>
								<div className="flex items-center justify-center space-x-2">
									<Button
										onClick={handlePlayPlaylist}
										disabled={!connected || playlist.tracks.length === 0}
										className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg px-4 h-9 transition-all"
									>
										<Play className="w-4 h-4 mr-2" fill="currentColor" />
										Play Playlist
									</Button>
									<Button
										variant="outline"
										className="border-zinc-800 text-foreground hover:bg-zinc-900 transition-all rounded-lg px-4 h-9"
										onClick={() => {
											const url = prompt(
												"Enter track URL (Spotify, YouTube, etc.):",
											);
											if (url) {
												handleAddTrackFromUrl(url);
											}
										}}
									>
										<Plus className="w-4 h-4 mr-1.5" />
										Add Track
									</Button>
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Track List */}
			<Card className="bg-zinc-900/20 border border-zinc-800/50 rounded-lg shadow-none">
				<CardHeader className="border-b border-zinc-800 py-4 px-6">
					<CardTitle className="text-lg font-bold text-foreground">
						Tracks
					</CardTitle>
				</CardHeader>
				<CardContent className="p-6">
					{playlist.tracks.length === 0 ? (
						<div className="text-center py-16 bg-zinc-950 rounded-lg border border-zinc-800">
							<div className="w-16 h-16 bg-zinc-900 rounded-lg flex items-center justify-center mx-auto mb-4 border border-zinc-800">
								<Music className="w-8 h-8 text-muted-foreground/60" />
							</div>
							<p className="font-semibold text-foreground mb-1">
								No tracks yet
							</p>
							<p className="text-xs text-muted-foreground">
								Click &quot;Add Track&quot; above to load search URLs into this
								playlist
							</p>
						</div>
					) : (
						<div className="space-y-2">
							{playlist.tracks.map((track, index) => {
								let info: TrackInfo = {};
								try {
									info = track.info ? JSON.parse(track.info) : {};
								} catch {
									info = {};
								}
								const title = info.title || "Unknown Track";
								const artist = info.author || "Unknown Artist";
								const artwork = info.artworkUrl || info.artwork || null;
								const duration =
									typeof info.length === "number"
										? formatDuration(info.length)
										: undefined;
								return (
									<div
										key={track.id}
										className="flex items-center justify-between p-2.5 bg-zinc-900/20 border border-zinc-800/50 rounded-lg hover:bg-zinc-900/40 transition-all duration-150"
									>
										<div className="flex items-center space-x-4 flex-1 min-w-0">
											<div className="w-6 text-sm font-mono text-muted-foreground text-center">
												{index + 1}
											</div>
											<div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center flex-shrink-0 border border-zinc-800 overflow-hidden">
												{artwork ? (
													<Image
														src={artwork}
														alt={title}
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
													{title}
												</p>
												<p className="text-xs text-muted-foreground truncate mt-0.5">
													{artist}
												</p>
											</div>
											<div className="flex items-center space-x-4">
												{duration && (
													<div className="flex items-center space-x-1.5 text-xs text-muted-foreground font-mono">
														<Clock className="w-3.5 h-3.5" />
														<span>{duration}</span>
													</div>
												)}
												<div className="flex items-center space-x-1.5">
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handlePlayTrack(track)}
														className="h-8 w-8 p-0 rounded-lg text-primary hover:bg-zinc-900 transition-all"
														title="Play track"
													>
														<Play className="w-4 h-4" fill="currentColor" />
													</Button>
													<Button
														variant="ghost"
														size="sm"
														onClick={(e) => {
															e.stopPropagation();
															handleRemoveTrack(track);
														}}
														className="h-8 w-8 p-0 rounded-lg text-rose-500 hover:bg-zinc-900 transition-all"
														title="Remove from playlist"
													>
														<Trash2 className="w-4 h-4" />
													</Button>
												</div>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
