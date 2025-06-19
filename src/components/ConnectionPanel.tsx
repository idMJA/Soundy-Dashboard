"use client";

import { useWebSocket } from "./WebSocketProvider";

export const ConnectionPanel = () => {
	const { connected, userContext, disconnect } = useWebSocket();

	const handleLogin = () => {
		window.location.href = "/api/auth/login";
	};

	return (
		<div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
			<h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
				Connection
			</h2>

			{connected ? (
				<div className="space-y-4">
					<div className="flex items-center gap-2">
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
						onClick={disconnect}
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
					<div className="text-gray-500 dark:text-gray-400 text-sm">
						Please log in with Discord to connect.
					</div>
					<button
						type="button"
						onClick={handleLogin}
						className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
					>
						Login with Discord
					</button>
				</div>
			)}
		</div>
	);
};
