"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useWebSocket } from "./WebSocketProvider";
import { fetchLyricsFromLrcLib, parseSyncedLyrics } from "@/lib/lyrics";
import type { SyncedLyricsLine } from "@/types/lyrics";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";

export function SyncedLyrics() {
	const { playerState } = useWebSocket();
	const [lyrics, setLyrics] = useState<SyncedLyricsLine[]>([]);
	const [activeLine, setActiveLine] = useState<number>(-1);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [lastFetchedTrackId, setLastFetchedTrackId] = useState<string | null>(
		null,
	);
	const scrollAreaRef = useRef<HTMLDivElement>(null);
	const activeLineRef = useRef<HTMLDivElement>(null);
	const track = playerState.track;

	// Create a unique identifier for the track to prevent duplicate fetches
	const trackId = useMemo(() => {
		if (!track) return null;
		return `${track.title}__${track.author}__${Math.round((track.duration || 0) / 1000)}`;
	}, [track]);

	// Fetch lyrics when the track changes
	useEffect(() => {
		const fetchLyrics = async () => {
			if (!track || !trackId) {
				setLyrics([]);
				setActiveLine(-1);
				setError(null);
				return;
			}

			// Don't fetch if we already fetched for this track
			if (lastFetchedTrackId === trackId) {
				return;
			}

			setLoading(true);
			setError(null);

			try {
				const lyricsData = await fetchLyricsFromLrcLib({
					trackName: track.title,
					artistName: track.author,
					albumName: track.albumName || track.title, // Fallback to title if albumName is not available
					duration: Math.round((track.duration || 0) / 1000), // Convert to seconds
				});

				if (lyricsData?.syncedLyrics) {
					const parsedLyrics = parseSyncedLyrics(lyricsData.syncedLyrics);
					if (parsedLyrics && parsedLyrics.length > 0) {
						setLyrics(parsedLyrics);
						setLastFetchedTrackId(trackId); // Mark this track as fetched
					} else {
						setLyrics([]);
						setError("Couldn't parse synced lyrics format");
					}
				} else if (lyricsData?.plainLyrics) {
					// If we have plain lyrics but no synced lyrics
					setLyrics([{ time: 0, text: lyricsData.plainLyrics }]);
					setLastFetchedTrackId(trackId); // Mark this track as fetched
				} else {
					setLyrics([]);
					setError("No lyrics found for this track");
					setLastFetchedTrackId(trackId); // Mark this track as fetched (even if no lyrics)
				}
			} catch (err) {
				console.error("Error fetching lyrics:", err);
				setError("Failed to fetch lyrics");
				setLyrics([]);
			} finally {
				setLoading(false);
			}
		};

		fetchLyrics();
	}, [trackId, lastFetchedTrackId, track]);

	// Update active line based on current position (optimized to reduce re-renders)
	const updateActiveLine = useCallback(() => {
		if (!track || !Array.isArray(lyrics) || lyrics.length === 0) return;

		const currentTime = track.position || 0;
		let newActiveLine = -1;

		// Find the line that should be active based on the current time
		for (let i = 0; i < lyrics.length; i++) {
			if (i === lyrics.length - 1) {
				if (currentTime >= lyrics[i].time) {
					newActiveLine = i;
				}
			} else if (
				currentTime >= lyrics[i].time &&
				currentTime < lyrics[i + 1].time
			) {
				newActiveLine = i;
				break;
			}
		}

		if (newActiveLine !== activeLine) {
			setActiveLine(newActiveLine);
		}
	}, [track, lyrics, activeLine]);

	useEffect(() => {
		updateActiveLine();
	}, [updateActiveLine]);

	// Enhanced scroll to active line with perfect centering
	useEffect(() => {
		if (activeLine >= 0 && activeLineRef.current && scrollAreaRef.current) {
			// Use requestAnimationFrame for smoother scrolling
			requestAnimationFrame(() => {
				if (activeLineRef.current && scrollAreaRef.current) {
					const scrollContainer = scrollAreaRef.current.querySelector(
						"[data-radix-scroll-area-viewport]",
					);
					if (scrollContainer) {
						const activeElement = activeLineRef.current;
						const containerHeight = scrollContainer.clientHeight;
						const elementTop = activeElement.offsetTop;
						const elementHeight = activeElement.clientHeight;

						// Calculate position to center the element perfectly
						const scrollTop =
							elementTop - containerHeight / 2 + elementHeight / 2;

						scrollContainer.scrollTo({
							top: scrollTop,
							behavior: "smooth",
						});
					} else {
						// Fallback to normal scrollIntoView
						activeLineRef.current.scrollIntoView({
							behavior: "smooth",
							block: "center",
							inline: "center",
						});
					}
				}
			});
		}
	}, [activeLine]);

	if (!track) {
		return (
			<div className="flex items-center justify-center h-full">
				<p className="text-muted-foreground">No music playing</p>
			</div>
		);
	}

	if (loading) {
		return (
			<div className="flex items-center justify-center h-full flex-col gap-4">
				<div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
				<div className="text-muted-foreground">Loading lyrics...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center h-full flex-col gap-4">
				<p className="text-muted-foreground">{error}</p>
				<p className="text-xs text-muted-foreground">Powered by LRCLIB.net</p>
			</div>
		);
	}

	if (lyrics.length === 0) {
		return (
			<div className="flex items-center justify-center h-full flex-col gap-4">
				<div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-2">
					<span className="text-2xl">🎵</span>
				</div>
				<p className="text-muted-foreground text-center">
					No synced lyrics available
				</p>
				<p className="text-xs text-muted-foreground text-center">
					Powered by LRCLIB.net
				</p>
			</div>
		);
	}

	return (
		<div className="h-full flex flex-col">
			<div className="flex justify-between items-center px-4 py-2 border-b border-border/50">
				<h3 className="text-sm font-medium">Lyrics</h3>
				<p className="text-xs text-muted-foreground">Powered by LRCLIB.net</p>
			</div>
			<ScrollArea
				className="flex-1 relative overflow-hidden"
				ref={scrollAreaRef}
			>
				{/* Container with fixed height to ensure proper centering */}
				<div className="relative min-h-full">
					{/* Top spacer to push content to center */}
					<div className="h-[50vh]" />

					{/* Lyrics content */}
					<div className="px-4 space-y-6 max-w-full w-full">
						{lyrics.map((line, index) => {
							const isActive = index === activeLine;
							const isNext = index === activeLine + 1;
							const isPrevious = index === activeLine - 1;

							return (
								<div
									key={`lyric-line-${index}-${line.time}`}
									ref={isActive ? activeLineRef : null}
									className={cn(
										"transition-all duration-500 ease-in-out text-center leading-relaxed cursor-default select-none py-3 px-2 rounded-lg",
										"break-words hyphens-auto max-w-full overflow-hidden text-wrap",
										"whitespace-pre-wrap word-break-keep-all",
										isActive &&
											"text-primary font-bold text-xl md:text-2xl transform scale-105 drop-shadow-sm bg-primary/5 border border-primary/20",
										isNext &&
											"text-foreground/80 font-semibold text-lg md:text-xl opacity-70",
										isPrevious &&
											"text-foreground/60 font-medium text-lg md:text-xl opacity-50",
										!isActive &&
											!isNext &&
											!isPrevious &&
											"text-muted-foreground font-medium text-base md:text-lg opacity-40 hover:opacity-60",
									)}
									style={{
										wordWrap: "break-word",
										overflowWrap: "break-word",
										maxWidth: "100%",
									}}
								>
									{line.text || "♪"}
								</div>
							);
						})}
					</div>

					{/* Bottom spacer to maintain centering */}
					<div className="h-[50vh]" />
				</div>

				{/* Subtle gradient overlay at top and bottom for better visual effect */}
				<div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-background to-transparent pointer-events-none" />
				<div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent pointer-events-none" />
			</ScrollArea>
		</div>
	);
}
