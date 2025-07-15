"use client";

import { useWebSocket } from "@/components/WebSocketProvider";
import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LogsPage() {
	const { logs, clearLogs } = useWebSocket();
	const logsEndRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
	});

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>WebSocket Logs</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex justify-between items-center mb-4">
						<h3 className="text-lg font-semibold">Connection Logs</h3>
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
				</CardContent>
			</Card>
		</div>
	);
}
