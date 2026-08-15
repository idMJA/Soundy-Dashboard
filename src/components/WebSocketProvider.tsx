"use client";

import type React from "react";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";

interface UserContext {
	guildId?: string;
	voiceChannelId?: string;
	userId?: string;
	avatar?: string;
	globalName?: string;
}

interface UserGuild {
	id: string;
	name: string;
	icon: string | null;
	inVoiceChannel?: boolean;
}

interface Track {
	title: string;
	author: string;
	duration: number;
	uri?: string;
	artwork?: string;
	isStream?: boolean;
	position?: number;
	albumName: string;
}

interface PlayerState {
	playing: boolean;
	track?: Track;
	queue: Track[];
	volume: number;
	listeners?: Array<{
		id: string;
		name: string;
		avatar: string | null;
		role: string;
	}>;
}

interface WebSocketCommand {
	type: string;
	[key: string]: unknown;
}

interface WebSocketContextType {
	ws: WebSocket | null;
	connected: boolean;
	userContext: UserContext;
	playerState: PlayerState;
	logs: string[];
	autoUpdateEnabled: boolean;
	lastUpdateTime: Date | null;
	availableGuilds: UserGuild[];
	connect: (
		userId?: string,
		guildId?: string,
		avatar?: string,
		globalName?: string,
		token?: string,
	) => void;
	disconnect: () => void;
	sendCommand: (command: WebSocketCommand) => void;
	clearLogs: () => void;
	toggleAutoUpdate: () => void;
	requestStatusAndQueue: () => void;
	selectGuild: (guildId: string) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const useWebSocket = () => {
	const context = useContext(WebSocketContext);
	if (!context) {
		throw new Error("useWebSocket must be used within a WebSocketProvider");
	}
	return context;
};

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [ws, setWs] = useState<WebSocket | null>(null);
	const [connected, setConnected] = useState(false);
	const [userContext, setUserContext] = useState<UserContext>({});
	const [availableGuilds, setAvailableGuilds] = useState<UserGuild[]>([]);
	const [playerState, setPlayerState] = useState<PlayerState>({
		playing: false,
		queue: [],
		volume: 50,
	});
	const [logs, setLogs] = useState<string[]>([]);
	const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(true);
	const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
	const lastConnectedUserId = useRef<string | undefined>(undefined);

	const addLog = useCallback((message: string) => {
		setLogs((prev) => [
			...prev.slice(-49),
			`${new Date().toLocaleTimeString()}: ${message}`,
		]);
	}, []);
	const clearLogs = useCallback(() => {
		setLogs([]);
	}, []);

	const requestStatusAndQueue = useCallback(() => {
		if (ws && ws.readyState === WebSocket.OPEN && userContext.guildId) {
			setLastUpdateTime(new Date());

			ws.send(JSON.stringify({ type: "status", guildId: userContext.guildId }));

			if (userContext.userId) {
				const queueCommand: Record<string, unknown> = {
					type: "queue",
					userId: userContext.userId,
				};
				if (userContext.guildId) queueCommand.guildId = userContext.guildId;
				ws.send(JSON.stringify(queueCommand));
			}
		}
	}, [ws, userContext.guildId, userContext.userId]);
	const sendCommand = useCallback(
		(command: WebSocketCommand) => {
			console.log("WebSocket sendCommand called:", {
				command,
				wsState: ws?.readyState,
				connected: ws && ws.readyState === WebSocket.OPEN,
			});
			if (ws && ws.readyState === WebSocket.OPEN) {
				ws.send(JSON.stringify(command));
				addLog(`Sent: ${JSON.stringify(command)}`);
				console.log("Command sent successfully");
			} else {
				addLog("WebSocket not connected");
				console.log("WebSocket not ready:", {
					ws: !!ws,
					readyState: ws?.readyState,
				});
			}
		},
		[ws, addLog],
	);

	const disconnectWebSocketOnly = useCallback(() => {
		if (ws) {
			ws.close();
			setWs(null);
		}
		setUserContext({});
	}, [ws]);

