"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useWebSocket } from "./WebSocketProvider";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { LyricsButton } from "./LyricsButton";

interface WebSocketCommand {
	type: string;
	[key: string]: unknown;
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

export const NowPlayingBar = () => {
	const { connected, userContext, playerState, sendCommand } = useWebSocket();
	const [localVolume, setLocalVolume] = useState([playerState.volume]);
	const [isSeeking, setIsSeeking] = useState(false);
	const [seekPosition, setSeekPosition] = useState(0);
	const [pausedPosition, setPausedPosition] = useState<number | null>(null);
	const volumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const seekTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	const track = playerState.track;

	useEffect(() => {
		setLocalVolume([playerState.volume]);
	}, [playerState.volume]);

	useEffect(() => {
		if (playerState.playing) {
			setPausedPosition(null);
		} else if (track?.position && pausedPosition === null) {
			setPausedPosition(track.position);
		}
	}, [playerState.playing, track?.position, pausedPosition]);

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

	const handleSeek = useCallback(
		(percentage: number) => {
			if (!track?.duration) return;

			const newPosition = (percentage / 100) * track.duration;
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
		[track?.duration, userContext.guildId, userContext.userId, sendCommand],
	);

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	const isDisabled =
		!connected || (!userContext.guildId && !userContext.userId);

	if (!track) {
		return (
			<div className="fixed bottom-0 left-0 lg:left-64 right-0 glass border-t border-border/50 backdrop-blur-xl shadow-modern animate-slide-up">
				<div className="flex items-center justify-center p-6 text-muted-foreground">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
							<div className="text-lg">🎵</div>
						</div>
						<span className="font-medium">No music playing</span>
					</div>
				</div>
			</div>
		);
	}

	const getCurrentPosition = () => {
		if (isSeeking) return seekPosition;
		if (!playerState.playing && pausedPosition !== null) {
			return pausedPosition;
		}
		return track?.position || 0;
	};

	const progressPercentage = track.duration
		? (getCurrentPosition() / track.duration) * 100
		: 0;

	return (
		<div className="fixed bottom-0 left-0 lg:left-64 right-0 glass border-t border-border/50 backdrop-blur-xl shadow-modern-xl animate-slide-up">
			<div className="flex items-center justify-between p-4 gap-6">
				{/* Player Controls - Centered */}
				<div className="flex flex-col items-center space-y-3 flex-1 max-w-2xl justify-center mx-auto">
					<div className="flex items-center space-x-4 justify-center">
						<Button
							onClick={handlePrevious}
							disabled={isDisabled}
							variant="ghost"
							size="default"
							className="rounded-full w-10 h-10 p-0 hover:bg-primary/10 hover:text-primary transition-all hover:scale-110"
						>
							<PreviousIcon className="w-5 h-5" />
						</Button>

						<Button
							onClick={handlePlayPause}
							disabled={isDisabled}
							size="default"
							className="rounded-full w-12 h-12 p-0 gradient-primary shadow-lg hover:shadow-xl transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{playerState.playing ? (
								<PauseIcon className="w-5 h-5 text-white" />
							) : (
								<PlayIcon className="w-5 h-5 text-white" />
							)}
						</Button>

						<Button
							onClick={handleSkip}
							disabled={isDisabled}
							variant="ghost"
							size="default"
							className="rounded-full w-10 h-10 p-0 hover:bg-primary/10 hover:text-primary transition-all hover:scale-110"
						>
							<SkipIcon className="w-5 h-5" />
						</Button>

						<LyricsButton disabled={isDisabled} />
					</div>

					{/* Progress Bar */}
					{track.duration && (
						<div className="hidden md:flex items-center space-x-3 text-sm text-muted-foreground w-full max-w-2xl mx-auto">
							<span className="text-xs font-mono min-w-[35px]">
								{formatTime(getCurrentPosition() / 1000)}
							</span>
							<button
								type="button"
								className="flex-1 relative cursor-pointer group bg-transparent border-none p-0 outline-none"
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
									className="h-2 bg-muted/50"
								/>
								<div
									className="absolute top-0 left-0 h-2 gradient-primary rounded-full transition-all"
									style={{
										width: `${
											isSeeking
												? (seekPosition / track.duration) * 100
												: progressPercentage
										}%`,
									}}
								/>
								{/* Hover indicator */}
								<div
									className="absolute top-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -translate-y-1/2"
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
							<span className="text-xs font-mono min-w-[35px]">
								{formatTime(track.duration / 1000)}
							</span>
						</div>
					)}
				</div>

				{/* Volume Control - Extended */}
				<div className="hidden lg:flex items-center space-x-3 flex-1 justify-end max-w-xs">
					<VolumeIcon className="w-5 h-5 text-muted-foreground" />
					<div className="flex-1 max-w-64">
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
					<span className="text-xs text-muted-foreground w-10 font-mono">
						{localVolume[0]}%
					</span>
				</div>
			</div>
		</div>
	);
};
