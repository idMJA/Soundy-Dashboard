"use client";

import { Heart, Music, Repeat, Shuffle } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { LyricsButton } from "./LyricsButton";
import { useWebSocket } from "./WebSocketProvider";

interface WebSocketCommand {
	type: string;
	[key: string]: unknown;
}

interface NowPlayingBarProps {
	sidebarCollapsed?: boolean;
}

const PlayIcon = ({ className }: { className?: string }) => (
	<svg
		className={className || "w-5 h-5"}
		fill="currentColor"
		viewBox="0 0 24 24"
		aria-label="Play"
	>
		<title>Play</title>
		<path d="m7.25 6.693 8.5 4.904a.5.5 0 0 1 0 .866l-8.5 4.904A.5.5 0 0 1 6.5 16.9V7.1a.5.5 0 0 1 .75-.433Z" />
	</svg>
);

const PauseIcon = ({ className }: { className?: string }) => (
	<svg
		className={className || "w-5 h-5"}
		fill="currentColor"
		viewBox="0 0 24 24"
		aria-label="Pause"
	>
		<title>Pause</title>
		<path d="M6.25 5A1.25 1.25 0 0 0 5 6.25v11.5A1.25 1.25 0 0 0 6.25 19h3.5A1.25 1.25 0 0 0 11 17.75V6.25A1.25 1.25 0 0 0 9.75 5h-3.5Zm7.75 0A1.25 1.25 0 0 0 12.75 6.25v11.5A1.25 1.25 0 0 0 14 19h3.5A1.25 1.25 0 0 0 18.75 17.75V6.25A1.25 1.25 0 0 0 17.5 5H14Z" />
	</svg>
);

const SkipIcon = ({ className }: { className?: string }) => (
	<svg
		className={className || "w-5 h-5"}
		fill="currentColor"
		viewBox="0 0 24 24"
		aria-label="Skip"
	>
		<title>Skip</title>
		<path d="M4.25 6.693a.5.5 0 0 1 .75-.433L13.5 11V6.25A1.25 1.25 0 0 1 14.75 5h3.5A1.25 1.25 0 0 1 19.5 6.25v11.5A1.25 1.25 0 0 1 18.25 19h-3.5A1.25 1.25 0 0 1 13.5 17.75V13l-8.5 4.74A.5.5 0 0 1 4.25 17.307V6.693Z" />
	</svg>
);

const PreviousIcon = ({ className }: { className?: string }) => (
	<svg
		className={className || "w-5 h-5"}
		fill="currentColor"
		viewBox="0 0 24 24"
		aria-label="Previous"
	>
		<title>Previous</title>
		<path d="M19.75 17.307a.5.5 0 0 1-.75.433L10.5 13v4.75A1.25 1.25 0 0 1 9.25 19h-3.5A1.25 1.25 0 0 1 4.5 17.75V6.25A1.25 1.25 0 0 1 5.75 5h3.5A1.25 1.25 0 0 1 10.5 6.25V11l8.5-4.74a.5.5 0 0 1 .75.433v10.614Z" />
	</svg>
);

const VolumeIcon = ({ className }: { className?: string }) => (
	<svg
		className={className || "w-5 h-5"}
		fill="currentColor"
		viewBox="0 0 24 24"
		aria-label="Volume"
	>
		<title>Volume</title>
		<path d="M11.25 4.533a1.5 1.5 0 0 0-1.5 1.5v11.934a1.5 1.5 0 0 0 1.5 1.5c.392 0 .77-.152 1.06-.423l6.25-5.967a1.5 1.5 0 0 0 0-2.154l-6.25-5.967a1.5 1.5 0 0 0-1.06-.423Z" />
		<path d="M3.75 8.5A1.25 1.25 0 0 0 2.5 9.75v4.5A1.25 1.25 0 0 0 3.75 15.5h2.5l3.25 2.6V5.9L6.25 8.5h-2.5Z" />
	</svg>
);

