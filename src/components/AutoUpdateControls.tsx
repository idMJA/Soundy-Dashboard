"use client";

import { useWebSocket } from "./WebSocketProvider";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

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
		<Card className="w-full max-w-md mx-auto">
			<CardHeader>
				<CardTitle>Auto Updates</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<span className="text-sm text-foreground">Auto Update</span>
						<span
							className={`w-2 h-2 rounded-full ${autoUpdateEnabled ? "bg-green-500 animate-pulse" : "bg-border"}`}
						/>
					</div>
					<Switch
						checked={autoUpdateEnabled}
						onCheckedChange={toggleAutoUpdate}
						disabled={isDisabled}
						aria-label="Toggle auto update"
					/>
				</div>
				<Separator />
				<div className="text-xs text-muted-foreground">
					{autoUpdateEnabled
						? "🔄 Updating every second"
						: "⏸️ Manual updates only"}
					{lastUpdateTime && (
						<div className="mt-1">
							Last: {lastUpdateTime.toLocaleTimeString()}
						</div>
					)}
				</div>
				<Button
					variant="secondary"
					className="w-full"
					onClick={requestStatusAndQueue}
					disabled={isDisabled}
				>
					Manual Update
				</Button>
			</CardContent>
		</Card>
	);
};
