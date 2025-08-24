"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { useWebSocket } from "./WebSocketProvider";
import {
	fetchLyricsFromLrcLib,
	parseSyncedLyrics,
	convertToAppleMusicFormat,
} from "@/lib/lyrics";
import type { LyricLine } from "@/types/lyrics";

const LyricPlayer = dynamic(
	() =>
		import("@applemusic-like-lyrics/react").then((mod) => ({
			default: mod.LyricPlayer,
		})),
	{
		ssr: false,
		loading: () => (
			<div className="flex items-center justify-center h-full">
				<div className="text-center space-y-3">
					<div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
						<span className="text-2xl">🎵</span>
					</div>
					<p className="text-muted-foreground">Loading lyrics player...</p>
				</div>
			</div>
		),
	},
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

export function SyncedLyrics() {
	const { playerState } = useWebSocket();
	const [lyrics, setLyrics] = useState<LyricLine[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [lastFetchedTrackId, setLastFetchedTrackId] = useState<string | null>(
		null,
	);
	const [initialSyncDone, setInitialSyncDone] = useState<boolean>(false);
	const [pausedPosition, setPausedPosition] = useState<number | null>(null);
	const fetchingRef = useRef<string | null>(null);
	const track = playerState.track;

	const trackId = useMemo(() => {
		if (!track?.title || !track?.author) return null;
		return `${track.title}__${track.author}__${Math.round((track.duration || 0) / 1000)}`;
	}, [track?.title, track?.author, track?.duration]);

	useEffect(() => {
		if (playerState.playing) {
			setPausedPosition(null);
		} else if (track?.position && pausedPosition === null) {
			setPausedPosition(track.position);
		}
	}, [playerState.playing, track?.position, pausedPosition]);

	const currentTime = useMemo(() => {
		let currentPos = track?.position || 0;

		if (!playerState.playing && pausedPosition !== null) {
			currentPos = pausedPosition;
		}

		if (!currentPos || lyrics.length === 0) return 0;

		if (!initialSyncDone && currentPos > 5000) {
			let closestTime = 0;
			for (let i = 0; i < lyrics.length; i++) {
				const lyricTime = lyrics[i].startTime;
				if (lyricTime <= currentPos) {
					closestTime = lyricTime;
				} else {
					break;
				}
			}

			setTimeout(() => setInitialSyncDone(true), 2000);
			return closestTime;
		}

		return Math.floor(currentPos / 100) * 100;
	}, [
		track?.position,
		lyrics,
		initialSyncDone,
		playerState.playing,
		pausedPosition,
	]);

	useEffect(() => {
		cleanExpiredCache();

		const fetchLyrics = async (
			currentTrack: typeof track,
			currentTrackId: string,
		) => {
			if (!currentTrack || !currentTrackId) {
				setLyrics([]);
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
							setLyrics(cachedLyrics);
							setLastFetchedTrackId(currentTrackId);
							setInitialSyncDone(false);
							return;
						} else {
							localStorage.removeItem(`lyrics_${currentTrackId}`);
							localStorage.removeItem(`lyrics_${currentTrackId}_expiry`);
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

				if (lyricsData?.syncedLyrics) {
					const parsedLyrics = parseSyncedLyrics(lyricsData.syncedLyrics);
					if (parsedLyrics && parsedLyrics.length > 0) {
						appleMusicLyrics = convertToAppleMusicFormat(parsedLyrics);
					} else {
						setError("Couldn't parse synced lyrics format");
					}
				} else if (lyricsData?.plainLyrics) {
					appleMusicLyrics = convertToAppleMusicFormat([
						{ time: 0, text: lyricsData.plainLyrics },
					]);
				} else {
					setError("No lyrics found for this track");
				}

				try {
					if (typeof window !== "undefined") {
						localStorage.setItem(
							`lyrics_${currentTrackId}`,
							JSON.stringify(appleMusicLyrics),
						);
						localStorage.setItem(
							`lyrics_${currentTrackId}_expiry`,
							(Date.now() + 5 * 60 * 1000).toString(),
						);
					}
				} catch {}

				setLyrics(appleMusicLyrics);
				setLastFetchedTrackId(currentTrackId);
				setInitialSyncDone(false);
			} catch (err) {
				console.error("Error fetching lyrics:", err);
				setError("Failed to fetch lyrics");
				setLyrics([]);
			} finally {
				setLoading(false);
				fetchingRef.current = null;
			}
		};

		if (trackId && track) {
			fetchLyrics(track, trackId);
		}
	}, [trackId, lastFetchedTrackId, track]);

	if (!track) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="text-center space-y-3">
					<div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
						<span className="text-2xl">🎵</span>
					</div>
					<p className="text-muted-foreground">No music playing</p>
				</div>
			</div>
		);
	}

	if (loading) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="text-center space-y-4">
					<div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
					<div className="text-muted-foreground">Loading lyrics...</div>
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
					<p className="text-xs text-muted-foreground">Powered by LRCLIB.net</p>
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
					<p className="text-xs text-muted-foreground">Powered by LRCLIB.net</p>
				</div>
			</div>
		);
	}

	return (
		<div className="h-full flex flex-col">
			<div className="flex-1 relative overflow-hidden">
				<LyricPlayer
					lyricLines={lyrics}
					currentTime={currentTime}
					playing={playerState.playing}
					className="w-full h-full"
					style={
						{
							"--amll-lyric-player-font-family": "var(--font-sans)",
							"--amll-lyric-player-font-size": "1.75rem",
							"--amll-lyric-player-text-color": "hsl(var(--muted-foreground))",
							"--amll-lyric-player-text-color-active": "hsl(var(--primary))",
							"--amll-lyric-player-text-color-inactive":
								"hsl(var(--muted-foreground))",
							"--amll-lyric-player-bg-color": "transparent",
						} as React.CSSProperties
					}
					alignAnchor="center"
					alignPosition={0.45}
					enableSpring={true}
					enableBlur={true}
					enableScale={false}
					hidePassedLines={false}
					bottomLine={
						<div className="text-xs text-muted-foreground text-center py-4">
							<div className="flex items-center justify-center gap-2">
								<span>🎵</span>
								<span>Powered by LRCLIB.net</span>
							</div>
						</div>
					}
					onLyricLineClick={(line: unknown) => {
						console.log("Clicked lyric line:", line);
					}}
				/>
			</div>
		</div>
	);
}
