"use client";

import { useWebSocket } from "./WebSocketProvider";

export const DebugPanel = () => {
	const { connected, userContext, playerState, autoUpdateEnabled } =
		useWebSocket();

	return (
		<div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-sm">
			<h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
				Debug Info
			</h4>{" "}
			<div className="space-y-1 text-yellow-700 dark:text-yellow-300">
				<div>
					Connected:{" "}
					<span className="font-mono">{connected ? "Yes" : "No"}</span>
				</div>
				<div>
					Auto Update:{" "}
					<span className="font-mono">
						{autoUpdateEnabled ? "🔄 On" : "⏸️ Off"}
					</span>
				</div>
				<div>
					User ID:{" "}
					<span className="font-mono">{userContext.userId || "None"}</span>
				</div>
				<div>
					Guild ID:{" "}
					<span className="font-mono">{userContext.guildId || "None"}</span>
				</div>
				<div>
					Voice Channel:{" "}
					<span className="font-mono">
						{userContext.voiceChannelId || "None"}
					</span>
				</div>
				<div>
					Player Status:{" "}
					<span className="font-mono">
						{playerState.playing ? "Playing" : "Stopped"}
					</span>
				</div>
				<div>
					Volume: <span className="font-mono">{playerState.volume}%</span>
				</div>
				<div>
					Queue:{" "}
					<span className="font-mono">{playerState.queue.length} songs</span>
				</div>
				{playerState.track && (
					<div className="border-t border-yellow-300 dark:border-yellow-700 pt-2 mt-2">
						<div className="text-xs font-semibold">Current Track:</div>
						<div className="text-xs truncate">🎵 {playerState.track.title}</div>
						<div className="text-xs truncate">
							👤 {playerState.track.author}
						</div>
					</div>
				)}
				<div className="mt-2 text-xs">
					ℹ️ Buttons work with just User ID, even without guild info
				</div>
			</div>
		</div>
	);
};
