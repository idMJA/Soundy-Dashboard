"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	convertMusixmatchRichSyncToAppleMusic,
	convertMusixmatchSyncedToAppleMusic,
	convertToAppleMusicFormat,
	fetchLyricsFromLrcLib,
	parseSyncedLyrics,
} from "@/lib/lyrics";
import type { LyricLine, LyricWord } from "@/types/lyrics";
import { useWebSocket } from "./WebSocketProvider";

const LoadingDots = () => (
	<div className="flex items-center justify-center gap-1.5 mx-auto py-2">
		<div
			className="w-2.5 h-2.5 rounded-full bg-primary/80 animate-pulse"
			style={{ animationDelay: "0ms" }}
		/>
		<div
			className="w-2.5 h-2.5 rounded-full bg-primary/80 animate-pulse"
			style={{ animationDelay: "200ms" }}
		/>
		<div
			className="w-2.5 h-2.5 rounded-full bg-primary/80 animate-pulse"
			style={{ animationDelay: "400ms" }}
		/>
	</div>
);

const cleanExpiredCache = () => {
	if (typeof window === "undefined") return;

	try {
		const keys = Object.keys(localStorage);
		const now = Date.now();

		keys.forEach((key) => {
			if (key.endsWith("_expiry")) {
				const expiry = parseInt(localStorage.getItem(key) || "0", 10);
				if (expiry < now) {
					const cacheKey = key.replace("_expiry", "");
					localStorage.removeItem(key);
					localStorage.removeItem(cacheKey);
				}
			}
		});
	} catch {}
};

function insertInstrumentalGaps(parsedLyrics: LyricLine[]): LyricLine[] {
	if (!parsedLyrics || parsedLyrics.length === 0) return parsedLyrics;

	const isPlain =
		parsedLyrics.length === 1 &&
		parsedLyrics[0].words.length === 1 &&
		parsedLyrics[0].words[0].word.includes("\n");
	if (isPlain) return parsedLyrics;

	const result: LyricLine[] = [];

	const firstLine = parsedLyrics[0];
	if (firstLine.startTime > 5000) {
		const introEndTime = firstLine.startTime - 1000;
		result.push({
			startTime: 1000,
			endTime: introEndTime,
			words: [
				{
					startTime: 1000,
					endTime: introEndTime,
					word: "•••",
				},
			],
			translatedLyric: "",
			romanLyric: "",
			isBG: false,
			isDuet: false,
		});
	}

	for (let i = 0; i < parsedLyrics.length; i++) {
		const currentLine = parsedLyrics[i];
		result.push(currentLine);

		const nextLine = parsedLyrics[i + 1];
		if (nextLine) {
			const gap = nextLine.startTime - currentLine.endTime;
			if (gap > 4000) {
				const gapStartTime = currentLine.endTime + 500;
				const gapEndTime = nextLine.startTime - 500;

				result.push({
					startTime: gapStartTime,
					endTime: gapEndTime,
					words: [
						{
							startTime: gapStartTime,
							endTime: gapEndTime,
							word: "•••",
						},
					],
					translatedLyric: "",
					romanLyric: "",
					isBG: false,
					isDuet: false,
				});
			}
		}
	}

	return result;
}

