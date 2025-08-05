"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useWebSocket } from "./WebSocketProvider";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Music, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

interface MusicArtworkProps {
	className?: string;
	showControls?: boolean;
	size?: "sm" | "md" | "lg" | "xl";
}

export const MusicArtwork: React.FC<MusicArtworkProps> = ({
	className = "",
	showControls = true,
	size = "md",
}) => {
	const { playerState } = useWebSocket();
	const [currentArtwork, setCurrentArtwork] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(false);
	const lastTrackRef = useRef<string | null>(null);

	const sizeClasses = {
		sm: "w-16 h-16",
		md: "w-24 h-24",
		lg: "w-32 h-32",
		xl: "w-full aspect-square",
	};

	// Update artwork only when track changes (not on every status update)
	useEffect(() => {
		const track = playerState.track;
		const trackId = track ? `${track.title}-${track.author}` : null;
		const newArtwork = track?.artwork;

		// Only update if this is a different track (by title + author combination)
		if (trackId && trackId !== lastTrackRef.current) {
			lastTrackRef.current = trackId;

			if (newArtwork && newArtwork !== currentArtwork) {
				console.log(
					`🎵 Loading new artwork for: ${track.title} by ${track.author}`,
				);
				setIsLoading(true);
				setError(false);
				setCurrentArtwork(newArtwork);
			} else if (!newArtwork) {
				console.log("🎵 No artwork available for current track");
				setCurrentArtwork(null);
			}
		} else if (!track && lastTrackRef.current) {
			// Clear everything when no track is playing
			console.log("🎵 No track playing, clearing artwork");
			lastTrackRef.current = null;
			setCurrentArtwork(null);
		}
	}, [playerState.track, currentArtwork]);

	const handleImageLoad = () => {
		setIsLoading(false);
	};

	const handleImageError = () => {
		setIsLoading(false);
		setError(true);
	};

	if (!currentArtwork) {
		return (
			<Card
				className={cn(
					"flex items-center justify-center music-card group relative overflow-hidden",
					size === "xl" ? "w-full aspect-square" : sizeClasses[size],
					className,
				)}
			>
				<div
					className={cn(
						"text-center",
						size === "sm" ? "p-2" : size === "md" ? "p-3" : "p-4",
					)}
				>
					<div
						className={cn(
							"rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2",
							size === "sm"
								? "w-6 h-6"
								: size === "md"
									? "w-8 h-8"
									: "w-12 h-12",
						)}
					>
						<Music
							className={cn(
								"text-primary",
								size === "sm"
									? "w-3 h-3"
									: size === "md"
										? "w-4 h-4"
										: "w-6 h-6",
							)}
						/>
					</div>
					{size !== "sm" && (
						<>
							<p className="text-muted-foreground text-sm font-medium">
								No music playing
							</p>
							<p className="text-muted-foreground text-xs mt-1">
								Start playing to see artwork
							</p>
						</>
					)}
				</div>
				{/* Animated background effect */}
				<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-green-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
			</Card>
		);
	}

	return (
		<Card
			className={cn(
				"overflow-hidden music-card group relative shadow-modern hover-lift p-0",
				sizeClasses[size],
				className,
			)}
		>
			<div
				className={cn(
					"relative w-full h-full",
					size === "xl" ? "aspect-square" : "",
				)}
			>
				{isLoading && (
					<div className="absolute inset-0 flex items-center justify-center bg-muted">
						<Skeleton className="w-full h-full" />
						<div className="absolute inset-0 flex items-center justify-center">
							<div className="w-8 h-8 rounded-full bg-primary/20 animate-pulse flex items-center justify-center">
								<Music className="w-4 h-4 text-primary" />
							</div>
						</div>
					</div>
				)}

				{error ? (
					<div className="absolute inset-0 bg-gradient-to-br from-muted/80 to-muted flex items-center justify-center">
						<div className="text-center">
							<div
								className={cn(
									"rounded-full bg-destructive/10 flex items-center justify-center mx-auto",
									size === "sm"
										? "w-6 h-6"
										: size === "md"
											? "w-8 h-8"
											: "w-12 h-12",
								)}
							>
								<Music
									className={cn(
										"text-destructive",
										size === "sm"
											? "w-3 h-3"
											: size === "md"
												? "w-4 h-4"
												: "w-6 h-6",
									)}
								/>
							</div>
						</div>
					</div>
				) : (
					<>
						<Image
							src={currentArtwork}
							alt={`Album artwork for ${playerState.track?.title || "Unknown"}`}
							fill
							sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
							className={cn(
								"object-cover transition-all duration-500",
								isLoading ? "opacity-0 scale-110" : "opacity-100 scale-100",
								"group-hover:scale-105",
							)}
							onLoad={handleImageLoad}
							onError={handleImageError}
							priority
							unoptimized
						/>

						{/* Overlay gradient for better text visibility */}
						<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
					</>
				)}

				{/* Sound waves animation for playing state - Spotify-style */}
				{playerState.playing && showControls && size !== "sm" && (
					<div
						className={cn(
							"absolute",
							size === "md" ? "bottom-2 right-2" : "bottom-3 right-3",
						)}
					>
						<div
							className={cn(
								"flex items-end gap-0.5",
								size === "md" ? "h-3" : "h-4",
							)}
						>
							<div
								className={cn(
									"bg-green-400 rounded-full playing-bar",
									size === "md" ? "w-0.5" : "w-0.5",
								)}
								style={{ height: "40%", animationDelay: "0ms" }}
							/>
							<div
								className={cn(
									"bg-green-400 rounded-full playing-bar",
									size === "md" ? "w-0.5" : "w-0.5",
								)}
								style={{ height: "100%", animationDelay: "150ms" }}
							/>
							<div
								className={cn(
									"bg-green-400 rounded-full playing-bar",
									size === "md" ? "w-0.5" : "w-0.5",
								)}
								style={{ height: "60%", animationDelay: "300ms" }}
							/>
							<div
								className={cn(
									"bg-green-400 rounded-full playing-bar",
									size === "md" ? "w-0.5" : "w-0.5",
								)}
								style={{ height: "80%", animationDelay: "450ms" }}
							/>
						</div>
					</div>
				)}
			</div>
		</Card>
	);
};
