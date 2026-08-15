"use client";

import { Info, Music, User } from "lucide-react";
import { useWebSocket } from "./WebSocketProvider";

export const DebugPanel = () => {
	const { connected, userContext, playerState, autoUpdateEnabled } =
		useWebSocket();

	return (
		<div className="bg-zinc-950/60 border border-zinc-900/80 rounded-xl p-5 text-sm space-y-4">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 text-zinc-400 font-mono">
				<div className="flex justify-between items-center border-b border-zinc-900 pb-2">
					<span className="text-zinc-500">Connected:</span>
					<span
						className={`font-semibold ${connected ? "text-green-400" : "text-rose-400"}`}
					>
						{connected ? "Yes" : "No"}
					</span>
				</div>
				<div className="flex justify-between items-center border-b border-zinc-900 pb-2">
					<span className="text-zinc-500">Auto Update:</span>
					<span className="text-foreground">
						{autoUpdateEnabled ? "On" : "Off"}
					</span>
				</div>
				<div className="flex justify-between items-center border-b border-zinc-900 pb-2 col-span-1 md:col-span-2">
					<span className="text-zinc-500">User ID:</span>
					<span className="text-foreground truncate max-w-xs">
						{userContext.userId || "None"}
					</span>
				</div>
				<div className="flex justify-between items-center border-b border-zinc-900 pb-2 col-span-1 md:col-span-2">
					<span className="text-zinc-500">Guild ID:</span>
					<span className="text-foreground truncate max-w-xs">
						{userContext.guildId || "None"}
					</span>
				</div>
				<div className="flex justify-between items-center border-b border-zinc-900 pb-2 col-span-1 md:col-span-2">
					<span className="text-zinc-500">Voice Channel:</span>
					<span className="text-foreground truncate max-w-xs">
						{userContext.voiceChannelId || "None"}
					</span>
				</div>
				<div className="flex justify-between items-center border-b border-zinc-900 pb-2">
					<span className="text-zinc-500">Player Status:</span>
					<span
						className={`font-semibold ${playerState.playing ? "text-primary animate-pulse" : "text-zinc-500"}`}
					>
						{playerState.playing ? "Playing" : "Stopped"}
					</span>
				</div>
				<div className="flex justify-between items-center border-b border-zinc-900 pb-2">
					<span className="text-zinc-500">Volume:</span>
					<span className="text-foreground">{playerState.volume}%</span>
				</div>
				<div className="flex justify-between items-center border-b border-zinc-900 pb-2">
					<span className="text-zinc-500">Queue Length:</span>
					<span className="text-foreground">
						{playerState.queue.length} songs
					</span>
				</div>
			</div>

			{playerState.track && (
				<div className="bg-zinc-950/80 border border-zinc-900/60 rounded-lg p-3.5 space-y-1.5 font-mono">
					<div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
						Current Track:
					</div>
					<div className="text-xs text-foreground truncate font-semibold flex items-center gap-1.5">
						<Music className="w-3.5 h-3.5 text-primary" />{" "}
						{playerState.track.title}
					</div>
					<div className="text-xs text-zinc-400 truncate flex items-center gap-1.5">
						<User className="w-3.5 h-3.5 text-zinc-500" />{" "}
						{playerState.track.author}
					</div>
				</div>
			)}

			<div className="text-xs text-zinc-500 bg-zinc-900/10 p-2.5 rounded-lg border border-zinc-900/40 text-center flex items-center justify-center gap-1.5">
				<Info className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" /> Buttons
				work with just User ID, even without guild info
			</div>
		</div>
	);
};