	const connect = useCallback(
		(
			userId?: string,
			guildId?: string,
			avatar?: string,
			globalName?: string,
			token?: string,
			guildsPayload?: unknown[],
		) => {
			if (
				lastConnectedUserId.current === userId &&
				ws &&
				ws.readyState === WebSocket.OPEN
			) {
				addLog(`Already connected to userId: ${userId}, skipping reconnection`);
				return;
			}

			if (ws && ws.readyState === WebSocket.CONNECTING) {
				addLog("WebSocket already connecting, please wait...");
				return;
			}

			lastConnectedUserId.current = userId;
			if (ws && ws.readyState === WebSocket.OPEN) {
				addLog("Closing existing WebSocket connection");
				ws.close();
			}
			try {
				addLog(`Attempting to connect with userId: ${userId}`);
				const wsUrl = token
					? `${process.env.NEXT_PUBLIC_WS_URL}/ws?token=${token}`
					: `${process.env.NEXT_PUBLIC_WS_URL}/ws`;
				const newWs = new WebSocket(wsUrl);
				newWs.onopen = () => {
					setConnected(true);
					addLog("Connected to WebSocket");

					if (userId) {
						storedGuildsRef.current = guildsPayload || [];
						newWs.send(
							JSON.stringify({
								type: "user-connect",
								userId,
								guilds: guildsPayload || [],
							}),
						);
						addLog(
							`Sent user-connect for userId: ${userId} with ${guildsPayload?.length || 0} guilds`,
						);
						setUserContext((prev) => ({
							...prev,
							...(userId ? { userId } : {}),
							...(avatar ? { avatar } : {}),
							...(globalName ? { globalName } : {}),
						}));
					} else if (guildId) {
						newWs.send(JSON.stringify({ type: "join", guildId }));
						addLog(`Sent join for guildId: ${guildId}`);
						setUserContext((prev) => ({
							...prev,
							...(guildId ? { guildId } : {}),
						}));
					}
				};
				newWs.onmessage = (event) => {
					try {
						const data = JSON.parse(event.data);
						addLog(`Received: ${JSON.stringify(data)}`);
						switch (data.type) {
							case "user-connect":
								if (data.success) {
									setUserContext((prev) => ({
										...prev,
										guildId: data.activeGuildId || data.guildId || prev.guildId,
										voiceChannelId: data.voiceChannelId || prev.voiceChannelId,
										userId: data.userId || prev.userId,
										avatar: data.avatar || prev.avatar,
										globalName: data.globalName || prev.globalName,
									}));
									if (Array.isArray(data.guilds)) {
										setAvailableGuilds((prev) => {
											const mergedMap = new Map<string, UserGuild>();
											for (const g of prev) mergedMap.set(g.id, g);
											for (const g of data.guilds) mergedMap.set(g.id, g);
											return Array.from(mergedMap.values());
										});
									}
									addLog(
										`User context updated: Guild ${data.activeGuildId}, Channel ${data.voiceChannelId}`,
									);
								} else {
									addLog(
										"User not found in any voice channel with active player (but you can still send commands)",
									);
								}
								break;
							case "select-guild":
								if (data.success) {
									setUserContext((prev) => ({
										...prev,
										guildId: data.guildId,
										voiceChannelId: data.voiceChannelId || undefined,
									}));
									addLog(`Switched control to Guild ${data.guildId}`);
								} else {
									addLog(`Failed to switch guild: ${data.message}`);
								}
								break;
							case "queue":
								setPlayerState((prev) => ({
									...prev,
									queue: data.queue || [],
								}));
								break;
							case "status":
								setPlayerState((prev) => ({
									...prev,
									playing: data.playing ?? prev.playing,
									volume: data.volume ?? prev.volume,
									track: data.current ?? prev.track,
									queue: data.queue ?? prev.queue,
									listeners: data.listeners ?? prev.listeners,
								}));
								addLog(
									`Player status updated: playing=${data.playing}, volume=${data.volume}`,
								);
								break;
							case "volume":
								if (typeof data.volume === "number") {
									setPlayerState((prev) => ({
										...prev,
										volume: data.volume,
									}));
								}
								break;
							case "user-status":
								if (data.found === false) {
									addLog("User tidak ditemukan di voice channel manapun");
								} else {
									addLog(
										`User ditemukan di guild: ${data.guildId}, channel: ${data.voiceChannelId}`,
									);
									if (data.player) {
										setPlayerState((prev) => ({
											...prev,
											playing: data.player.playing ?? prev.playing,
											track: data.player.track ?? prev.track,
											volume: data.player.volume ?? prev.volume,
											queue: data.player.queue ?? prev.queue,
											listeners: data.player.listeners ?? prev.listeners,
										}));
									}
								}
								break;
							case "pause":
							case "resume":
							case "skip":
							case "stop":
								if (data.success) {
									addLog(`${data.type} command successful`);
								} else {
									addLog(
										`${data.type} command failed: ${data.error || "Unknown error"}`,
									);
								}
								break;
							default:
								break;
						}
					} catch {
						addLog(`Received: ${event.data}`);
					}
				};

				newWs.onclose = () => {
					setConnected(false);
					addLog("Disconnected from WebSocket");
				};

				newWs.onerror = (error) => {
					addLog("WebSocket error occurred");
					console.error("WebSocket error:", error);
				};

				setWs(newWs);
			} catch (error) {
				addLog("Failed to connect to WebSocket");
				console.error("Connection error:", error);
			}
		},
		[ws, addLog],
	);

