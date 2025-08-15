"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import { useWebSocket } from "./WebSocketProvider";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { LyricsDialog } from "./LyricsDialog";

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
	const volumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Sync local volume with player state
	useEffect(() => {
		setLocalVolume([playerState.volume]);
	}, [playerState.volume]);

	// Debounced volume change handler
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

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	const isDisabled =
		!connected || (!userContext.guildId && !userContext.userId);
	const track = playerState.track;

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

	const progressPercentage = track.duration
		? ((track.position || 0) / track.duration) * 100
		: 0;

	return (
		<div className="fixed bottom-0 left-0 lg:left-64 right-0 glass border-t border-border/50 backdrop-blur-xl shadow-modern-xl animate-slide-up">
			<div className="flex items-center justify-between p-6 gap-6">
				{/* Track Info */}
				<div className="flex items-center space-x-4 flex-1 min-w-0">
					<div className="relative">
						{track.artwork ? (
							<div className="w-14 h-14 rounded-xl overflow-hidden bg-muted flex-shrink-0 shadow-lg relative">
								<Image
									src={track.artwork}
									alt={`${track.title} artwork`}
									width={56}
									height={56}
									className="w-full h-full object-cover"
									unoptimized
								/>
								{playerState.playing && (
									<div className="absolute inset-0 bg-black/20 flex items-center justify-center">
										<div className="playing-bars">
											<div className="bar bg-white"></div>
											<div className="bar bg-white"></div>
											<div className="bar bg-white"></div>
											<div className="bar bg-white"></div>
										</div>
									</div>
								)}
							</div>
						) : (
							<div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 shadow-lg">
								<div className="text-2xl">🎵</div>
							</div>
						)}
					</div>
					<div className="min-w-0 flex-1">
						<h4 className="font-semibold text-card-foreground truncate text-base">
							{track.title}
						</h4>
						<p className="text-sm text-muted-foreground truncate">
							{track.author}
						</p>
						{playerState.playing && (
							<div className="flex items-center gap-2 mt-1">
								<div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
								<span className="text-xs text-primary font-medium">
									Now Playing
								</span>
							</div>
						)}
					</div>
				</div>

				{/* Player Controls */}
				<div className="flex flex-col items-center space-y-3 flex-1 max-w-md">
					<div className="flex items-center space-x-4">
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

						<LyricsDialog />
					</div>

					{/* Progress Bar */}
					{track.duration && (
						<div className="hidden md:flex items-center space-x-3 text-sm text-muted-foreground w-full max-w-md">
							<span className="text-xs font-mono min-w-[35px]">
								{formatTime((track.position || 0) / 1000)}
							</span>
							<div className="flex-1 relative">
								<Progress
									value={progressPercentage}
									className="h-2 bg-muted/50"
								/>
								<div
									className="absolute top-0 left-0 h-2 gradient-primary rounded-full transition-all"
									style={{ width: `${progressPercentage}%` }}
								/>
							</div>
							<span className="text-xs font-mono min-w-[35px]">
								{formatTime(track.duration / 1000)}
							</span>
						</div>
					)}
				</div>

				{/* Volume Control */}
				<div className="hidden lg:flex items-center space-x-3 flex-1 justify-end max-w-32">
					<VolumeIcon className="w-5 h-5 text-muted-foreground" />
					<div className="flex-1 max-w-24">
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
