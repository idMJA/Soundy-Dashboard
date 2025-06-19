"use client";

import { useWebSocket } from "./WebSocketProvider";
import { useEffect, useRef } from "react";

export const LogsPanel = () => {
	const { logs, clearLogs } = useWebSocket();
	const logsEndRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
	});

	return (
		<div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
			<div className="flex justify-between items-center mb-4">
				<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
					Connection Logs
				</h3>
				<button
					type="button"
					onClick={clearLogs}
					className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors"
				>
					Clear
				</button>
			</div>

			<div className="bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
				{logs.length === 0 ? (
					<p className="text-gray-500">No logs yet...</p>
				) : (
					<div className="space-y-1">
						{logs.map((log) => (
							<div
								key={`${log}-${Date.now()}-${Math.random()}`}
								className="text-green-400 break-words"
							>
								{log}
							</div>
						))}
						<div ref={logsEndRef} />
					</div>
				)}
			</div>
		</div>
	);
};
