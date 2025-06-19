"use client";

import { useState, useEffect, useRef } from "react";
import { useWebSocket } from "./WebSocketProvider";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface MusicArtworkProps {
	className?: string;
}

export const MusicArtworkShadcn: React.FC<MusicArtworkProps> = ({
	className = "",
}) => {
	const { playerState } = useWebSocket();
	const [currentArtwork, setCurrentArtwork] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(false);
	const lastTrackRef = useRef<string | null>(null);

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
			<Card className={`flex items-center justify-center ${className}`}>
				<div className="text-center p-8">
					<div className="text-4xl mb-2">🎵</div>
					<p className="text-muted-foreground text-sm">No music playing</p>
				</div>
			</Card>
		);
	}

	return (
		<Card className={`overflow-hidden ${className}`}>
			<div className="relative aspect-square">
				{isLoading && (
					<div className="absolute inset-0 flex items-center justify-center">
						<Skeleton className="w-full h-full" />
					</div>
				)}

				{error ? (
					<div className="absolute inset-0 bg-muted flex items-center justify-center">
						<div className="text-center">
							<div className="text-4xl mb-2">🎵</div>
							<p className="text-muted-foreground text-sm">
								Image failed to load
							</p>
						</div>
					</div>
				) : (
					/* eslint-disable-next-line @next/next/no-img-element */
					<img
						src={currentArtwork}
						alt="Album artwork"
						className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}
						onLoad={handleImageLoad}
						onError={handleImageError}
					/>
				)}

				{/* Play/Pause indicator */}
				{playerState.track && (
					<div className="absolute top-4 right-4">
						<Badge
							variant={playerState.playing ? "default" : "secondary"}
							className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 p-0 ${
								playerState.playing
									? "bg-green-500 hover:bg-green-600 animate-pulse text-white"
									: "bg-muted hover:bg-muted/80 text-muted-foreground"
							}`}
						>
							{playerState.playing ? (
								<svg
									className="w-3 h-3"
									fill="currentColor"
									viewBox="0 0 24 24"
									aria-label="Playing"
								>
									<title>Playing</title>
									<path d="M6.25 5A1.25 1.25 0 0 0 5 6.25v11.5A1.25 1.25 0 0 0 6.25 19h3.5A1.25 1.25 0 0 0 11 17.75V6.25A1.25 1.25 0 0 0 9.75 5h-3.5Zm7.75 0A1.25 1.25 0 0 0 12.75 6.25v11.5A1.25 1.25 0 0 0 14 19h3.5A1.25 1.25 0 0 0 18.75 17.75V6.25A1.25 1.25 0 0 0 17.5 5H14Z" />
								</svg>
							) : (
								<svg
									className="w-3 h-3"
									fill="currentColor"
									viewBox="0 0 24 24"
									aria-label="Paused"
								>
									<title>Paused</title>
									<path d="m7.25 6.693 8.5 4.904a.5.5 0 0 1 0 .866l-8.5 4.904A.5.5 0 0 1 6.5 16.9V7.1a.5.5 0 0 1 .75-.433Z" />
								</svg>
							)}
						</Badge>
					</div>
				)}

				{/* Overlay with track info */}
				{playerState.track && (
					<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
						<h3 className="text-white font-semibold text-sm mb-1 truncate">
							{playerState.track.title}
						</h3>
						<p className="text-gray-200 text-xs truncate">
							{playerState.track.author}
						</p>
					</div>
				)}
			</div>
		</Card>
	);
};
