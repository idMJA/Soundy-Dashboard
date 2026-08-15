"use client";

import {
	ListMusic,
	MoreHorizontal,
	Music,
	Play,
	RefreshCw,
	Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MusicArtwork } from "./MusicArtwork";
import { useWebSocket } from "./WebSocketProvider";

interface WebSocketCommand {
	type: string;
	[key: string]: unknown;
}

export const RightSidebar: React.FC = () => {
	const router = useRouter();
	const {
		connected,
		userContext,
		playerState,
		sendCommand,
		availableGuilds,
		selectGuild,
	} = useWebSocket();
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

			setTimeout(() => setIsRefreshing(false), 1000);
		}
	};

	const isDisabled =
		!connected || (!userContext.guildId && !userContext.userId);

	const listeners =
		playerState?.listeners && playerState.listeners.length > 0
			? playerState.listeners.filter((l) => l.role !== "Soundy Bot")
			: [];

	return (
		<div className="w-full space-y-4">
			{/* Card 1: Currently Playing & Server Selector */}
			<div className="rounded-2xl bg-card border border-border overflow-hidden shadow-sm">
				<div className="relative aspect-square w-full overflow-hidden bg-muted">
					<MusicArtwork
						className="w-full h-full rounded-none"
						showControls={false}
						size="xl"
					/>

					{/* Dark gradient overlay with track details */}
					<div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-4">
						{playerState.track ? (
							<div className="space-y-1.5">
								<div className="flex items-center justify-between">
									<span className="text-[9px] font-bold text-primary tracking-widest uppercase">
										Now Playing
									</span>
									{connected && (
										<span className="text-[9px] font-mono font-bold tracking-wider text-primary uppercase bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
											Live
										</span>
									)}
								</div>

								<div className="text-left min-w-0">
									<h3
										className="font-bold text-base text-white truncate"
										title={playerState.track.title}
									>
										{playerState.track.title}
									</h3>
									<p className="text-xs text-white/80 truncate">
										{playerState.track.author}
									</p>
								</div>

								<div className="flex items-center gap-2 pt-1">
									{playerState.playing ? (
										<div className="flex items-center gap-1.5">
											<div className="playing-bars">
												<div className="bar" />
												<div className="bar" />
												<div className="bar" />
												<div className="bar" />
											</div>
											<span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
												Playing
											</span>
										</div>
									) : (
										<span className="text-[10px] text-white/60 font-medium uppercase tracking-wider">
											Paused
										</span>
									)}
								</div>
							</div>
						) : (
							<div className="text-left py-2">
								<p className="font-semibold text-sm text-white/70">
									No music playing
								</p>
							</div>
						)}
					</div>
				</div>

				{/* Active Server Selector Bar */}
				{availableGuilds && availableGuilds.length > 0 && (
					<div className="p-3 bg-muted/60 border-t border-border flex items-center justify-between gap-2">
						<span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex-shrink-0">
							Server:
						</span>
						<select
							value={userContext.guildId || ""}
							onChange={(e) => selectGuild(e.target.value)}
							className="flex-1 bg-background text-foreground text-xs font-semibold rounded-lg border border-border py-1 px-2 focus:outline-none focus:border-primary cursor-pointer truncate"
						>
							{availableGuilds
								.filter((g) => g.inVoiceChannel || g.id === userContext.guildId)
								.map((g) => (
									<option key={g.id} value={g.id}>
										{g.name} {g.inVoiceChannel ? "🔊" : ""}
									</option>
								))}
						</select>
					</div>
				)}
			</div>

			{/* Card 2: Up Next Queue Section */}
			<div className="rounded-2xl bg-card border border-border overflow-hidden shadow-sm">
				<div className="p-3.5 bg-transparent flex-shrink-0">
					<div className="flex items-center justify-between">
						<h2 className="text-xs font-bold flex items-center gap-1.5 text-card-foreground tracking-wider uppercase font-heading">
							Up Next
							{playerState.queue.length > 0 && (
								<Badge
									variant="secondary"
									className="text-[10px] font-bold font-mono px-1.5 py-0 h-4 rounded-full bg-muted border border-border text-foreground"
								>
									{playerState.queue.length}
								</Badge>
							)}
						</h2>

						<div className="flex items-center gap-0.5">
							<Button
								onClick={handleGetQueue}
								disabled={isDisabled || isRefreshing}
								variant="ghost"
								size="sm"
								className="h-7 w-7 p-0 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-all"
								title="Refresh Queue"
							>
								<RefreshCw
									className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`}
								/>
							</Button>
						</div>
					</div>
				</div>

				<ScrollArea className="max-h-[220px] px-2 custom-scrollbar">
					{playerState.queue.length > 0 ? (
						<div className="space-y-1 pb-3 pr-1">
							{playerState.queue.map((track, index) => (
								<div
									key={`${track.title}-${track.author}-${index}`}
									className="group flex items-center space-x-3 p-1.5 hover:bg-accent/50 rounded-xl transition-all duration-150 cursor-pointer"
								>
									{/* Track Number */}
									<div className="w-6 text-center flex-shrink-0">
										<span className="text-[11px] font-mono text-muted-foreground/50 group-hover:hidden">
											{index + 1}
										</span>
										<Button
											variant="ghost"
											size="sm"
											className="hidden group-hover:flex h-5 w-5 p-0 bg-primary text-primary-foreground hover:bg-primary/95 rounded-md flex-shrink-0 justify-center items-center mx-auto"
											title="Play this track"
										>
											<Play
												className="w-2.5 h-2.5 ml-0.5"
												fill="currentColor"
											/>
										</Button>
									</div>

									{/* Track Artwork */}
									<div className="flex-shrink-0">
										<Avatar className="h-8 w-8 rounded-lg overflow-hidden border border-border">
											<AvatarImage
												src={track.artwork}
												alt={`${track.title} artwork`}
												className="object-cover"
											/>
											<AvatarFallback className="rounded-lg bg-muted flex items-center justify-center">
												<Music className="w-3.5 h-3.5 text-primary" />
											</AvatarFallback>
										</Avatar>
									</div>

									{/* Track Info */}
									<div className="flex-1 min-w-0 text-left">
										<h4 className="font-bold text-xs truncate text-card-foreground group-hover:text-primary transition-colors">
											{track.title}
										</h4>
										<p className="text-[10px] text-muted-foreground truncate mt-0.5">
											{track.author}
										</p>
									</div>

									{/* More Options */}
									<Button
										variant="ghost"
										size="sm"
										className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
									>
										<MoreHorizontal className="w-3.5 h-3.5" />
									</Button>
								</div>
							))}
						</div>
					) : (
						<div className="flex flex-col items-center justify-center py-6 px-4 text-center">
							<div className="w-8 h-8 bg-muted rounded-xl flex items-center justify-center mb-1.5 border border-border">
								<ListMusic className="w-3.5 h-3.5 text-muted-foreground" />
							</div>
							<p className="font-bold text-xs text-foreground mb-0.5">
								Queue is empty
							</p>
							<p className="text-[10px] text-muted-foreground mb-2">
								Add tracks to get started
							</p>
							<Button
								variant="outline"
								size="sm"
								className="border-border text-[10px] font-bold rounded-lg px-2.5 h-6 hover:bg-accent hover:text-primary transition-all bg-transparent"
								onClick={() => {
									router.push("/search");
								}}
							>
								<Music className="w-3 h-3 mr-1" />
								Browse Music
							</Button>
						</div>
					)}
				</ScrollArea>
			</div>

			{/* Card 3: Voice Listeners (Bottom Right - Standalone Card) */}
			<div className="rounded-2xl bg-card border border-border overflow-hidden shadow-sm p-3.5 space-y-3">
				<div className="flex items-center justify-between">
					<h2 className="text-xs font-bold flex items-center gap-1.5 text-card-foreground tracking-wider uppercase font-heading">
						<Users className="w-3.5 h-3.5 text-primary" />
						Voice Listeners
					</h2>
					<Badge
						variant="secondary"
						className="text-[10px] font-bold font-mono px-1.5 py-0 h-4 rounded-full bg-primary/10 border border-primary/20 text-primary"
					>
						{listeners.length} Users
					</Badge>
				</div>

				{listeners.length > 0 ? (
					<div className="space-y-1.5">
						{listeners.map((user) => (
							<div
								key={user.id}
								className="flex items-center justify-between p-2 rounded-xl bg-muted/50 border border-border/60"
							>
								<div className="flex items-center gap-2.5 min-w-0">
									<Avatar className="h-7 w-7 border border-primary/30 shrink-0">
										<AvatarImage src={user.avatar || undefined} />
										<AvatarFallback className="text-[10px]">
											{user.name[0]}
										</AvatarFallback>
									</Avatar>
									<div className="min-w-0 text-left">
										<p className="text-xs font-semibold text-foreground truncate">
											{user.name}
										</p>
										<p className="text-[10px] text-muted-foreground truncate">
											{user.role}
										</p>
									</div>
								</div>
								<div className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
							</div>
						))}
					</div>
				) : (
					<p className="text-[11px] text-muted-foreground text-left italic">
						No active listeners in voice channel
					</p>
				)}
			</div>
		</div>
	);
};
