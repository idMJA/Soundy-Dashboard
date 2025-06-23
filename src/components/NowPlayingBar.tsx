"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import { useWebSocket } from "./WebSocketProvider";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";

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

export const NowPlayingBarShadcn = () => {
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
						type: "volume",
						volume: value[0],
						userId,
					};
					if (guildId) command.guildId = guildId;

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
			<div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-background border-t p-4">
				<div className="flex items-center justify-center text-muted-foreground">
					<span>No music playing</span>
				</div>
			</div>
		);
	}

	const progressPercentage = track.duration
		? ((track.position || 0) / track.duration) * 100
		: 0;

	return (
		<div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-card border-t border-border backdrop-blur-md">
			<div className="flex items-center justify-between p-4 gap-4">
				{/* Track Info */}
				<div className="flex items-center space-x-3 flex-1 min-w-0">
					{track.artwork && (
						<div className="w-12 h-12 rounded overflow-hidden bg-muted flex-shrink-0">
							<Image
								src={track.artwork}
								alt={`${track.title} artwork`}
								width={48}
								height={48}
								className="w-full h-full object-cover"
								unoptimized
							/>
						</div>
					)}
					<div className="min-w-0 flex-1">
						<h4 className="font-medium text-card-foreground truncate text-sm">
							{track.title}
						</h4>
						<p className="text-xs text-muted-foreground truncate">
							{track.author}
						</p>
					</div>
				</div>

				{/* Player Controls */}
				<div className="flex flex-col items-center space-y-2 flex-1">
					<div className="flex items-center space-x-2 sm:space-x-4">
						<Button
							onClick={handlePlayPause}
							disabled={isDisabled}
							size="sm"
							className="rounded-full w-8 h-8 sm:w-10 sm:h-10 p-0"
						>
							{playerState.playing ? (
								<PauseIcon className="w-4 h-4" />
							) : (
								<PlayIcon className="w-4 h-4" />
							)}
						</Button>

						<Button
							onClick={handleSkip}
							disabled={isDisabled}
							variant="ghost"
							size="sm"
							className="rounded-full w-6 h-6 sm:w-8 sm:h-8 p-0"
						>
							<SkipIcon className="w-3 h-3 sm:w-4 sm:h-4" />
						</Button>
					</div>

					{/* Progress Bar - Hidden on mobile */}
					{track.duration && (
						<div className="hidden md:flex items-center space-x-2 text-xs text-muted-foreground w-full max-w-md">
							<span className="text-xs">
								{formatTime((track.position || 0) / 1000)}
							</span>
							<div className="flex-1">
								<Progress value={progressPercentage} className="h-1" />
							</div>
							<span className="text-xs">
								{formatTime(track.duration / 1000)}
							</span>
						</div>
					)}
				</div>

				{/* Volume Control - Hidden on small screens */}
				<div className="hidden sm:flex items-center space-x-2 flex-1 justify-end">
					<VolumeIcon className="w-4 h-4 text-muted-foreground" />
					<div className="w-16 sm:w-24">
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
					<span className="text-xs text-muted-foreground w-8">
						{localVolume[0]}%
					</span>
				</div>
			</div>
		</div>
	);
};
