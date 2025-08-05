"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWebSocket } from "@/components/WebSocketProvider";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { RightSidebar } from "@/components/RightSidebar";

type RecentTrack = {
	id?: string;
	uri?: string;
	title?: string;
	name?: string;
	artist?: string;
	author?: string;
	artwork?: string;
};

export default function HomePage() {
	const router = useRouter();
	const { userContext } = useWebSocket();
	const [recentTracks, setRecentTracks] = useState<RecentTrack[]>([]);
	const [recentLoading, setRecentLoading] = useState(false);
	const [recentError, setRecentError] = useState<string | null>(null);

	useEffect(() => {
		if (!userContext?.userId) return;
		async function fetchRecent() {
			setRecentLoading(true);
			setRecentError(null);
			try {
				const res = await fetch(`/api/music/recent/${userContext.userId}`);
				if (!res.ok) throw new Error("Failed to fetch recent tracks");
				const data = await res.json();
				setRecentTracks(Array.isArray(data.tracks) ? data.tracks : []);
			} catch {
				setRecentError("Failed to load recent tracks");
				setRecentTracks([]);
			} finally {
				setRecentLoading(false);
			}
		}
		fetchRecent();
	}, [userContext?.userId]);

	const handleTrackClick = (track: RecentTrack) => {
		// Create a URL-safe ID from the track data
		const trackId = encodeURIComponent(
			track.uri ||
				track.id ||
				`${track.title || track.name} ${track.artist || track.author}`,
		);
		router.push(`/view/${trackId}`);
	};

	return (
		<div className="flex h-full gap-6">
			{/* Center Content - Main Area */}
			<div className="flex-1 space-y-8 custom-scrollbar">
				{/* Hero Section with modern gradient background */}
				<div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-2xl p-8 min-h-[320px] flex items-center border border-border/50 shadow-modern">
					{/* Decorative background elements */}
					<div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl opacity-30" />
					<div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-green-400/20 to-transparent rounded-full blur-2xl opacity-40" />

					<div className="relative z-10 flex items-center justify-between w-full">
						<div className="space-y-6">
							<div className="space-y-3">
								<div className="flex items-center gap-2">
									<div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
									<p className="text-sm text-muted-foreground font-medium">
										Welcome back
									</p>
								</div>
								<h1 className="text-6xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
									Good morning
								</h1>
								<p className="text-lg text-muted-foreground max-w-md leading-relaxed">
									Let&apos;s start your music journey with personalized
									recommendations and seamless control
								</p>
							</div>
							<div className="flex items-center space-x-3">
								<div className="gradient-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105">
									🎵 Discord Music Bot
								</div>
								<div className="glass px-5 py-2.5 rounded-full text-sm font-medium">
									⚡ Real-time Control
								</div>
							</div>
						</div>
						<div className="relative hidden lg:block">
							<div className="w-40 h-40 gradient-accent rounded-full flex items-center justify-center shadow-modern-xl relative overflow-hidden">
								<div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
								<div className="text-6xl relative z-10">🎵</div>
								<div className="absolute inset-0 rounded-full border-2 border-primary/20" />
							</div>
							{/* Floating elements */}
							<div className="absolute -top-2 -right-2 w-8 h-8 bg-primary/30 rounded-full animate-pulse" />
							<div className="absolute -bottom-4 -left-4 w-6 h-6 bg-green-400/40 rounded-full animate-pulse delay-300" />
						</div>
					</div>
				</div>

				{/* Quick Access Cards */}
				<div className="space-y-4 animate-fade-in">
					<div className="flex items-center justify-between">
						<h2 className="text-2xl font-bold">Quick Access</h2>
						<div className="text-sm text-muted-foreground">Jump right in</div>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						{[
							{
								name: "Liked Songs",
								color:
									"bg-gradient-to-br from-red-500 via-pink-500 to-rose-500",
								icon: "❤️",
								link: "/liked",
								description: "Your favorite tracks",
							},
							{
								name: "Daily Mixes",
								color:
									"bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500",
								icon: "🎧",
								link: "/mixes",
								description: "Curated for you",
							},
							{
								name: "Your Playlists",
								color:
									"bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500",
								icon: "📋",
								link: "/library",
								description: "Your collections",
							},
							{
								name: "Discover",
								color:
									"bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500",
								icon: "🔍",
								link: "/discover",
								description: "Find new music",
							},
						].map((item, itemIndex) => (
							<a
								key={`quick-access-${item.name}-${itemIndex}`}
								href={item.link}
								className="group music-card p-5 hover-lift cursor-pointer block animate-slide-up"
								style={{ animationDelay: `${itemIndex * 0.1}s` }}
							>
								<div className="flex items-start space-x-4">
									<div
										className={`w-14 h-14 rounded-xl ${item.color} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-xl transition-all group-hover:scale-110`}
									>
										<div className="text-white text-xl">{item.icon}</div>
									</div>
									<div className="min-w-0 flex-1">
										<h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors mb-1">
											{item.name}
										</h3>
										<p className="text-xs text-muted-foreground">
											{item.description}
										</p>
									</div>
								</div>
							</a>
						))}
					</div>
				</div>

				{/* Recently Played Section */}
				<div className="space-y-6 animate-fade-in">
					<div className="flex items-center justify-between">
						<div>
							<h2 className="text-3xl font-bold mb-1">Recently played</h2>
							<p className="text-muted-foreground">
								Pick up where you left off
							</p>
						</div>
						<Button
							variant="ghost"
							size="sm"
							className="text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-full px-4"
						>
							Show all
						</Button>
					</div>
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
						{recentLoading ? (
							Array.from({ length: 6 }).map((_, index) => (
								<div
									key={`recent-skeleton-${Math.random()}-${index}`}
									className="space-y-3 animate-scale-in"
									style={{ animationDelay: `${index * 0.1}s` }}
								>
									<div className="aspect-square bg-muted rounded-xl animate-pulse" />
									<div className="space-y-2">
										<div className="h-4 bg-muted rounded animate-pulse" />
										<div className="h-3 bg-muted/70 rounded animate-pulse w-3/4" />
									</div>
								</div>
							))
						) : recentError ? (
							<div className="col-span-full text-center py-12">
								<div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
									<div className="text-2xl">⚠️</div>
								</div>
								<div className="text-destructive font-medium mb-2">
									Unable to load recent tracks
								</div>
								<p className="text-muted-foreground text-sm">{recentError}</p>
							</div>
						) : recentTracks.length === 0 ? (
							<div className="col-span-full text-center py-12">
								<div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
									<div className="text-2xl">🎵</div>
								</div>
								<div className="font-medium mb-2">No recent tracks</div>
								<p className="text-muted-foreground text-sm">
									Start playing music to see your recent tracks here
								</p>
							</div>
						) : (
							recentTracks.map((track, index) => (
								<button
									key={track.id || track.uri}
									className="group cursor-pointer bg-transparent border-none p-0 text-left w-full music-card p-4 hover-lift animate-scale-in"
									style={{ animationDelay: `${index * 0.1}s` }}
									onClick={() => handleTrackClick(track)}
									onKeyDown={(e) => {
										if (e.key === "Enter" || e.key === " ") {
											e.preventDefault();
											handleTrackClick(track);
										}
									}}
									aria-label={`View details for ${track.title || track.name || "Unknown Title"} by ${track.artist || track.author || "Unknown Artist"}`}
									type="button"
								>
									<div className="relative aspect-square rounded-xl overflow-hidden mb-4 shadow-md group-hover:shadow-lg transition-all">
										{track.artwork ? (
											<Image
												src={track.artwork}
												alt={track.title || "Artwork"}
												width={400}
												height={400}
												className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
												priority={false}
												unoptimized={false}
											/>
										) : (
											<div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
												<div className="text-4xl opacity-50">🎵</div>
											</div>
										)}
										{/* Hover overlay */}
										<div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
											<div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-lg">
												<div className="text-white text-xl">▶️</div>
											</div>
										</div>
									</div>
									<div className="space-y-1">
										<h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
											{track.title || track.name || "Unknown Title"}
										</h3>
										<p className="text-xs text-muted-foreground truncate">
											{track.artist || track.author || "Unknown Artist"}
										</p>
									</div>
								</button>
							))
						)}
					</div>
				</div>
			</div>

			{/* Right Sidebar - Now Playing & Queue */}
			<RightSidebar />
		</div>
	);
}
