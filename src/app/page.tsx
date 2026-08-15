"use client";

import {
	Clock,
	Compass,
	Heart,
	ListMusic,
	Music,
	Play,
	Sparkles,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useWebSocket } from "@/components/WebSocketProvider";
import type { DiscoveryTrack } from "@/lib/music-discovery";
import { generateTrackId } from "@/lib/track-utils";
import { cn } from "@/lib/utils";

type RecentTrack = {
	id?: string;
	uri?: string;
	url?: string;
	title?: string;
	name?: string;
	artist?: string;
	author?: string;
	artwork?: string;
	artworkUrl?: string;
	playedAt?: string;
};

export default function HomePage() {
	const router = useRouter();
	const { userContext, sendCommand } = useWebSocket();
	const [recentTracks, setRecentTracks] = useState<RecentTrack[]>([]);
	const [recentLoading, setRecentLoading] = useState(false);
	const [recentError, setRecentError] = useState<string | null>(null);

	const [discoverTracks, setDiscoverTracks] = useState<DiscoveryTrack[]>([]);
	const [discoverLoading, setDiscoverLoading] = useState(false);

	useEffect(() => {
		if (!userContext?.userId) return;
		async function fetchRecent() {
			setRecentLoading(true);
			setRecentError(null);
			try {
				const res = await fetch(`/api/music/recent/${userContext.userId}`);
				if (!res.ok) throw new Error("Failed to fetch recent tracks");
				const data = await res.json();
				const raw = Array.isArray(data.tracks) ? data.tracks : [];

				// Deduplicate tracks by title & artist
				const seen = new Set<string>();
				const deduplicated: RecentTrack[] = [];
				for (const track of raw) {
					const titleKey = (track.title || track.name || "")
						.toLowerCase()
						.trim();
					const artistKey = (track.artist || track.author || "")
						.toLowerCase()
						.trim();
					const key = `${titleKey}-${artistKey}`;
					if (titleKey && !seen.has(key)) {
						seen.add(key);
						deduplicated.push(track);
					}
				}
				setRecentTracks(deduplicated);
			} catch {
				setRecentError("Failed to load recent tracks");
				setRecentTracks([]);
			} finally {
				setRecentLoading(false);
			}
		}
		fetchRecent();
	}, [userContext?.userId]);

	useEffect(() => {
		async function fetchHomeDiscover() {
			setDiscoverLoading(true);
			try {
				const res = await fetch("/api/discover");
				if (res.ok) {
					const data = await res.json();
					if (Array.isArray(data.tracks)) {
						setDiscoverTracks(data.tracks.slice(0, 8));
					}
				}
			} catch (err) {
				console.error("Error fetching home discover:", err);
			} finally {
				setDiscoverLoading(false);
			}
		}
		fetchHomeDiscover();
	}, []);

	const handleTrackClick = (track: RecentTrack) => {
		const trackId = generateTrackId(track);
		router.push(`/view/${trackId}`);
	};

	const handlePlayDiscoverTrack = (track: DiscoveryTrack) => {
		if (!userContext.guildId) return;
		const query = track.isrc
			? `dzisrc:${track.isrc}`
			: `${track.title} ${track.artist}`;
		sendCommand({
			type: "play",
			guildId: userContext.guildId,
			query,
		});
	};

	const getGreetingForHour = (hour: number) => {
		if (hour < 5) {
			return {
				text: "Good night",
				gradient: "from-indigo-950/40 via-purple-950/20 to-transparent",
				icon: "🌌",
			};
		}
		if (hour < 12) {
			return {
				text: "Good morning",
				gradient: "from-emerald-950/30 via-teal-950/15 to-transparent",
				icon: "🌅",
			};
		}
		if (hour < 18) {
			return {
				text: "Good afternoon",
				gradient: "from-sky-950/30 via-blue-950/15 to-transparent",
				icon: "☀️",
			};
		}
		return {
			text: "Good evening",
			gradient: "from-violet-950/30 via-fuchsia-950/15 to-transparent",
			icon: "🌙",
		};
	};

	const [mounted, setMounted] = useState(false);
	useEffect(() => {
		const timer = setTimeout(() => setMounted(true), 0);
		return () => clearTimeout(timer);
	}, []);

	const greeting = mounted
		? getGreetingForHour(new Date().getHours())
		: {
				text: "Welcome back",
				gradient: "from-zinc-950/20 via-zinc-900/10 to-transparent",
				icon: "🎵",
			};

	return (
		<div className="space-y-8 pb-10">
			{/* Hero / Welcome Section */}
			<div
				className={cn(
					"relative overflow-hidden bg-gradient-to-br border border-border/20 rounded-3xl p-6 md:p-8 min-h-[220px] flex items-center shadow-lg transition-all",
					greeting.gradient,
				)}
			>
				<div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
				<div className="relative z-10 flex items-center justify-between w-full">
					<div className="space-y-4">
						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<Sparkles className="w-4 h-4 text-primary animate-pulse" />
								<p className="text-xs text-primary font-bold tracking-widest uppercase">
									{userContext?.globalName
										? `Welcome back, ${userContext.globalName}`
										: "Welcome back"}
								</p>
							</div>
							<h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tight flex items-center gap-2">
								{greeting.text}{" "}
								<span
									className="animate-bounce"
									style={{ animationDuration: "3s" }}
								>
									{greeting.icon}
								</span>
							</h1>
							<p className="text-sm text-muted-foreground max-w-xl leading-relaxed font-normal">
								Control and enjoy your music flow. Tap below to find trending
								new tracks and live DJ sets.
							</p>
							<div className="pt-2">
								<Button
									className="px-5 py-2.5 text-xs font-bold rounded-xl bg-primary hover:bg-primary/95 text-zinc-950 transition-all border border-primary/20 shadow-lg shadow-primary/10 hover:scale-105 active:scale-95 duration-200"
									onClick={() => router.push("/discover")}
								>
									<Compass className="w-3.5 h-3.5 mr-1.5" />
									Discover New Music
								</Button>
							</div>
						</div>
					</div>
					<div className="relative hidden lg:block pr-6">
						<div
							className="w-28 h-28 bg-zinc-900/60 backdrop-blur-md rounded-2xl flex items-center justify-center relative overflow-hidden border border-border/30 shadow-2xl animate-float"
							style={{ animationDuration: "6s" }}
						>
							<div className="text-5xl">🎵</div>
							<div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent pointer-events-none" />
						</div>
					</div>
				</div>
			</div>

			{/* Quick Access Horizontal Scroll list */}
			<div className="space-y-3">
				<h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80 font-heading">
					Quick Access
				</h2>
				<div className="flex flex-row gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none thin-scrollbar">
					{[
						{
							name: "Liked Songs",
							icon: <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />,
							link: "/liked",
							bg: "hover:bg-rose-500/10 hover:border-rose-500/20",
						},
						{
							name: "Your Playlists",
							icon: <ListMusic className="w-4 h-4 text-primary" />,
							link: "/library",
							bg: "hover:bg-primary/10 hover:border-primary/20",
						},
						{
							name: "Discover",
							icon: <Compass className="w-4 h-4 text-teal-400" />,
							link: "/discover",
							bg: "hover:bg-teal-400/10 hover:border-teal-400/20",
						},
					].map((item, itemIndex) => (
						<a
							key={`quick-access-${item.name}-${itemIndex}`}
							href={item.link}
							className={cn(
								"flex items-center gap-3 bg-zinc-900/20 border border-zinc-800/50 px-5 py-3 rounded-xl hover:bg-zinc-900/40 hover:border-zinc-700/50 hover:scale-102 hover:shadow-md transition-all duration-200 flex-shrink-0 min-w-[170px]",
								item.bg,
							)}
						>
							<div className="w-8 h-8 rounded-xl bg-zinc-950/60 border border-zinc-900/50 flex items-center justify-center flex-shrink-0">
								{item.icon}
							</div>
							<div className="text-xs font-bold text-foreground">
								{item.name}
							</div>
						</a>
					))}
				</div>
			</div>

			{/* Recently Played Section (Deduplicated & Compact Sizing) */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Clock className="w-4 h-4 text-primary" />
						<h2 className="text-xl font-bold tracking-tight">
							Recently Played
						</h2>
					</div>
					{recentTracks.length > 0 && (
						<Button
							variant="ghost"
							size="sm"
							className="text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-xl px-3"
							onClick={() => router.push("/recent")}
						>
							Show all
						</Button>
					)}
				</div>

				{recentLoading ? (
					<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
						{Array.from({ length: 6 }, (_, id) => `rec-skel-${id}`).map(
							(skelKey) => (
								<div
									key={skelKey}
									className="space-y-2 p-2 rounded-xl bg-card/20 border border-border/10"
								>
									<div className="aspect-square bg-zinc-900/30 border border-border/10 rounded-lg animate-pulse" />
									<div className="space-y-1">
										<div className="h-3 bg-zinc-900/30 rounded w-full animate-pulse" />
										<div className="h-2 bg-zinc-900/30 rounded w-2/3 animate-pulse" />
									</div>
								</div>
							),
						)}
					</div>
				) : recentError ? (
					<div className="text-center py-8 bg-destructive/5 border border-destructive/20 rounded-2xl max-w-lg mx-auto">
						<div className="text-destructive font-bold text-xs mb-1">
							Unable to load recent tracks
						</div>
					</div>
				) : recentTracks.length === 0 ? (
					<div className="text-center py-10 bg-card/20 border border-border/20 rounded-2xl max-w-lg mx-auto">
						<h3 className="font-bold text-xs text-foreground mb-1">
							No recent tracks
						</h3>
					</div>
				) : (
					<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
						{recentTracks.slice(0, 8).map((track, index) => (
							<button
								key={`${track.id || track.uri}-${index}`}
								className="group cursor-pointer bg-zinc-900/20 border border-zinc-800/50 text-left w-full p-2.5 rounded-xl hover:bg-zinc-900/40 hover:border-zinc-700/50 transition-all duration-200"
								onClick={() => handleTrackClick(track)}
								type="button"
							>
								<div className="relative aspect-square rounded-lg overflow-hidden mb-2 bg-zinc-950 border border-zinc-900/60 shadow-sm">
									{track.artwork || track.artworkUrl ? (
										<Image
											src={track.artwork || track.artworkUrl || ""}
											alt={track.title || "Artwork"}
											width={200}
											height={200}
											className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
											priority={index < 2}
											loading={index < 2 ? "eager" : "lazy"}
											unoptimized
										/>
									) : (
										<div className="w-full h-full bg-zinc-950 flex items-center justify-center">
											<Music className="w-6 h-6 text-muted-foreground/30" />
										</div>
									)}
									<div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
										<div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md">
											<Play
												className="w-3.5 h-3.5 text-zinc-950 ml-0.5"
												fill="currentColor"
											/>
										</div>
									</div>
								</div>
								<div className="space-y-0.5 min-w-0">
									<h3 className="font-bold text-[11px] truncate group-hover:text-primary transition-colors text-foreground">
										{track.title || track.name || "Unknown Title"}
									</h3>
									<p className="text-[9px] text-muted-foreground truncate">
										{track.artist || track.author || "Unknown Artist"}
									</p>
								</div>
							</button>
						))}
					</div>
				)}
			</div>

			{/* Home Discover & Recommendations Section (Fills Home Page Space) */}
			<div className="space-y-4 pt-2 border-t border-border/20">
				<div className="flex items-center justify-between">
					<div className="space-y-0.5">
						<div className="flex items-center gap-2">
							<Sparkles className="w-4 h-4 text-primary" />
							<h2 className="text-lg font-extrabold tracking-tight text-foreground font-heading">
								Unified Music Discovery
							</h2>
						</div>
						<p className="text-xs text-muted-foreground">
							Curated recommendations powered by Deezer, Last.fm, Apple Music,
							and MusicBrainz
						</p>
					</div>
					<Button
						onClick={() => router.push("/discover")}
						variant="outline"
						size="sm"
						className="rounded-xl border-border hover:bg-accent text-xs gap-1.5 cursor-pointer"
					>
						<Compass className="w-3.5 h-3.5 text-primary" />
						Explore Discover
					</Button>
				</div>

				{discoverLoading ? (
					<div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
						{Array.from({ length: 8 }, (_, i) => `disc-skel-${i}`).map((id) => (
							<div
								key={id}
								className="aspect-square bg-muted/30 rounded-xl animate-pulse"
							/>
						))}
					</div>
				) : (
					<div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
						{discoverTracks.map((track, idx) => (
							<button
								type="button"
								key={track.id || `disc-${track.title}-${idx}`}
								onClick={() => handlePlayDiscoverTrack(track)}
								className="text-left w-full group cursor-pointer bg-zinc-900/20 border border-zinc-800/50 p-2.5 rounded-xl hover:border-primary/40 hover:bg-zinc-900/40 transition-all space-y-2"
							>
								<div className="relative aspect-square rounded-lg overflow-hidden bg-zinc-950 border border-zinc-900">
									<Image
										src={
											track.artworkUrl ||
											"https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&auto=format&fit=crop&q=80"
										}
										alt={track.title}
										width={160}
										height={160}
										className="object-cover w-full h-full group-hover:scale-105 transition-transform"
										unoptimized
									/>
									<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
										<div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
											<Play className="w-4 h-4 fill-current ml-0.5" />
										</div>
									</div>
								</div>
								<div className="space-y-0.5 min-w-0">
									<p className="font-bold text-[11px] text-foreground truncate group-hover:text-primary transition-colors">
										{track.title}
									</p>
									<p className="text-[9px] text-muted-foreground truncate">
										{track.artist}
									</p>
								</div>
							</button>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
