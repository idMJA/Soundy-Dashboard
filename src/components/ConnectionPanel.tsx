"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useWebSocket } from "./WebSocketProvider";

export const ConnectionPanel = () => {
	const { connected, userContext, disconnect, availableGuilds, selectGuild } =
		useWebSocket();

	const handleLogin = () => {
		window.location.href = "/api/auth/login";
	};

	return (
		<div className="space-y-4">
			{connected ? (
				<>
					<div className="flex items-center gap-2">
						<span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
						<Badge
							variant="secondary"
							className="text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 border-none"
						>
							Connected
						</Badge>
					</div>
					<Separator className="bg-zinc-800/60" />
					{userContext.userId && (
						<div className="flex items-center gap-3">
							<Avatar className="w-12 h-12 border border-zinc-800">
								{userContext.avatar ? (
									<AvatarImage
										src={userContext.avatar}
										alt={userContext.globalName || "User"}
									/>
								) : (
									<AvatarFallback className="bg-zinc-900 text-zinc-400">
										{userContext.globalName ? userContext.globalName[0] : "U"}
									</AvatarFallback>
								)}
							</Avatar>
							<div className="space-y-1">
								<div className="font-semibold text-sm text-foreground">
									{userContext.globalName || "User"}
								</div>
								<div className="text-xs text-muted-foreground font-mono bg-zinc-950 px-2 py-0.5 rounded border border-zinc-900">
									ID: {userContext.userId}
								</div>
								{availableGuilds && availableGuilds.length > 0 ? (
									<div className="space-y-1">
										<label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex flex-col gap-1">
											<span>Active Server</span>
											<select
												value={userContext.guildId || ""}
												onChange={(e) => selectGuild(e.target.value)}
												className="w-full bg-zinc-950 text-foreground text-xs rounded border border-zinc-800 p-2 font-medium focus:outline-none focus:border-zinc-700 cursor-pointer"
											>
												{availableGuilds
													.filter(
														(g) =>
															g.inVoiceChannel || g.id === userContext.guildId,
													)
													.map((g) => (
														<option key={g.id} value={g.id}>
															{g.name} {g.inVoiceChannel ? "🔊" : ""}
														</option>
													))}
											</select>
										</label>
									</div>
								) : userContext.guildId ? (
									<div className="text-xs text-muted-foreground font-mono bg-zinc-950 px-2 py-0.5 rounded border border-zinc-900">
										Guild: {userContext.guildId}
									</div>
								) : null}
								{userContext.voiceChannelId && (
									<div className="text-xs text-muted-foreground font-mono bg-zinc-950 px-2 py-0.5 rounded border border-zinc-900">
										Voice Channel: {userContext.voiceChannelId}
									</div>
								)}
							</div>
						</div>
					)}
					<Button
						variant="destructive"
						className="w-full mt-2 rounded-xl"
						onClick={disconnect}
					>
						Disconnect
					</Button>
				</>
			) : (
				<>
					<div className="flex items-center gap-2">
						<span className="w-3 h-3 bg-zinc-800 rounded-full" />
						<Badge
							variant="outline"
							className="text-muted-foreground border-zinc-800"
						>
							Disconnected
						</Badge>
					</div>
					<Separator className="bg-zinc-800/60" />
					<div className="text-muted-foreground text-sm">
						Please log in with Discord to connect.
					</div>
					<Button
						variant="default"
						className="w-full rounded-xl"
						onClick={handleLogin}
					>
						Login with Discord
					</Button>
				</>
			)}
		</div>
	);
};
