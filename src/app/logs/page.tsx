"use client";

import { useEffect, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWebSocket } from "@/components/WebSocketProvider";

export default function LogsPage() {
	const { logs, clearLogs } = useWebSocket();
	const logsEndRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
	});

	const keyedLogs = useMemo(() => {
		return logs.map((log, index) => ({
			id: `log-item-${index}-${log.substring(0, 15)}`,
			text: log,
		}));
	}, [logs]);

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
								{keyedLogs.map((item) => (
									<div key={item.id} className="text-green-400 break-words">
										{item.text}
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