export function SyncedLyrics() {
	const { playerState, sendCommand, connected, userContext } = useWebSocket();
	const [lyrics, setLyrics] = useState<LyricLine[]>([]);
	const updateLyrics = useCallback((lines: LyricLine[]) => {
		setLyrics(insertInstrumentalGaps(lines));
	}, []);
	const [lyricSource, setLyricSource] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [lastFetchedTrackId, setLastFetchedTrackId] = useState<string | null>(
		null,
	);
	const fetchingRef = useRef<string | null>(null);
	const containerRef = useRef<HTMLDivElement | null>(null);
	const lineRefs = useRef<(HTMLButtonElement | null)[]>([]);

	const track = playerState.track;

	const trackId =
		track?.title && track?.author
			? `${track.title}__${track.author}__${Math.round((track.duration || 0) / 1000)}`
			: null;

	const [prevTrackPos, setPrevTrackPos] = useState<number | null>(null);
	const [localTime, setLocalTime] = useState(0);

	// Sync localTime with websocket track position updates during render phase
	const currentPos = track?.position || 0;
	if (currentPos !== prevTrackPos) {
		setPrevTrackPos(currentPos);
		setLocalTime(currentPos);
	}

	const currentTime = useMemo(() => {
		if (lyrics.length === 0) return 0;
		return Math.floor(localTime);
	}, [localTime, lyrics]);

	// Find the index of the currently active line
	const activeLineIndex = useMemo(() => {
		if (lyrics.length === 0) return -1;

		let index = -1;
		for (let i = 0; i < lyrics.length; i++) {
			const line = lyrics[i];
			if (currentTime >= line.startTime && currentTime <= line.endTime) {
				return i;
			}
			if (line.startTime <= currentTime) {
				index = i;
			}
		}
		return index;
	}, [lyrics, currentTime]);

	const activeLineIndexRef = useRef(activeLineIndex);
	useEffect(() => {
		activeLineIndexRef.current = activeLineIndex;
	}, [activeLineIndex]);

	const userScrollTimeoutRef = useRef(0);
	const handleUserInteraction = () => {
		userScrollTimeoutRef.current = Date.now() + 4000; // Suspend auto-scroll for 4 seconds
	};

	// High-frequency interpolation loop for 60 FPS scrolling and time updates
	useEffect(() => {
		let lastTimestamp = performance.now();
		let frameId: number;

		const update = (now: number) => {
			if (!playerState.playing || !track) {
				lastTimestamp = now;

				// Keep centering the container even if paused, unless user is interacting
				if (Date.now() > userScrollTimeoutRef.current) {
					const container = containerRef.current;
					const activeIdx = activeLineIndexRef.current;
					const activeElement = lineRefs.current[activeIdx];
					if (container && activeElement) {
						const containerHeight = container.clientHeight;
						const elementOffsetTop = activeElement.offsetTop;
						const elementHeight = activeElement.clientHeight;
						const targetScrollTop =
							elementOffsetTop - containerHeight / 2 + elementHeight / 2;

						container.scrollTop = targetScrollTop;
					}
				}

				frameId = requestAnimationFrame(update);
				return;
			}

			const delta = now - lastTimestamp;
			lastTimestamp = now;

			// Cap delta at 100ms to prevent huge jumps from background tabs
			const cappedDelta = Math.min(100, delta);

			setLocalTime((prev) => {
				const nextTime = prev + cappedDelta;
				if (track.duration && nextTime > track.duration) {
					return track.duration;
				}
				return nextTime;
			});

			// Scroll target position update (only if user has not scrolled manually recently)
			if (Date.now() > userScrollTimeoutRef.current) {
				const container = containerRef.current;
				const activeIdx = activeLineIndexRef.current;
				const activeElement = lineRefs.current[activeIdx];
				if (container && activeElement) {
					const containerHeight = container.clientHeight;
					const elementOffsetTop = activeElement.offsetTop;
					const elementHeight = activeElement.clientHeight;
					const targetScrollTop =
						elementOffsetTop - containerHeight / 2 + elementHeight / 2;

					container.scrollTop = targetScrollTop;
				}
			}

			frameId = requestAnimationFrame(update);
		};

		frameId = requestAnimationFrame(update);
		return () => cancelAnimationFrame(frameId);
	}, [playerState.playing, track]);

	// Fetch lyrics logic
	useEffect(() => {
		cleanExpiredCache();

		const fetchLyrics = async (
			currentTrack: typeof track,
			currentTrackId: string,
		) => {
			if (!currentTrack || !currentTrackId) {
				updateLyrics([]);
				setError(null);
				return;
			}

			if (
				fetchingRef.current === currentTrackId ||
				lastFetchedTrackId === currentTrackId
			) {
				return;
			}

			try {
				if (typeof window !== "undefined") {
					const cachedData = localStorage.getItem(`lyrics_${currentTrackId}`);
					const expiryData = localStorage.getItem(
						`lyrics_${currentTrackId}_expiry`,
					);

					if (cachedData && expiryData) {
						const expiry = parseInt(expiryData, 10);
						if (expiry > Date.now()) {
							const cachedLyrics = JSON.parse(cachedData) as LyricLine[];
							const cachedSource = localStorage.getItem(
								`lyrics_${currentTrackId}_source`,
							);
							updateLyrics(cachedLyrics);
							setLyricSource(cachedSource || "musixmatch");
							setLastFetchedTrackId(currentTrackId);
							return;
						} else {
							localStorage.removeItem(`lyrics_${currentTrackId}`);
							localStorage.removeItem(`lyrics_${currentTrackId}_expiry`);
							localStorage.removeItem(`lyrics_${currentTrackId}_source`);
						}
					}
				}
			} catch {}

			fetchingRef.current = currentTrackId;
			setLoading(true);
			setError(null);

			try {
				const lyricsData = await fetchLyricsFromLrcLib({
					trackName: currentTrack.title,
					artistName: currentTrack.author,
					albumName: currentTrack.albumName || currentTrack.title,
					duration: Math.round((currentTrack.duration || 0) / 1000),
				});

				let appleMusicLyrics: LyricLine[] = [];

				if (lyricsData?.success) {
					setLyricSource(lyricsData.source);
					if (lyricsData.source === "musixmatch") {
						if (
							lyricsData.richSyncedLyrics &&
							lyricsData.richSyncedLyrics.length > 0
						) {
							appleMusicLyrics = convertMusixmatchRichSyncToAppleMusic(
								lyricsData.richSyncedLyrics,
							);
						} else if (
							lyricsData.syncedLyrics &&
							lyricsData.syncedLyrics.length > 0
						) {
							appleMusicLyrics = convertMusixmatchSyncedToAppleMusic(
								lyricsData.syncedLyrics,
							);
						} else if (lyricsData.plainLyrics) {
							appleMusicLyrics = convertToAppleMusicFormat([
								{ time: 0, text: lyricsData.plainLyrics },
							]);
						} else {
							setError("No lyrics found for this track on Musixmatch");
						}
					} else if (lyricsData.source === "lrclib" && lyricsData.lrclibData) {
						const lrclib = lyricsData.lrclibData;
						if (lrclib.syncedLyrics) {
							const parsedLyrics = parseSyncedLyrics(lrclib.syncedLyrics);
							if (parsedLyrics && parsedLyrics.length > 0) {
								appleMusicLyrics = convertToAppleMusicFormat(parsedLyrics);
							} else {
								setError("Couldn't parse synced lyrics format from LRCLIB");
							}
						} else if (lrclib.plainLyrics) {
							appleMusicLyrics = convertToAppleMusicFormat([
								{ time: 0, text: lrclib.plainLyrics },
							]);
						} else {
							setError("No lyrics found on LRCLIB");
						}
					} else {
						setError("Unknown lyrics source");
					}
				} else {
					setError("No lyrics found for this track");
				}

				try {
					if (typeof window !== "undefined" && appleMusicLyrics.length > 0) {
						localStorage.setItem(
							`lyrics_${currentTrackId}`,
							JSON.stringify(appleMusicLyrics),
						);
						localStorage.setItem(
							`lyrics_${currentTrackId}_source`,
							lyricsData?.source || "musixmatch",
						);
						localStorage.setItem(
							`lyrics_${currentTrackId}_expiry`,
							(Date.now() + 5 * 60 * 1000).toString(),
						);
					}
				} catch {}

				updateLyrics(appleMusicLyrics);
				setLastFetchedTrackId(currentTrackId);
			} catch (err) {
				console.error("Error fetching lyrics:", err);
				setError("Failed to fetch lyrics");
				updateLyrics([]);
			} finally {
				setLoading(false);
				fetchingRef.current = null;
			}
		};

		if (trackId && track) {
			fetchLyrics(track, trackId);
		}
	}, [trackId, lastFetchedTrackId, track, updateLyrics]);

	// seeking / play state seeking handler
	const handleLineClick = (startTime: number) => {
		if (!connected || !userContext.guildId) return;
		sendCommand({
			type: "seek",
			position: startTime,
			guildId: userContext.guildId,
		});
	};

	const isPlainLyrics = useMemo(() => {
		return (
			lyrics.length === 1 &&
			lyrics[0].startTime === 0 &&
			lyrics[0].words[0]?.word.includes("\n")
		);
	}, [lyrics]);

	const plainLines = useMemo(() => {
		if (!isPlainLyrics || lyrics.length === 0) return [];
		return lyrics[0].words[0].word.split("\n").map((line, idx) => ({
			id: `plain-line-${idx}-${line.slice(0, 10)}`,
			text: line,
		}));
	}, [lyrics, isPlainLyrics]);

	if (!track) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="text-center space-y-3">
					<div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
						<span className="text-2xl">🎵</span>
					</div>
					<p className="text-muted-foreground font-semibold">
						No music playing
					</p>
				</div>
			</div>
		);
	}

	if (loading) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="text-center space-y-4">
					<LoadingDots />
					<div className="text-sm font-semibold text-muted-foreground tracking-wider animate-pulse uppercase">
						Loading lyrics...
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="text-center space-y-3">
					<div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
						<span className="text-2xl">❌</span>
					</div>
					<p className="text-muted-foreground">{error}</p>
					<p className="text-xs text-muted-foreground">
						Powered by Musixmatch & LRCLIB
					</p>
				</div>
			</div>
		);
	}

	if (lyrics.length === 0) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="text-center space-y-3">
					<div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
						<span className="text-2xl">🎵</span>
					</div>
					<p className="text-muted-foreground">No synced lyrics available</p>
					<p className="text-xs text-muted-foreground">
						Powered by Musixmatch & LRCLIB
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="h-full flex flex-col relative overflow-hidden bg-[#070708]/90 backdrop-blur-xl rounded-3xl border border-white/5 noise-bg">
			{/* Ambient Glowing Background Circles */}
			<div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
				<div
					className="absolute top-[-15%] left-[-25%] w-[65%] h-[65%] bg-emerald-500/10 rounded-full blur-[130px] animate-pulse-slow"
					style={{ animationDuration: "15s" }}
				/>
				<div
					className="absolute bottom-[-15%] right-[-15%] w-[75%] h-[75%] bg-primary/10 rounded-full blur-[160px] animate-pulse-slow"
					style={{ animationDuration: "20s" }}
				/>
				<div
					className="absolute top-[25%] left-[35%] w-[55%] h-[55%] bg-purple-500/5 rounded-full blur-[140px] animate-pulse-slow"
					style={{ animationDuration: "18s" }}
				/>
			</div>

			{/* Custom Lyrics Scroller (Handles Synced & Plain Modes in the exact same view) */}
			<div
				ref={containerRef}
				onWheel={handleUserInteraction}
				onTouchMove={handleUserInteraction}
				className="flex-1 overflow-y-auto z-10 px-6 md:px-12 py-[35vh] space-y-8 scroll-smooth select-none thin-scrollbar"
				style={{ scrollbarWidth: "none" }}
			>
				{isPlainLyrics
					? // Plain lyrics text lines mapped into the same main scrolling styling
						plainLines.map((line) => {
							return (
								<p
									key={line.id}
									className="text-xl md:text-2xl font-bold text-white/70 hover:text-white transition-colors duration-300 text-center"
								>
									{line.text.trim() || "•••"}
								</p>
							);
						})
					: // Synced / Richsynced lyrics lines
						lyrics.map((line, index) => {
							const isLineActive = index === activeLineIndex;
							const isPassed = index < activeLineIndex;

							// A line has karaoke words if line.words has multiple items
							const hasWords = line.words && line.words.length > 1;

							return (
								<button
									type="button"
									key={`line-${line.startTime}`}
									ref={(el) => {
										lineRefs.current[index] = el;
									}}
									onClick={() => handleLineClick(line.startTime)}
									onKeyDown={(e) => {
										if (e.key === "Enter" || e.key === " ") {
											e.preventDefault();
											handleLineClick(line.startTime);
										}
									}}
									className={`py-3 cursor-pointer transition-all duration-700 ease-out origin-left flex flex-wrap items-center text-left w-full bg-transparent border-none outline-none font-inherit ${
										isLineActive
											? "scale-[1.03] opacity-100 filter-none"
											: isPassed
												? "scale-[0.98] opacity-45 filter-none hover:opacity-80"
												: "scale-[0.98] opacity-25 blur-[0.4px] hover:blur-none hover:opacity-65"
									}`}
								>
									{hasWords ? (
										line.words.map((word: LyricWord) => {
											// Compute word-level highlighting progress
											let progress = 0;
											if (currentTime >= word.startTime) {
												if (currentTime >= word.endTime) {
													progress = 100;
												} else {
													progress =
														((currentTime - word.startTime) /
															(word.endTime - word.startTime)) *
														100;
												}
											}

											const isInstrumental = word.word === "•••";
											if (isInstrumental) {
												return (
													<span
														key={`word-${word.startTime}`}
														className={`inline-flex items-center gap-2 py-2.5 my-2 transition-all duration-500 ${
															isLineActive
																? "opacity-100 scale-105"
																: "opacity-30 scale-95"
														}`}
													>
														<span
															className={`w-2.5 h-2.5 rounded-full bg-white ${isLineActive ? "animate-bounce" : ""}`}
															style={{ animationDelay: "0ms" }}
														/>
														<span
															className={`w-2.5 h-2.5 rounded-full bg-white ${isLineActive ? "animate-bounce" : ""}`}
															style={{ animationDelay: "150ms" }}
														/>
														<span
															className={`w-2.5 h-2.5 rounded-full bg-white ${isLineActive ? "animate-bounce" : ""}`}
															style={{ animationDelay: "300ms" }}
														/>
													</span>
												);
											}

											return (
												<span
													key={`word-${word.startTime}`}
													className="relative inline-block mr-2.5 text-3xl md:text-5xl font-black tracking-tight"
												>
													{/* Inactive syllable background */}
													<span className="text-white/25 transition-colors duration-500">
														{word.word}
													</span>

													{/* Active syllable foreground sliding overlay */}
													<span
														className="absolute top-0 left-0 text-white overflow-hidden whitespace-nowrap select-none pointer-events-none"
														style={{
															width: `${progress}%`,
														}}
													>
														{word.word}
													</span>
												</span>
											);
										})
									) : // Line-by-line fallback
									line.words[0]?.word === "•••" ? (
										<span
											className={`inline-flex items-center gap-2 py-2.5 my-2 transition-all duration-500 ${
												isLineActive
													? "opacity-100 scale-105"
													: "opacity-30 scale-95"
											}`}
										>
											<span
												className={`w-2.5 h-2.5 rounded-full bg-white ${isLineActive ? "animate-bounce" : ""}`}
												style={{ animationDelay: "0ms" }}
											/>
											<span
												className={`w-2.5 h-2.5 rounded-full bg-white ${isLineActive ? "animate-bounce" : ""}`}
												style={{ animationDelay: "150ms" }}
											/>
											<span
												className={`w-2.5 h-2.5 rounded-full bg-white ${isLineActive ? "animate-bounce" : ""}`}
												style={{ animationDelay: "300ms" }}
											/>
										</span>
									) : (
										<span
											className={`text-3xl md:text-5xl font-black tracking-tight transition-all duration-500 ${
												isLineActive
													? "text-white scale-[1.01]"
													: "text-white/25"
											}`}
										>
											{line.words[0]?.word || ""}
										</span>
									)}
								</button>
							);
						})}

				{/* Beautiful subtle End of Lyrics and Credit indicators inside the scroller */}
				<div className="pt-20 pb-8 text-center space-y-2 z-10 select-text">
					<p className="text-[10px] text-white/20 font-bold tracking-widest uppercase">
						Lyrics powered by{" "}
						{lyricSource === "lrclib" ? "LRCLIB" : "Musixmatch"}
					</p>
					<p className="text-[10px] text-white/30 font-bold tracking-widest uppercase">
						Designed by{" "}
						<a
							href="https://mja.moe"
							target="_blank"
							rel="noopener noreferrer"
							className="text-primary/60 hover:text-primary transition-colors hover:underline"
						>
							iaMJ
						</a>
					</p>
				</div>
			</div>
		</div>
	);
}
