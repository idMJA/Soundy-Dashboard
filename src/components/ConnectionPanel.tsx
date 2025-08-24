"use client";

import { useWebSocket } from "./WebSocketProvider";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/router";

export const ConnectionPanel = () => {
	const router = useRouter();
	const { connected, userContext, disconnect } = useWebSocket();

	const handleLogin = () => {
		router.push("/api/auth/login");
	};

	return (
		<Card className="w-full max-w-md mx-auto">
			<CardHeader>
				<CardTitle>Connection</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{connected ? (
					<>
						<div className="flex items-center gap-2">
							<span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
							<Badge
								variant="secondary"
								className="text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900 border-none"
							>
								Connected
							</Badge>
						</div>
						<Separator />
						{userContext.userId && (
							<div className="flex items-center gap-3">
								<Avatar>
									{userContext.avatar ? (
										<AvatarImage
											src={userContext.avatar}
											alt={userContext.globalName || "User"}
										/>
									) : (
										<AvatarFallback>
											{userContext.globalName ? userContext.globalName[0] : "U"}
										</AvatarFallback>
									)}
								</Avatar>
								<div className="space-y-0.5">
									<div className="font-semibold text-base text-foreground">
										{userContext.globalName || "User"}
									</div>
									<div className="text-xs text-muted-foreground break-all">
										ID: {userContext.userId}
									</div>
									{userContext.guildId && (
										<div className="text-xs text-muted-foreground break-all">
											Guild: {userContext.guildId}
										</div>
									)}
									{userContext.voiceChannelId && (
										<div className="text-xs text-muted-foreground break-all">
											Voice Channel: {userContext.voiceChannelId}
										</div>
									)}
								</div>
							</div>
						)}
						<Button
							variant="destructive"
							className="w-full mt-2"
							onClick={disconnect}
						>
							Disconnect
						</Button>
					</>
				) : (
					<>
						<div className="flex items-center gap-2">
							<span className="w-3 h-3 bg-border rounded-full" />
							<Badge
								variant="outline"
								className="text-muted-foreground border-border"
							>
								Disconnected
							</Badge>
						</div>
						<Separator />
						<div className="text-muted-foreground text-sm">
							Please log in with Discord to connect.
						</div>
						<Button variant="default" className="w-full" onClick={handleLogin}>
							Login with Discord
						</Button>
					</>
				)}
			</CardContent>
		</Card>
	);
};
