"use client";

import { useState } from "react";
import { useWebSocket } from "./WebSocketProvider";

export const ConnectionPanel = () => {
	const { connected, userContext, connect, disconnect } = useWebSocket();
	const [userId, setUserId] = useState("");
	const [guildId, setGuildId] = useState("");

	const handleConnect = () => {
		if (userId.trim()) {
			connect(userId.trim());
		} else if (guildId.trim()) {
			connect(undefined, guildId.trim());
		}
	};

	const handleDisconnect = () => {
		disconnect();
		setUserId("");
		setGuildId("");
	};

	return (
		<div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
			<h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
				Connection
			</h2>

			{connected ? (
				<div className="space-y-4">
					<div className="flex items-center gap-2">
						{" "}
						<div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
						<span className="text-green-600 dark:text-green-400 font-medium">
							Connected
						</span>
					</div>

					{userContext.userId && (
						<div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
							<div className="text-sm">
								<span className="font-medium text-gray-700 dark:text-gray-300">
									User ID:
								</span>
								<span className="ml-2 text-gray-600 dark:text-gray-400">
									{userContext.userId}
								</span>
							</div>
							{userContext.guildId && (
								<div className="text-sm">
									<span className="font-medium text-gray-700 dark:text-gray-300">
										Guild ID:
									</span>
									<span className="ml-2 text-gray-600 dark:text-gray-400">
										{userContext.guildId}
									</span>
								</div>
							)}
							{userContext.voiceChannelId && (
								<div className="text-sm">
									<span className="font-medium text-gray-700 dark:text-gray-300">
										Voice Channel:
									</span>
									<span className="ml-2 text-gray-600 dark:text-gray-400">
										{userContext.voiceChannelId}
									</span>
								</div>
							)}
						</div>
					)}

					<button
						type="button"
						onClick={handleDisconnect}
						className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
					>
						Disconnect
					</button>
				</div>
			) : (
				<div className="space-y-4">
					<div className="flex items-center gap-2">
						<div className="w-3 h-3 bg-gray-400 rounded-full" />
						<span className="text-gray-500 dark:text-gray-400 font-medium">
							Disconnected
						</span>
					</div>

					<div className="space-y-3">
						<div>
							<label
								htmlFor="userId"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
							>
								User ID (Recommended)
							</label>
							<input
								id="userId"
								type="text"
								value={userId}
								onChange={(e) => setUserId(e.target.value)}
								placeholder="Enter your Discord User ID"
								className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
							<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
								The bot will automatically detect your guild and voice channel
							</p>
						</div>

						<div className="text-center text-gray-500 dark:text-gray-400 text-sm">
							or
						</div>

						<div>
							<label
								htmlFor="guildId"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
							>
								Guild ID (Alternative)
							</label>
							<input
								id="guildId"
								type="text"
								value={guildId}
								onChange={(e) => setGuildId(e.target.value)}
								placeholder="Enter Discord Server/Guild ID"
								className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
						</div>
					</div>

					<button
						type="button"
						onClick={handleConnect}
						disabled={!userId.trim() && !guildId.trim()}
						className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
					>
						Connect
					</button>
				</div>
			)}
		</div>
	);
};
