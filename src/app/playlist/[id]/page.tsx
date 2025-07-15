"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Music, Clock, Calendar, Trash2, Plus } from "lucide-react";
import { useWebSocket } from "@/components/WebSocketProvider";

interface PlaylistPageProps {
	params: {
		id: string;
	};
}

interface Track {
	id: string;
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

export default function PlaylistPage({ params }: PlaylistPageProps) {
	const playlistId = params.id;
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

		// Play the first track, then queue the rest
		if (playlist.tracks.length > 0) {
			handlePlayTrack(playlist.tracks[0]);

			// Add remaining tracks to queue
			playlist.tracks.slice(1).forEach((track) => {
				const guildId = userContext.guildId;
				const channelId = userContext.voiceChannelId;
				const userId = userContext.userId;

				if (userId && ((guildId && channelId) || !guildId)) {
					const command = {
						type: "add",
						query: track.url,
						userId,
						...(guildId && { guildId }),
						...(channelId && { voiceChannelId: channelId }),
					};

					sendCommand(command);
				}
			});
		}
	};

	const handleRemoveTrack = async (track: Track) => {
		if (!userContext.userId || !playlist) return;

		try {
			const response = await fetch("/api/playlist", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					userId: userContext.userId,
					playlist: playlist.name,
					trackUri: track.url,
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
			const response = await fetch("/api/playlist", {
				method: "PUT",
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

	if (!playlist) {
		return (
			<div className="space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>Playlist Not Found</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground">
							The requested playlist could not be found.
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Playlist Header */}
			<Card>
				<CardHeader>
					<div className="flex items-start space-x-4">
						<div className="w-48 h-48 bg-gradient-to-br from-primary/20 to-primary/40 rounded-lg flex items-center justify-center">
							<Music className="w-16 h-16 text-primary" />
						</div>
						<div className="flex-1 space-y-4">
							<div>
								<p className="text-sm text-muted-foreground">Playlist</p>
								<h1 className="text-4xl font-bold">{playlist.name}</h1>
							</div>
							<div className="flex items-center space-x-4 text-sm text-muted-foreground">
								<div className="flex items-center space-x-1">
									<Music className="w-4 h-4" />
									<span>{playlist.tracks.length} tracks</span>
								</div>
								<div className="flex items-center space-x-1">
									<Calendar className="w-4 h-4" />
									<span>
										Created {new Date(playlist.createdAt).toLocaleDateString()}
									</span>
								</div>
							</div>
							<div className="flex items-center space-x-2">
								<Button
									onClick={handlePlayPlaylist}
									disabled={!connected || playlist.tracks.length === 0}
									className="rounded-full"
								>
									<Play className="w-4 h-4 mr-2" />
									Play
								</Button>
								<Button
									variant="outline"
									onClick={() => {
										const url = prompt(
											"Enter track URL (Spotify, YouTube, etc.):",
										);
										if (url) {
											handleAddTrackFromUrl(url);
										}
									}}
								>
									<Plus className="w-4 h-4 mr-2" />
									Add Track
								</Button>
							</div>
						</div>
					</div>
				</CardHeader>
			</Card>

			{/* Track List */}
			<Card>
				<CardHeader>
					<CardTitle>Tracks</CardTitle>
				</CardHeader>
				<CardContent>
					{playlist.tracks.length === 0 ? (
						<div className="text-center py-8">
							<Music className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
							<p className="text-muted-foreground">
								No tracks in this playlist
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
										className="flex items-center justify-between p-3 bg-muted rounded-md"
									>
										<div className="flex items-center space-x-4 flex-1">
											<div className="w-8 text-sm text-muted-foreground">
												{index + 1}
											</div>
											<div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
												{artwork ? (
													<Image
														src={artwork}
														alt={title}
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
												<p className="font-medium truncate">{title}</p>
												<p className="text-sm text-muted-foreground truncate">
													{artist}
												</p>
											</div>
											<div className="flex items-center space-x-2">
												{duration && (
													<div className="flex items-center space-x-1 text-sm text-muted-foreground">
														<Clock className="w-3 h-3" />
														<span>{duration}</span>
													</div>
												)}
												<Button
													variant="ghost"
													size="sm"
													onClick={(e) => {
														e.stopPropagation();
														handleRemoveTrack(track);
													}}
													className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
												>
													<Trash2 className="w-4 h-4" />
												</Button>
												<div className="opacity-0 group-hover:opacity-100 transition-opacity">
													<Play className="w-4 h-4" />
												</div>
											</div>
										</div>
										<div className="flex items-center space-x-2">
											<Button
												variant="outline"
												size="icon"
												onClick={() => handleRemoveTrack(track)}
												className="rounded-full"
											>
												<Trash2 className="w-4 h-4" />
											</Button>
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