export const NowPlayingBar: React.FC<NowPlayingBarProps> = ({
	sidebarCollapsed = false,
}) => {
	const {
		connected,
		userContext,
		playerState,
		sendCommand,
		availableGuilds,
		selectGuild,
	} = useWebSocket();
	const [localVolume, setLocalVolume] = useState([playerState.volume]);
	const [isSeeking, setIsSeeking] = useState(false);
	const [seekPosition, setSeekPosition] = useState(0);
	const [pausedPosition, setPausedPosition] = useState<number | null>(null);
	const volumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const seekTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	const track = playerState.track;

	const [isLiked, setIsLiked] = useState(false);

	useEffect(() => {
		const checkLikedStatus = async () => {
			if (!userContext.userId || !track?.uri) return;
			try {
				const res = await fetch(`/api/music/liked/${userContext.userId}`);
				if (res.ok) {
					const data = await res.json();
					const liked = data.likedSongs?.some(
						(s: { uri?: string }) => s.uri === track.uri,
					);
					setIsLiked(!!liked);
				}
			} catch (e) {
				console.error("Error checking liked status:", e);
			}
		};
		checkLikedStatus();
	}, [track?.uri, userContext.userId]);

	const handleLikeToggle = async () => {
		if (!userContext.userId || !track?.uri) return;
		const nextLiked = !isLiked;
		setIsLiked(nextLiked);
		try {
			const res = await fetch("/api/music/like", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					userId: userContext.userId,
					uri: track.uri,
					action: nextLiked ? "like" : "unlike",
				}),
			});
			if (!res.ok) {
				setIsLiked(isLiked);
			}
		} catch (e) {
			console.error("Error toggling like:", e);
			setIsLiked(isLiked);
		}
	};

	const [prevVolume, setPrevVolume] = useState(playerState.volume);
	if (playerState.volume !== prevVolume) {
		setPrevVolume(playerState.volume);
		setLocalVolume([playerState.volume]);
	}

	const [localTime, setLocalTime] = useState(0);
	const [prevTrackPos, setPrevTrackPos] = useState<number | null>(null);

	const currentPos = track?.position || 0;
	if (currentPos !== prevTrackPos) {
		setPrevTrackPos(currentPos);
		setLocalTime(currentPos);
	}

	const [prevPlaying, setPrevPlaying] = useState(playerState.playing);
	if (playerState.playing !== prevPlaying) {
		setPrevPlaying(playerState.playing);
		if (playerState.playing) {
			setPausedPosition(null);
		}
	}

	const [prevTrackPosition, setPrevTrackPosition] = useState<
		number | undefined
	>(undefined);
	if (track?.position !== prevTrackPosition) {
		setPrevTrackPosition(track?.position);
		if (!playerState.playing && track?.position && pausedPosition === null) {
			setPausedPosition(track.position);
		}
	}

	useEffect(() => {
		if (!playerState.playing || !track) {
			return;
		}

		let lastTimestamp = performance.now();
		let frameId: number;

		const update = (now: number) => {
			const delta = now - lastTimestamp;
			lastTimestamp = now;

			const cappedDelta = Math.min(100, delta);

			setLocalTime((prev) => {
				const nextTime = prev + cappedDelta;
				if (track.duration && nextTime > track.duration) {
					return track.duration;
				}
				return nextTime;
			});

			frameId = requestAnimationFrame(update);
		};

		frameId = requestAnimationFrame(update);
		return () => cancelAnimationFrame(frameId);
	}, [playerState.playing, track]);

	const handleVolumeChange = useCallback(
		(value: number[]) => {
			setLocalVolume(value);

			if (volumeTimeoutRef.current) {
				clearTimeout(volumeTimeoutRef.current);
			}

			volumeTimeoutRef.current = setTimeout(() => {
				const guildId = userContext.guildId;
				const userId = userContext.userId;

				if (userId) {
					const command: Record<string, unknown> = {
						type: "set-volume",
						volume: value[0],
						guildId,
					};

					sendCommand(command as WebSocketCommand);
				}
			}, 300);
		},
		[userContext.guildId, userContext.userId, sendCommand],
	);

	const handlePlayPause = () => {
		const guildId = userContext.guildId;
		const userId = userContext.userId;

		if (userId) {
			const commandType = playerState.playing ? "pause" : "resume";
			const command: Record<string, unknown> = {
				type: commandType,
				userId,
			};
			if (guildId) command.guildId = guildId;

			sendCommand(command as WebSocketCommand);
		}
	};

	const handleSkip = () => {
		const guildId = userContext.guildId;
		const userId = userContext.userId;

		if (userId) {
			const command: Record<string, unknown> = {
				type: "skip",
				userId,
			};
			if (guildId) command.guildId = guildId;

			sendCommand(command as WebSocketCommand);
		}
	};

	const handlePrevious = () => {
		const guildId = userContext.guildId;
		const userId = userContext.userId;

		if (userId) {
			const command: Record<string, unknown> = {
				type: "previous",
				userId,
			};
			if (guildId) command.guildId = guildId;

			sendCommand(command as WebSocketCommand);
		}
	};

	const handleShuffle = () => {
		const guildId = userContext.guildId;
		if (guildId) {
			sendCommand({ type: "shuffle", guildId } as WebSocketCommand);
		}
	};

	const handleRepeat = () => {
		const guildId = userContext.guildId;
		if (guildId) {
			sendCommand({ type: "repeat", guildId } as WebSocketCommand);
		}
	};

	const handleSeek = useCallback(
		(position: number) => {
			if (!track?.duration) return;
			const newPosition = Math.max(0, Math.min(position, track.duration));
			setSeekPosition(newPosition);
			setIsSeeking(true);

			if (seekTimeoutRef.current) {
				clearTimeout(seekTimeoutRef.current);
			}

			seekTimeoutRef.current = setTimeout(() => {
				const guildId = userContext.guildId;
				const userId = userContext.userId;

				if (userId) {
					const command: Record<string, unknown> = {
						type: "seek",
						position: Math.floor(newPosition),
					};
					if (guildId) command.guildId = guildId;

					sendCommand(command as WebSocketCommand);
				}
				setIsSeeking(false);
			}, 300);
		},
		[track, userContext.guildId, userContext.userId, sendCommand],
	);

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	const isDisabled =
		!connected || (!userContext.guildId && !userContext.userId);

	const dynamicLeftClass = sidebarCollapsed
		? "lg:left-[5.75rem]"
		: "lg:left-[17rem]";

	if (!track) {
		return (
			<div
				className={cn(
					"fixed bottom-3 left-3 right-3 z-40 floating-bar rounded-2xl h-[76px] flex items-center justify-center px-6 transition-all duration-300 ease-in-out shadow-modern-xl glass bg-zinc-950/40 border border-zinc-900/60",
					dynamicLeftClass,
				)}
			>
				<div className="flex items-center gap-3 text-muted-foreground">
					<div className="w-8 h-8 bg-zinc-950/60 rounded-xl flex items-center justify-center border border-zinc-900">
						<div className="text-sm">🎵</div>
					</div>
					<span className="font-bold text-xs uppercase tracking-wider">
						No music playing
					</span>
				</div>
			</div>
		);
	}

	const getCurrentPosition = () => {
		if (isSeeking) return seekPosition;
		if (!playerState.playing && pausedPosition !== null) {
			return pausedPosition;
		}
		return localTime;
	};

	const progressPercentage = track.duration
		? (getCurrentPosition() / track.duration) * 100
		: 0;

	return (
		<div
			className={cn(
				"fixed bottom-3 left-3 right-3 z-40 floating-bar rounded-2xl h-[76px] transition-all duration-300 ease-in-out shadow-modern-xl px-4 md:px-6 py-2 flex items-center justify-between gap-4 glass bg-zinc-950/40 border border-zinc-900/60",
				dynamicLeftClass,
			)}
		>
			{/* Left Side: Track Details */}
			<div className="flex items-center space-x-3 flex-1 min-w-0 max-w-xs md:max-w-sm">
				<div className="relative w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 border border-zinc-900/60 bg-zinc-950">
					{track.artwork ? (
						<Image
							src={track.artwork}
							alt={track.title || "Artwork"}
							fill
							className="object-cover"
							sizes="44px"
							priority
							loading="eager"
						/>
					) : (
						<div className="w-full h-full bg-zinc-950 flex items-center justify-center">
							<Music className="w-4 h-4 text-primary" />
						</div>
					)}
				</div>

				<div className="min-w-0 flex-1">
					<h4
						className="font-bold text-xs text-foreground truncate hover:text-primary transition-colors cursor-pointer"
						title={track.title}
					>
						{track.title}
					</h4>
					<p className="text-[10px] text-muted-foreground truncate mt-0.5">
						{track.author}
					</p>
				</div>

				{userContext.userId && (
					<Button
						variant="ghost"
						size="sm"
						onClick={handleLikeToggle}
						className={cn(
							"h-7 w-7 p-0 rounded-lg flex-shrink-0 transition-all hover:bg-zinc-950/40",
							isLiked
								? "text-rose-500"
								: "text-muted-foreground hover:text-foreground",
						)}
					>
						<Heart
							className="w-3.5 h-3.5"
							fill={isLiked ? "currentColor" : "none"}
						/>
					</Button>
				)}
			</div>

			{/* Center: Controls & Progress */}
			<div
				className="flex flex-col items-center space-y-2 flex-1 max-w-xl md:max-w-2xl justify-center"
				style={{ flexDirection: "column" }}
			>
				<div className="flex items-center space-x-4 justify-center">
					<Button
						onClick={handleShuffle}
						disabled={isDisabled}
						variant="ghost"
						size="sm"
						className="rounded-full w-9 h-9 p-0 hover:bg-zinc-950/40 text-muted-foreground hover:text-primary transition-all flex items-center justify-center"
						title="Shuffle"
					>
						<Shuffle className="w-4 h-4" />
					</Button>

					<Button
						onClick={handlePrevious}
						disabled={isDisabled}
						variant="ghost"
						size="sm"
						className="rounded-full w-9 h-9 p-0 hover:bg-zinc-950/40 hover:text-primary transition-all flex items-center justify-center"
					>
						<PreviousIcon className="w-4.5 h-4.5" />
					</Button>

					<Button
						onClick={handlePlayPause}
						disabled={isDisabled}
						size="sm"
						className="rounded-full w-9 h-9 p-0 bg-primary hover:bg-primary/90 text-primary-foreground transition-all flex items-center justify-center border-0 disabled:opacity-50 glow-primary"
					>
						{playerState.playing ? (
							<PauseIcon className="w-4.5 h-4.5 text-zinc-950" />
						) : (
							<PlayIcon className="w-4.5 h-4.5 text-zinc-950 ml-0.5" />
						)}
					</Button>

					<Button
						onClick={handleSkip}
						disabled={isDisabled}
						variant="ghost"
						size="sm"
						className="rounded-full w-9 h-9 p-0 hover:bg-zinc-950/40 hover:text-primary transition-all flex items-center justify-center"
					>
						<SkipIcon className="w-4.5 h-4.5" />
					</Button>

					<Button
						onClick={handleRepeat}
						disabled={isDisabled}
						variant="ghost"
						size="sm"
						className="rounded-full w-9 h-9 p-0 hover:bg-zinc-950/40 text-muted-foreground hover:text-primary transition-all flex items-center justify-center"
						title="Repeat"
					>
						<Repeat className="w-4 h-4" />
					</Button>

					<LyricsButton disabled={isDisabled} />
				</div>

				{/* Progress Bar */}
				{track.duration && (
					<div className="hidden md:flex items-center space-x-2 text-[10px] text-muted-foreground w-full max-w-2xl mx-auto font-mono">
						<span className="min-w-[32px] text-right">
							{formatTime(getCurrentPosition() / 1000)}
						</span>
						<button
							type="button"
							className="flex-1 relative cursor-pointer group bg-transparent border-none p-0 outline-none h-2 flex items-center"
							onClick={(e) => {
								if (isDisabled || !track?.duration) return;

								const rect = e.currentTarget.getBoundingClientRect();
								const x = e.clientX - rect.left;
								const width = rect.width;
								const percentage = Math.max(0, Math.min(1, x / width));
								const newPosition = percentage * track.duration;

								handleSeek(newPosition);
							}}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									e.preventDefault();
									if (isDisabled || !track?.duration) return;

									const newPosition = track.duration * 0.5;
									handleSeek(newPosition);
								}
							}}
							aria-label={`Seek to position in track`}
							disabled={isDisabled}
						>
							<Progress
								value={
									isSeeking
										? (seekPosition / track.duration) * 100
										: progressPercentage
								}
								className="h-1 bg-white/5 w-full group-hover:h-1.5 transition-all"
							/>
							<div
								className="absolute top-[3px] left-0 h-1 bg-primary rounded-full transition-all group-hover:h-1.5 group-hover:top-[2.5px]"
								style={{
									width: `${
										isSeeking
											? (seekPosition / track.duration) * 100
											: progressPercentage
									}%`,
								}}
							/>
							{/* Hover circle indicator */}
							<div
								className="absolute top-1/2 w-2 h-2 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -translate-y-1/2"
								style={{
									left: `${
										isSeeking
											? (seekPosition / track.duration) * 100
											: progressPercentage
									}%`,
									transform: "translateX(-50%) translateY(-50%)",
								}}
							/>
						</button>
						<span className="min-w-[32px]">
							{formatTime(track.duration / 1000)}
						</span>
					</div>
				)}
			</div>

			{/* Right Side: Server Selector & Volume Control */}
			<div className="hidden lg:flex items-center space-x-3 flex-1 justify-end max-w-[320px]">
				{availableGuilds && availableGuilds.length > 0 && (
					<select
						value={userContext.guildId || ""}
						onChange={(e) => selectGuild(e.target.value)}
						className="bg-zinc-900 text-foreground text-xs font-semibold rounded-lg border border-zinc-800 py-1.5 px-2 focus:outline-none focus:border-primary cursor-pointer max-w-[130px] truncate"
						title="Select Active Discord Server"
					>
						{availableGuilds
							.filter((g) => g.inVoiceChannel || g.id === userContext.guildId)
							.map((g) => (
								<option key={g.id} value={g.id}>
									{g.name} {g.inVoiceChannel ? "🔊" : ""}
								</option>
							))}
					</select>
				)}
				<div className="flex items-center space-x-2 w-[140px] flex-shrink-0">
					<VolumeIcon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
					<div className="flex-1">
						<Slider
							value={localVolume}
							onValueChange={handleVolumeChange}
							disabled={isDisabled}
							max={100}
							min={0}
							step={1}
							className="cursor-pointer"
						/>
					</div>
					<span className="text-[10px] text-muted-foreground w-8 font-mono flex-shrink-0 text-right">
						{localVolume[0]}%
					</span>
				</div>
			</div>
		</div>
	);
};
