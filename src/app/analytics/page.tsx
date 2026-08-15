"use client";

import {
	Clock,
	Flame,
	Headphones,
	Music2,
	Sparkles,
	TrendingUp,
	Trophy,
	Users,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWebSocket } from "@/components/WebSocketProvider";

interface RealTrack {
	trackId?: string;
	title: string;
	author?: string;
	artist?: string;
	playCount?: number;
	uri?: string;
	artwork?: string;
	length?: number;
	duration?: number;
}

interface RealUser {
	userId: string;
	playCount?: number;
	username?: string;
	globalName?: string;
	avatar?: string | null;
}

export default function AnalyticsPage() {
	const [timeRange, setTimeRange] = useState<"week" | "month" | "all">("all");
	const [tracks, setTracks] = useState<RealTrack[]>([]);
	const [users, setUsers] = useState<RealUser[]>([]);
	const [loading, setLoading] = useState(true);
	const { userContext } = useWebSocket();

	useEffect(() => {
		async function fetchRealBotData() {
			setLoading(true);
			try {
				const guildIdParam = userContext.guildId
					? `?guildId=${userContext.guildId}`
					: "";
				const [tracksRes, usersRes] = await Promise.all([
					fetch(`/api/top/tracks${guildIdParam}`),
					fetch(`/api/top/users${guildIdParam}`),
				]);

				const tracksData = await tracksRes.json();
				const usersData = await usersRes.json();

				if (tracksData?.tracks && Array.isArray(tracksData.tracks)) {
					setTracks(tracksData.tracks);
				} else {
					setTracks([]);
				}

				if (usersData?.users && Array.isArray(usersData.users)) {
					setUsers(usersData.users);
				} else {
					setUsers([]);
				}
			} catch (err) {
				console.error("Error fetching real bot data:", err);
				setTracks([]);
				setUsers([]);
			} finally {
				setLoading(false);
			}
		}

		fetchRealBotData();
	}, [userContext.guildId]);

	const totalPlays = tracks.reduce(
		(acc, t) => acc + (Number(t.playCount) || 1),
		0,
	);

	return (
		<div className="container mx-auto p-6 space-y-8 max-w-7xl">
			{/* Header Banner */}
			<div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/40 via-card to-background p-8 border border-border shadow-2xl backdrop-blur-xl">
				<div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
				<div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<Badge
								variant="outline"
								className="bg-primary/10 text-primary border-primary/30 px-3 py-1"
							>
								<Sparkles className="w-3.5 h-3.5 mr-1 text-primary" />
								Soundy Wrapped & Stats
							</Badge>
						</div>
						<h1 className="text-4xl font-extrabold tracking-tight text-foreground font-heading">
							Listening Analytics & Top Charts
						</h1>
						<p className="text-muted-foreground text-sm max-w-xl">
							Live playback statistics fetched directly from Soundy Discord Bot
							database.
						</p>
					</div>

					<div className="flex items-center gap-2 bg-muted/50 p-1.5 rounded-2xl border border-border backdrop-blur-md">
						<Button
							variant={timeRange === "week" ? "secondary" : "ghost"}
							size="sm"
							onClick={() => setTimeRange("week")}
							className="rounded-xl text-xs"
						>
							This Week
						</Button>
						<Button
							variant={timeRange === "month" ? "secondary" : "ghost"}
							size="sm"
							onClick={() => setTimeRange("month")}
							className="rounded-xl text-xs"
						>
							This Month
						</Button>
						<Button
							variant={timeRange === "all" ? "secondary" : "ghost"}
							size="sm"
							onClick={() => setTimeRange("all")}
							className="rounded-xl text-xs"
						>
							All Time
						</Button>
					</div>
				</div>
			</div>

			{/* Metric Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card className="bg-card border-border hover:border-primary/50 transition-all shadow-sm">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
							Total Songs Played
						</CardTitle>
						<Clock className="w-4 h-4 text-primary" />
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-black font-heading text-foreground">
							{loading ? "..." : totalPlays}
						</div>
						<p className="text-xs text-primary mt-1 flex items-center gap-1 font-medium">
							<TrendingUp className="w-3 h-3" /> Real-time Bot DB Query
						</p>
					</CardContent>
				</Card>

				<Card className="bg-card border-border hover:border-primary/50 transition-all shadow-sm">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
							Top Track
						</CardTitle>
						<Headphones className="w-4 h-4 text-primary" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-black font-heading text-foreground truncate">
							{loading ? "..." : tracks[0]?.title || "No tracks played yet"}
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							{tracks[0]?.author || ""}
						</p>
					</CardContent>
				</Card>

				<Card className="bg-card border-border hover:border-primary/50 transition-all shadow-sm">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
							Top Active User
						</CardTitle>
						<Trophy className="w-4 h-4 text-amber-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-black font-heading text-foreground truncate">
							{loading
								? "..."
								: users[0]
									? users[0].globalName || users[0].username || "Top Listener"
									: "No users yet"}
						</div>
						<p className="text-xs text-amber-500 mt-1 font-medium">
							{users[0]?.playCount ? `${users[0].playCount} plays` : ""}
						</p>
					</CardContent>
				</Card>

				<Card className="bg-card border-border hover:border-primary/50 transition-all shadow-sm">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
							Unique Tracks
						</CardTitle>
						<Flame className="w-4 h-4 text-rose-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-black font-heading text-foreground">
							{loading ? "..." : tracks.length}
						</div>
						<p className="text-xs text-muted-foreground mt-1 font-medium">
							In Bot Database
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Main Content Tabs */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Top Tracks List */}
				<div className="lg:col-span-2 space-y-4">
					<div className="flex items-center justify-between">
						<h2 className="text-xl font-bold text-foreground flex items-center gap-2">
							<Music2 className="w-5 h-5 text-primary" /> Top Played Tracks
						</h2>
						{loading && (
							<span className="text-xs text-primary animate-pulse">
								Fetching DB...
							</span>
						)}
					</div>

					<div className="space-y-2">
						{tracks.length > 0 ? (
							tracks.map((track, idx) => (
								<div
									key={track.trackId || idx}
									className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all group"
								>
									<div className="flex items-center gap-4">
										<span className="w-6 text-center font-bold text-muted-foreground group-hover:text-primary transition-colors">
											{idx + 1}
										</span>
										<Image
											src={
												track.artwork ||
												"https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80"
											}
											alt={track.title}
											width={48}
											height={48}
											unoptimized
											className="w-12 h-12 rounded-xl object-cover shadow-md border border-border"
										/>
										<div>
											<p className="font-semibold text-foreground group-hover:text-primary transition-colors">
												{track.title}
											</p>
											<p className="text-xs text-muted-foreground">
												{track.author || "Unknown Artist"}
											</p>
										</div>
									</div>

									<div className="flex items-center gap-6">
										<div className="text-right">
											<p className="text-sm font-bold text-primary">
												Played {track.playCount || 1} times
											</p>
											{track.length ? (
												<p className="text-xs text-muted-foreground">
													{Math.floor(track.length / 60000)}:
													{String(
														Math.floor((track.length % 60000) / 1000),
													).padStart(2, "0")}
												</p>
											) : null}
										</div>
									</div>
								</div>
							))
						) : (
							<div className="p-8 rounded-2xl bg-card border border-border text-center space-y-2">
								<Music2 className="w-8 h-8 text-muted-foreground mx-auto" />
								<p className="text-sm font-medium text-foreground">
									No tracks played in this server yet
								</p>
								<p className="text-xs text-muted-foreground">
									Play songs using the bot or dashboard to see real stats here!
								</p>
							</div>
						)}
					</div>
				</div>

				{/* Top Active Users */}
				<div className="space-y-6">
					<h2 className="text-xl font-bold text-foreground flex items-center gap-2">
						<Users className="w-5 h-5 text-primary" /> Top Active Listeners
					</h2>

					<div className="space-y-3">
						{users.length > 0 ? (
							users.map((user) => {
								const displayName =
									user.globalName || user.username || "Active Listener";
								const subtitle = user.username
									? `@${user.username}`
									: "Listener";
								return (
									<div
										key={user.userId}
										className="flex items-center gap-4 p-3.5 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all"
									>
										{user.avatar ? (
											<Image
												src={user.avatar}
												alt={displayName}
												width={44}
												height={44}
												unoptimized
												className="w-11 h-11 rounded-full object-cover shadow-md border border-border"
											/>
										) : (
											<div className="w-11 h-11 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm shadow-md">
												{displayName[0]?.toUpperCase() || "#"}
											</div>
										)}
										<div className="flex-1 min-w-0">
											<p className="font-semibold text-foreground truncate">
												{displayName}
											</p>
											<p className="text-xs text-muted-foreground">
												{subtitle}
											</p>
										</div>
										<Badge
											variant="secondary"
											className="bg-primary/10 text-primary border-primary/20"
										>
											{user.playCount || 1} plays
										</Badge>
									</div>
								);
							})
						) : (
							<div className="p-6 rounded-2xl bg-card border border-border text-center">
								<p className="text-xs text-muted-foreground">
									No user stats recorded yet
								</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
