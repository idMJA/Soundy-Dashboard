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
			<div className="flex-1 space-y-6">
				{/* Hero Section with gradient background */}
				<div className="bg-gradient-to-br from-primary/30 via-primary/20 to-background rounded-xl p-8 min-h-[300px] flex items-center">
					<div className="flex items-center justify-between w-full">
						<div className="space-y-4">
							<div className="space-y-2">
								<p className="text-sm text-muted-foreground">Welcome back</p>
								<h1 className="text-5xl font-bold text-foreground">
									Good morning
								</h1>
								<p className="text-lg text-muted-foreground max-w-md">
									Let&apos;s start your music journey with personalized
									recommendations
								</p>
							</div>
							<div className="flex items-center space-x-3">
								<div className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium">
									Discord Music Bot
								</div>
								<div className="bg-muted text-muted-foreground px-4 py-2 rounded-full text-sm">
									Real-time Control
								</div>
							</div>
						</div>
						<div className="w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center ml-8">
							<div className="text-5xl">🎵</div>
						</div>
					</div>
				</div>

				{/* Quick Access Cards */}
				<div className="space-y-3">
					<h2 className="text-lg font-semibold px-2">Quick Access</h2>
					<div className="space-y-2">
						{/* ...existing code for quick access... */}
						{[
							{
								name: "Liked Songs",
								color: "bg-gradient-to-br from-purple-500 to-pink-500",
								icon: "❤️",
								link: "/liked",
							},
							{
								name: "Daily Mixes",
								color: "bg-gradient-to-br from-green-500 to-teal-500",
								icon: "🎧",
								link: "/mixes",
							},
							{
								name: "Your Playlists",
								color: "bg-gradient-to-br from-blue-500 to-indigo-500",
								icon: "📋",
								link: "/library",
							},
							{
								name: "Discover",
								color: "bg-gradient-to-br from-orange-500 to-red-500",
								icon: "🔍",
								link: "/discover",
							},
						].map((item, itemIndex) => (
							<a
								key={`quick-access-${item.name}-${itemIndex}`}
								href={item.link}
								className="group bg-card hover:bg-accent transition-colors duration-200 rounded-lg p-3 cursor-pointer flex items-center space-x-3 block"
							>
								<div
									className={`w-12 h-12 rounded ${item.color} flex items-center justify-center flex-shrink-0`}
								>
									<div className="text-white text-lg">{item.icon}</div>
								</div>
								<div className="min-w-0 flex-1">
									<p className="font-medium text-card-foreground group-hover:text-accent-foreground truncate">
										{item.name}
									</p>
								</div>
							</a>
						))}
					</div>
				</div>

				{/* Recently Played Section (API) */}
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h2 className="text-2xl font-semibold">Recently played</h2>
						<Button
							variant="ghost"
							size="sm"
							className="text-muted-foreground hover:text-foreground"
						>
							Show all
						</Button>
					</div>
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
						{recentLoading ? (
							Array.from({ length: 5 }).map(() => (
								<div
									key={`recent-skel-${crypto.randomUUID()}`}
									className="bg-muted rounded-lg aspect-square animate-pulse"
								/>
							))
						) : recentError ? (
							<div className="col-span-full text-center text-destructive text-sm py-8">
								{recentError}
							</div>
						) : recentTracks.length === 0 ? (
							<div className="col-span-full text-center text-muted-foreground text-sm py-8">
								No recent tracks found.
							</div>
						) : (
							recentTracks.map((track) => (
								<button
									key={track.id || track.uri}
									className="group cursor-pointer bg-transparent border-none p-0 text-left w-full"
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
									<div className="bg-muted rounded-lg aspect-square flex items-center justify-center mb-3 group-hover:bg-accent transition-colors shadow-sm overflow-hidden relative">
										{track.artwork ? (
											<Image
												src={track.artwork}
												alt={track.title || "Artwork"}
												width={400}
												height={400}
												className="object-cover w-full h-full rounded-lg"
												priority={false}
												unoptimized={false}
											/>
										) : (
											<div className="text-3xl">🎵</div>
										)}
									</div>
									<h3 className="font-medium text-sm truncate group-hover:text-primary">
										{track.title || track.name || "Unknown Title"}
									</h3>
									<p className="text-xs text-muted-foreground truncate">
										{track.artist || track.author || "Unknown Artist"}
									</p>
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
