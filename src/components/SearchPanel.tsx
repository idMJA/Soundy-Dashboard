"use client";

import { useState, useCallback, useId } from "react";
import { useWebSocket } from "./WebSocketProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

interface Track {
	title: string;
	author: string;
	duration: number;
	uri: string;
	artwork: string;
	isStream: boolean;
}

interface SearchResponse {
	tracks: Track[];
}

interface WebSocketCommand {
	type: string;
	[key: string]: unknown;
}

const PlayIcon = ({ className }: { className?: string }) => (
	<svg
		className={className || "w-4 h-4"}
		fill="currentColor"
		viewBox="0 0 24 24"
		aria-label="Play"
	>
		<title>Play</title>
		<path d="m7.25 6.693 8.5 4.904a.5.5 0 0 1 0 .866l-8.5 4.904A.5.5 0 0 1 6.5 16.9V7.1a.5.5 0 0 1 .75-.433Z" />
	</svg>
);

export const SearchPanel = () => {
	const { connected, userContext, sendCommand } = useWebSocket();
	const searchInputId = useId();
	const [query, setQuery] = useState("");
	const [searchResults, setSearchResults] = useState<Track[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [voiceChannelId, setVoiceChannelId] = useState("");

	const isDisabled = !connected || !userContext.userId;

	const formatDuration = (ms: number) => {
		const seconds = Math.floor(ms / 1000);
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
	};

	const handleSearch = useCallback(async () => {
		if (!query.trim()) return;
		setIsSearching(true);
		setError(null);
		try {
			const encodedQuery = encodeURIComponent(query.trim());
			const response = await fetch(
				`http://localhost:4000/api/music/search?q=${encodedQuery}`,
			);
			if (!response.ok)
				throw new Error(`Search failed: ${response.statusText}`);
			const data: SearchResponse = await response.json();
			setSearchResults(data.tracks);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Search failed");
			setSearchResults([]);
		} finally {
			setIsSearching(false);
		}
	}, [query]);

	const handlePlayTrack = useCallback(
		(track: Track) => {
			const guildId = userContext.guildId;
			const channelId = userContext.voiceChannelId || voiceChannelId;
			const userId = userContext.userId;

			console.log(
				"Playing track:",
				track.title,
				"by",
				track.author,
				"URI:",
				track.uri,
			);

			if (userId && ((guildId && channelId) || !guildId)) {
				const command: Record<string, unknown> = {
					type: "play",
					query: track.uri,
					userId,
				};

				if (guildId) command.guildId = guildId;
				if (channelId) command.voiceChannelId = channelId;

				sendCommand(command as WebSocketCommand);
			} else {
				console.log(
					"Missing required fields for play. Need userId and either (guildId+channelId) or just userId",
				);
			}
		},
		[
			userContext.guildId,
			userContext.userId,
			userContext.voiceChannelId,
			voiceChannelId,
			sendCommand,
		],
	);

	return (
		<Card>
			<CardHeader>
				<CardTitle>🔍 Search Music</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor={searchInputId}>Search Query</Label>
							<Input
								id={searchInputId}
								placeholder="Song name, artist, or Spotify/YouTube URL..."
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								onKeyDown={(e) => e.key === "Enter" && handleSearch()}
							/>
						</div>
						<div className="flex items-end">
							<Button
								onClick={handleSearch}
								disabled={isDisabled || isSearching || !query.trim()}
								className="w-full"
							>
								{isSearching ? "Searching..." : "Search"}
							</Button>
						</div>
					</div>
				</div>
				<div className="flex gap-2 mt-2"></div>

				{error && (
					<div className="text-red-500 text-sm p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
						{error}
					</div>
				)}

				{isSearching && (
					<div className="space-y-3">
						{[1, 2, 3].map((i) => (
							<div key={i} className="flex items-center space-x-3">
								<Skeleton className="h-12 w-12 rounded-lg" />
								<div className="flex-1 space-y-2">
									<Skeleton className="h-4 w-3/4" />
									<Skeleton className="h-3 w-1/2" />
								</div>
								<Skeleton className="h-8 w-16" />
							</div>
						))}
					</div>
				)}

				{searchResults.length > 0 && !isSearching && (
					<div className="space-y-3 max-h-96 overflow-y-auto">
						{searchResults.map((track, index) => (
							<div
								key={`${track.uri}-${index}`}
								className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
							>
								{track.artwork && (
									<Image
										src={track.artwork}
										alt={`${track.title} artwork`}
										width={48}
										height={48}
										className="w-12 h-12 rounded-lg object-cover"
									/>
								)}
								<div className="flex-1 min-w-0">
									<h4 className="font-medium truncate">{track.title}</h4>
									<p className="text-sm text-muted-foreground truncate">
										{track.author}
									</p>
									<div className="flex items-center gap-2 mt-1">
										<Badge variant="outline" className="text-xs">
											{formatDuration(track.duration)}
										</Badge>
										{track.isStream && (
											<Badge variant="secondary" className="text-xs">
												Stream
											</Badge>
										)}
									</div>
								</div>
								<div className="flex gap-2 shrink-0">
									<Button
										onClick={() => handlePlayTrack(track)}
										disabled={isDisabled}
										size="sm"
										className="flex items-center gap-1"
									>
										<PlayIcon className="w-3 h-3" />
										Play
									</Button>
								</div>
							</div>
						))}
					</div>
				)}

				{query && searchResults.length === 0 && !isSearching && !error && (
					<div className="text-center py-8 text-muted-foreground">
						<div className="text-4xl mb-2">🎵</div>
						<p>No results found for "{query}"</p>
						<p className="text-xs mt-2">
							Try different keywords or paste a Spotify/YouTube link directly
						</p>
					</div>
				)}

				{!query && (
					<div className="text-center py-8 text-muted-foreground">
						<div className="text-4xl mb-2">🔍</div>
						<p>Enter a song name, artist, or Spotify/YouTube URL to search</p>
						<p className="text-xs mt-2">
							Example: "love reason why" or Spotify/YouTube track URL
						</p>
					</div>
				)}

				{!connected && (
					<div className="text-center py-4 text-amber-600 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
						<p className="text-sm">
							⚠️ Not connected to bot. Please connect first.
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
};
