"use client";

import { useState } from "react";
import { useWebSocket } from "./WebSocketProvider";
import { MusicArtwork } from "./MusicArtwork";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Music,
	RefreshCw,
	MoreHorizontal,
	Play,
	Pause,
	Volume2,
	ListMusic,
	Shuffle,
	Repeat,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WebSocketCommand {
	type: string;
	[key: string]: unknown;
}

export const RightSidebar: React.FC = () => {
	const { connected, userContext, playerState, sendCommand } = useWebSocket();
	const [isRefreshing, setIsRefreshing] = useState(false);

	const handleGetQueue = async () => {
		const guildId = userContext.guildId;
		const userId = userContext.userId;

		if (userId) {
			setIsRefreshing(true);
			const command: Record<string, unknown> = {
				type: "queue",
				userId,
			};
			if (guildId) command.guildId = guildId;
			sendCommand(command as WebSocketCommand);

			// Reset refresh state after a delay
			setTimeout(() => setIsRefreshing(false), 1000);
		}
	};

	const isDisabled =
		!connected || (!userContext.guildId && !userContext.userId);

	return (
		<div className="w-80 flex flex-col h-full bg-gradient-to-b from-card to-card/95 border-l border-border/50 shadow-lg rounded-l-2xl">
			{/* Header with Now Playing */}
			<div className="p-6 border-b border-border/30 bg-gradient-to-r from-primary/5 to-transparent rounded-tl-2xl">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-lg font-bold flex items-center gap-2 text-card-foreground">
						<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
							<Music className="w-4 h-4 text-primary" />
						</div>
						Now Playing
					</h2>
					{playerState.playing && (
						<div className="flex items-center gap-0.5">
							<div
								className="w-1 h-4 bg-primary rounded-full animate-pulse"
								style={{ animationDelay: "0ms" }}
							/>
							<div
								className="w-1 h-3 bg-primary rounded-full animate-pulse"
								style={{ animationDelay: "150ms" }}
							/>
							<div
								className="w-1 h-5 bg-primary rounded-full animate-pulse"
								style={{ animationDelay: "300ms" }}
							/>
						</div>
					)}
				</div>

				{/* Album Artwork */}
				<div className="mb-6">
					<MusicArtwork
						className="w-full rounded-xl shadow-modern"
						showControls={true}
						size="xl"
					/>
				</div>

				{/* Track Info */}
				{playerState.track ? (
					<div className="text-center space-y-3">
						<div>
							<h3 className="font-bold text-lg truncate text-card-foreground">
								{playerState.track.title}
							</h3>
							<p className="text-muted-foreground truncate flex items-center justify-center gap-1">
								<Volume2 className="w-3 h-3" />
								{playerState.track.author}
							</p>
						</div>

						<div className="flex items-center justify-center gap-2">
							<Badge
								variant={playerState.playing ? "default" : "secondary"}
								className={cn(
									"px-3 py-1 flex items-center gap-1.5 transition-all",
									playerState.playing
										? "bg-primary text-primary-foreground shadow-lg animate-pulse"
										: "bg-muted text-muted-foreground",
								)}
							>
								{playerState.playing ? (
									<>
										<Pause className="w-3 h-3" />
										Playing
									</>
								) : (
									<>
										<Play className="w-3 h-3" />
										Paused
									</>
								)}
							</Badge>

							{connected && (
								<Badge variant="outline" className="px-2 py-1 text-xs">
									<div className="w-2 h-2 rounded-full bg-green-500 mr-1 animate-pulse" />
									Live
								</Badge>
							)}
						</div>
					</div>
				) : (
					<div className="text-center py-6 space-y-3">
						<div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto">
							<Music className="w-8 h-8 text-primary" />
						</div>
						<div>
							<p className="font-medium text-card-foreground">
								No music playing
							</p>
							<p className="text-muted-foreground text-sm mt-1">
								Start a song to see it here
							</p>
						</div>
					</div>
				)}
			</div>

			{/* Queue Section */}
			<div className="flex-1 flex flex-col">
				<div className="p-4 border-b border-border/30 bg-gradient-to-r from-transparent to-primary/5">
					<div className="flex items-center justify-between">
						<h2 className="text-lg font-bold flex items-center gap-2 text-card-foreground">
							<div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
								<ListMusic className="w-4 h-4 text-primary" />
							</div>
							Queue
							{playerState.queue.length > 0 && (
								<Badge variant="secondary" className="ml-2 text-xs">
									{playerState.queue.length}
								</Badge>
							)}
						</h2>

						<div className="flex items-center gap-1">
							<Button
								variant="ghost"
								size="sm"
								className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
								title="Shuffle"
							>
								<Shuffle className="w-4 h-4" />
							</Button>
							<Button
								variant="ghost"
								size="sm"
								className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
								title="Repeat"
							>
								<Repeat className="w-4 h-4" />
							</Button>
							<Button
								onClick={handleGetQueue}
								disabled={isDisabled || isRefreshing}
								variant="ghost"
								size="sm"
								className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
								title="Refresh Queue"
							>
								<RefreshCw
									className={cn("w-4 h-4", isRefreshing && "animate-spin")}
								/>
							</Button>
						</div>
					</div>
				</div>

				<ScrollArea className="flex-1 px-4 custom-scrollbar">
					{playerState.queue.length > 0 ? (
						<div className="space-y-1 py-3">
							{playerState.queue.map((track, index) => (
								<div
									key={`${track.title}-${track.author}-${index}`}
									className="group flex items-center space-x-3 p-3 hover:bg-gradient-to-r hover:from-accent/50 hover:to-transparent rounded-lg transition-all duration-200 cursor-pointer border border-transparent hover:border-border/30"
								>
									{/* Track Number / Play Button */}
									<div className="w-6 text-center flex-shrink-0">
										<span className="text-sm text-muted-foreground group-hover:hidden">
											{index + 1}
										</span>
										<Button
											variant="ghost"
											size="sm"
											className="hidden group-hover:flex h-6 w-6 p-0 hover:bg-primary hover:text-primary-foreground"
											title="Play this track"
										>
											<Play className="w-3 h-3" />
										</Button>
									</div>

									{/* Track Artwork */}
									<div className="flex-shrink-0">
										<Avatar className="h-10 w-10 rounded-md shadow-sm">
											<AvatarImage
												src={track.artwork}
												alt={`${track.title} artwork`}
												className="object-cover"
											/>
											<AvatarFallback className="rounded-md bg-gradient-to-br from-primary/10 to-primary/5">
												<Music className="w-4 h-4 text-primary" />
											</AvatarFallback>
										</Avatar>
									</div>

									{/* Track Info */}
									<div className="flex-1 min-w-0">
										<h4 className="font-medium text-sm truncate text-card-foreground group-hover:text-primary transition-colors">
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
										className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 hover:bg-muted"
									>
										<MoreHorizontal className="w-3 h-3" />
									</Button>
								</div>
							))}
						</div>
					) : (
						<div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
							<div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center mb-4">
								<ListMusic className="w-10 h-10 text-primary/50" />
							</div>
							<div className="text-center space-y-2">
								<p className="font-medium">No songs in queue</p>
								<p className="text-sm">Add some music to get started</p>
							</div>
							<Button
								variant="outline"
								size="sm"
								className="mt-4 hover:bg-primary hover:text-primary-foreground"
								onClick={() => {
									window.location.href = "/search";
								}}
							>
								<Music className="w-4 h-4 mr-2" />
								Browse Music
							</Button>
						</div>
					)}
				</ScrollArea>
			</div>
		</div>
	);
};
