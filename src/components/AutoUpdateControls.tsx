"use client";

import { useWebSocket } from "./WebSocketProvider";

export const AutoUpdateControls = () => {
	const {
		autoUpdateEnabled,
		toggleAutoUpdate,
		requestStatusAndQueue,
		connected,
		userContext,
		lastUpdateTime,
	} = useWebSocket();

	const isDisabled = !connected || !userContext.guildId;

	return (
		<div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg">
			<h4 className="text-md font-semibold mb-3 text-gray-900 dark:text-white">
				Auto Updates
			</h4>

			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<span className="text-sm text-gray-700 dark:text-gray-300">
							Auto Update
						</span>
						<div
							className={`w-2 h-2 rounded-full ${autoUpdateEnabled ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}
						/>
					</div>
					<button
						type="button"
						onClick={toggleAutoUpdate}
						disabled={isDisabled}
						className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
							autoUpdateEnabled ? "bg-blue-600" : "bg-gray-200"
						} ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
					>
						<span
							className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
								autoUpdateEnabled ? "translate-x-6" : "translate-x-1"
							}`}
						/>
					</button>
				</div>
				<div className="text-xs text-gray-500 dark:text-gray-400">
					{autoUpdateEnabled
						? "🔄 Updating every second"
						: "⏸️ Manual updates only"}
					{lastUpdateTime && (
						<div className="mt-1">
							Last: {lastUpdateTime.toLocaleTimeString()}
						</div>
					)}
				</div>

				<button
					type="button"
					onClick={requestStatusAndQueue}
					disabled={isDisabled}
					className="w-full px-3 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
				>
					Manual Update
				</button>
			</div>
		</div>
	);
};
