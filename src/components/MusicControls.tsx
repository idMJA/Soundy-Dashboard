"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useWebSocket } from "./WebSocketProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

// Import WebSocketCommand interface
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

const StopIcon = ({ className }: { className?: string }) => (
	<svg
		className={className || "w-5 h-5"}
		fill="currentColor"
		viewBox="0 0 24 24"
		aria-label="Stop"
	>
		<title>Stop</title>
		<path d="M6.25 5A1.25 1.25 0 0 0 5 6.25v11.5A1.25 1.25 0 0 0 6.25 19h11.5A1.25 1.25 0 0 0 19 17.75V6.25A1.25 1.25 0 0 0 17.75 5H6.25Z" />
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

export const MusicControlsShadcn = () => {
	const { connected, userContext, playerState, sendCommand } = useWebSocket();
	const [localVolume, setLocalVolume] = useState([playerState.volume]);
	const volumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Debounced volume change handler
	const handleVolumeChange = useCallback(
		(value: number[]) => {
			setLocalVolume(value);

			// Clear existing timeout
			if (volumeTimeoutRef.current) {
				clearTimeout(volumeTimeoutRef.current);
			}

			// Set new timeout to send command after 300ms of no changes
			volumeTimeoutRef.current = setTimeout(() => {
				const guildId = userContext.guildId;
				const userId = userContext.userId;

				console.log("Setting volume to:", value[0], "with context:", {
					guildId,
					userId,
				});

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

	// Sync local volume with player state when it changes from server
	useEffect(() => {
		setLocalVolume([playerState.volume]);
	}, [playerState.volume]);

	const handlePause = () => {
		const guildId = userContext.guildId;
		const userId = userContext.userId;

		if (userId) {
			const command: Record<string, unknown> = {
				type: "pause",
				userId,
			};
			if (guildId) command.guildId = guildId;

			sendCommand(command as WebSocketCommand);
		}
	};

	const handleResume = () => {
		const guildId = userContext.guildId;
		const userId = userContext.userId;

		if (userId) {
			const command: Record<string, unknown> = {
				type: "resume",
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

	const handleStop = () => {
		const guildId = userContext.guildId;
		const userId = userContext.userId;

		if (userId) {
			const command: Record<string, unknown> = {
				type: "stop",
				userId,
			};
			if (guildId) command.guildId = guildId;

			sendCommand(command as WebSocketCommand);
		}
	};

	const handleGetQueue = () => {
		const guildId = userContext.guildId;
		const userId = userContext.userId;

		if (userId) {
			const command: Record<string, unknown> = {
				type: "queue",
				userId,
			};
			if (guildId) command.guildId = guildId;

			sendCommand(command as WebSocketCommand);
		}
	};

	const isDisabled =
		!connected || (!userContext.guildId && !userContext.userId);

	return (
		<div className="space-y-6">
			{/* Player Controls */}
			<Card>
				<CardHeader>
					<CardTitle>Player Controls</CardTitle>
					{playerState.track && (
						<div className="text-sm text-muted-foreground">
							<p className="font-medium">{playerState.track.title}</p>
							<p>{playerState.track.author}</p>
						</div>
					)}
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Control Buttons */}
					<div className="flex items-center justify-center gap-4">
						<Button
							onClick={playerState.playing ? handlePause : handleResume}
							disabled={isDisabled}
							size="lg"
							className="rounded-full w-12 h-12"
						>
							{playerState.playing ? <PauseIcon /> : <PlayIcon />}
						</Button>
						<Button
							onClick={handleSkip}
							disabled={isDisabled}
							variant="outline"
							size="lg"
							className="rounded-full w-12 h-12"
						>
							<SkipIcon />
						</Button>
						<Button
							onClick={handleStop}
							disabled={isDisabled}
							variant="outline"
							size="lg"
							className="rounded-full w-12 h-12"
						>
							<StopIcon />
						</Button>
					</div>

					{/* Volume Control */}
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<Label className="flex items-center gap-2">
								<VolumeIcon className="w-4 h-4" />
								Volume
							</Label>
							<span className="text-sm text-muted-foreground">
								{localVolume[0]}%
							</span>
						</div>
						<Slider
							value={localVolume}
							onValueChange={handleVolumeChange}
							disabled={isDisabled}
							max={100}
							min={0}
							step={1}
							className="w-full"
						/>
					</div>
				</CardContent>
			</Card>

			{/* Queue */}
			<Card>
				<CardHeader>
					<div className="flex justify-between items-center">
						<CardTitle>Queue</CardTitle>
						<Button
							onClick={handleGetQueue}
							disabled={isDisabled}
							variant="outline"
							size="sm"
						>
							Refresh Queue
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					{playerState.queue.length > 0 ? (
						<div className="space-y-2">
							{playerState.queue.map((track, index) => (
								<div
									key={`${track.title}-${track.author}-${index}`}
									className="flex items-center justify-between p-3 bg-muted rounded-lg"
								>
									<div>
										<p className="font-medium">{track.title}</p>
										<p className="text-sm text-muted-foreground">
											{track.author}
										</p>
									</div>
									<Badge variant="secondary">{index + 1}</Badge>
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-8 text-muted-foreground">
							<div className="text-2xl mb-2">🎵</div>
							<p>No songs in queue</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
};