	const refreshUser = useCallback(async () => {
		try {
			const res = await fetch("/api/auth/me", { credentials: "include" });
			if (res.ok) {
				const data = await res.json();
				if (data?.user?.id) {
					setUserContext((prev) => ({
						...prev,
						userId: data.user.id,
						avatar: data.user.avatar,
						globalName: data.user.global_name,
					}));

					let guildsData = [];
					try {
						const guildsRes = await fetch("/api/auth/guilds");
						if (guildsRes.ok) {
							const gData = await guildsRes.json();
							if (gData.success && Array.isArray(gData.guilds)) {
								guildsData = gData.guilds;
							}
						}
					} catch (e) {
						console.error("Failed to fetch guilds", e);
					}

					connect(
						data.user.id,
						undefined,
						undefined,
						undefined,
						data.token,
						guildsData,
					);
					return;
				}
			}
			if (lastConnectedUserId.current !== undefined) {
				lastConnectedUserId.current = undefined;
				disconnectWebSocketOnly();
			}
		} catch {
			if (lastConnectedUserId.current !== undefined) {
				lastConnectedUserId.current = undefined;
				disconnectWebSocketOnly();
			}
		}
	}, [connect, disconnectWebSocketOnly]);

	const disconnect = useCallback(async () => {
		try {
			await fetch("/api/auth/discord", { method: "POST" });
		} catch {}
		disconnectWebSocketOnly();
		refreshUser();
	}, [disconnectWebSocketOnly, refreshUser]);

	useEffect(() => {
		return () => {
			if (ws) {
				ws.close();
			}
		};
	}, [ws]);

	useEffect(() => {
		if (!autoUpdateEnabled || !connected || !userContext.guildId) {
			return;
		}

		const interval = setInterval(() => {
			requestStatusAndQueue();
		}, 1000);

		return () => {
			clearInterval(interval);
		};
	}, [
		autoUpdateEnabled,
		connected,
		userContext.guildId,
		requestStatusAndQueue,
	]);

	const toggleAutoUpdate = useCallback(() => {
		setAutoUpdateEnabled((prev) => !prev);
	}, []);

	const selectGuild = useCallback(
		(guildId: string) => {
			if (ws && ws.readyState === WebSocket.OPEN) {
				ws.send(JSON.stringify({ type: "select-guild", guildId }));
				addLog(`Switching to guild: ${guildId}`);
			}
		},
		[ws, addLog],
	);

	const value = {
		ws,
		connected,
		userContext,
		playerState,
		logs,
		autoUpdateEnabled,
		lastUpdateTime,
		availableGuilds,
		connect,
		disconnect,
		sendCommand,
		clearLogs,
		toggleAutoUpdate,
		requestStatusAndQueue,
		refreshUser,
		selectGuild,
	};

	useEffect(() => {
		let mounted = true;
		const initializeUser = async () => {
			if (mounted) {
				try {
					const res = await fetch("/api/auth/me", { credentials: "include" });
					if (res.ok) {
						const data = await res.json();
						if (data?.user?.id) {
							setUserContext((prev) => ({
								...prev,
								userId: data.user.id,
								avatar: data.user.avatar,
								globalName: data.user.global_name,
							}));

							let guildsData = [];
							try {
								const guildsRes = await fetch("/api/auth/guilds");
								if (guildsRes.ok) {
									const gData = await guildsRes.json();
									if (gData.success && Array.isArray(gData.guilds)) {
										guildsData = gData.guilds;
									}
								}
							} catch (e) {
								console.error("Failed to fetch guilds", e);
							}

							connect(
								data.user.id,
								undefined,
								undefined,
								undefined,
								data.token,
								guildsData,
							);
							return;
						}
					}
					if (lastConnectedUserId.current !== undefined) {
						lastConnectedUserId.current = undefined;
						disconnectWebSocketOnly();
					}
				} catch {
					if (lastConnectedUserId.current !== undefined) {
						lastConnectedUserId.current = undefined;
						disconnectWebSocketOnly();
					}
				}
			}
		};
		initializeUser();
		return () => {
			mounted = false;
		};
	}, [connect, disconnectWebSocketOnly]);

	const storedGuildsRef = useRef<unknown[]>([]);

	useEffect(() => {
		if (!ws || ws.readyState !== WebSocket.OPEN || !userContext.userId) {
			return;
		}

		const interval = setInterval(() => {
			try {
				ws.send(
					JSON.stringify({
						type: "user-connect",
						userId: userContext.userId,
						guilds: storedGuildsRef.current || [],
					}),
				);
			} catch (err) {
				console.error("Error sending user status check:", err);
			}
		}, 3000);

		return () => clearInterval(interval);
	}, [ws, userContext.userId]);

	return (
		<WebSocketContext.Provider value={value}>
			{children}
		</WebSocketContext.Provider>
	);
};
