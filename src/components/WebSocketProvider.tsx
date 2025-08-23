"use client";

import {
	createContext,
	useContext,
	useEffect,
	useState,
	useCallback,
} from "react";
import type React from "react";
import { useRef } from "react";

interface UserContext {
	guildId?: string;
	voiceChannelId?: string;
	userId?: string;
	avatar?: string;
	globalName?: string;
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
	connect: (userId?: string, guildId?: string) => void;
	disconnect: () => void;
	sendCommand: (command: WebSocketCommand) => void;
	clearLogs: () => void;
	toggleAutoUpdate: () => void;
	requestStatusAndQueue: () => void;
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
				const newWs = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/ws`);
				newWs.onopen = () => {
					setConnected(true);
					addLog("Connected to WebSocket");
					setUserContext({});
					if (userId) {
						newWs.send(JSON.stringify({ type: "user-connect", userId }));
						addLog(`Sent user-connect for userId: ${userId}`);
						setUserContext((prev) => ({ ...prev, userId, avatar, globalName }));
					} else if (guildId) {
						newWs.send(JSON.stringify({ type: "join", guildId }));
						addLog(`Sent join for guildId: ${guildId}`);
						setUserContext((prev) => ({ ...prev, guildId }));
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
										guildId: data.guildId,
										voiceChannelId: data.voiceChannelId,
										userId: data.userId || prev.userId,
										avatar: data.avatar || prev.avatar,
										globalName: data.globalName || prev.globalName,
									}));
									addLog(
										`User context updated: Guild ${data.guildId}, Channel ${data.voiceChannelId}`,
									);
								} else {
									addLog(
										"User not found in any voice channel with active player (but you can still send commands)",
									);
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
			const res = await fetch("/api/auth/me");
			if (res.ok) {
				const data = await res.json();
				if (data?.user?.id) {
					setUserContext((prev) => ({
						...prev,
						userId: data.user.id,
						avatar: data.user.avatar,
						globalName: data.user.global_name,
					}));
					connect(data.user.id);
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

	const value = {
		ws,
		connected,
		userContext,
		playerState,
		logs,
		autoUpdateEnabled,
		lastUpdateTime,
		connect,
		disconnect,
		sendCommand,
		clearLogs,
		toggleAutoUpdate,
		requestStatusAndQueue,
		refreshUser,
	};

	useEffect(() => {
		let mounted = true;
		const initializeUser = async () => {
			if (mounted) {
				try {
					const res = await fetch("/api/auth/me");
					if (res.ok) {
						const data = await res.json();
						if (data?.user?.id) {
							setUserContext((prev) => ({
								...prev,
								userId: data.user.id,
								avatar: data.user.avatar,
								globalName: data.user.global_name,
							}));
							connect(data.user.id);
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

	useEffect(() => {
		const interval = setInterval(async () => {
			try {
				const res = await fetch("/api/auth/me");
				if (res.ok) {
					const data = await res.json();
					const newUserId = data?.user?.id;
					const newGuildId = data?.user?.primary_guild?.identity_guild_id;
					const newVoiceChannelId = data?.user?.voice_channel_id;

					const guildChanged =
						newGuildId !== undefined && newGuildId !== userContext.guildId;
					const vcChanged =
						newVoiceChannelId !== undefined &&
						newVoiceChannelId !== userContext.voiceChannelId;

					if (newUserId && (guildChanged || vcChanged)) {
						setUserContext((prev) => ({
							...prev,
							guildId: newGuildId,
							voiceChannelId: newVoiceChannelId,
						}));
						if (ws && ws.readyState === WebSocket.OPEN) {
							ws.send(
								JSON.stringify({ type: "user-connect", userId: newUserId }),
							);
							addLog(
								`Sent user-connect for userId: ${newUserId} (VC/guild changed)`,
							);
						}
					}
				}
			} catch {}
		}, 6000);
		return () => clearInterval(interval);
	}, [ws, userContext.guildId, userContext.voiceChannelId, addLog]);

	return (
		<WebSocketContext.Provider value={value}>
			{children}
		</WebSocketContext.Provider>
	);
};
