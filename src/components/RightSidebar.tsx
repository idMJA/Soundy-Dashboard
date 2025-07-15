"use client";

import { MusicArtwork } from "./MusicArtwork";
import { useWebSocket } from "./WebSocketProvider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RefreshCw, Music, Clock, MoreHorizontal } from "lucide-react";

interface WebSocketCommand {
	type: string;
	[key: string]: unknown;
}

export const RightSidebar: React.FC = () => {
	const { connected, userContext, playerState, sendCommand } = useWebSocket();

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
		<div className="w-80 flex flex-col h-full bg-card border-l border-border">
			{/* Now Playing Section */}
			<div className="p-4 border-b border-border">
				<h2 className="text-lg font-semibold mb-4 flex items-center">
					<Music className="w-5 h-5 mr-2" />
					Now Playing
				</h2>

				{/* Album Artwork */}
				<div className="mb-4">
					<MusicArtwork className="w-full" />
				</div>

				{/* Track Info */}
				{playerState.track ? (
					<div className="text-center mb-4">
						<h3 className="font-semibold text-lg truncate">
							{playerState.track.title}
						</h3>
						<p className="text-muted-foreground truncate">
							{playerState.track.author}
						</p>
						<Badge
							variant={playerState.playing ? "default" : "secondary"}
							className="mt-2"
						>
							{playerState.playing ? "Playing" : "Paused"}
						</Badge>
					</div>
				) : (
					<div className="text-center mb-4 py-4">
						<div className="text-2xl mb-2">🎵</div>
						<p className="text-muted-foreground text-sm">No music playing</p>
					</div>
				)}
			</div>

			{/* Queue Section */}
			<div className="flex-1 flex flex-col">
				<div className="p-4 border-b border-border">
					<div className="flex items-center justify-between mb-3">
						<h2 className="text-lg font-semibold flex items-center">
							<Clock className="w-5 h-5 mr-2" />
							Queue
						</h2>
						<Button
							onClick={handleGetQueue}
							disabled={isDisabled}
							variant="ghost"
							size="sm"
							className="h-8 w-8 p-0"
						>
							<RefreshCw className="w-4 h-4" />
						</Button>
					</div>
				</div>

				<ScrollArea className="flex-1 px-4">
					{playerState.queue.length > 0 ? (
						<div className="space-y-2 py-2">
							{playerState.queue.map((track, index) => (
								<div
									key={`${track.title}-${track.author}-${index}`}
									className="group flex items-center space-x-3 p-2 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer"
								>
									{/* Track Number */}
									<div className="w-6 text-center flex-shrink-0">
										<span className="text-sm text-muted-foreground">
											{index + 1}
										</span>
									</div>

									{/* Track Info */}
									<div className="flex-1 min-w-0">
										<h4 className="font-medium text-sm truncate">
											{track.title}
										</h4>
										<p className="text-xs text-muted-foreground truncate">
											{track.author}
										</p>
									</div>

									{/* More Options */}
									<Button
										variant="ghost"
										size="sm"
										className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
									>
										<MoreHorizontal className="w-3 h-3" />
									</Button>
								</div>
							))}
						</div>
					) : (
						<div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
							<div className="text-3xl mb-2">🎵</div>
							<p className="text-sm">No songs in queue</p>
							<p className="text-xs mt-1">Add some music to get started</p>
						</div>
					)}
				</ScrollArea>
			</div>
		</div>
	);
};
