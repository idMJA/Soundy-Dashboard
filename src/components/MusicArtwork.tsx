"use client";

import { Music } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useWebSocket } from "./WebSocketProvider";

interface MusicArtworkProps {
	className?: string;
	showControls?: boolean;
	size?: "sm" | "md" | "lg" | "xl";
}

export const MusicArtwork: React.FC<MusicArtworkProps> = ({
	className = "",
	size = "md",
}) => {
	const { playerState } = useWebSocket();
	const track = playerState.track;
	const trackId = track ? `${track.title}-${track.author}` : null;
	const newArtwork = track?.artwork || null;

	const [prevTrackId, setPrevTrackId] = useState<string | null>(null);
	const [currentArtwork, setCurrentArtwork] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(false);

	if (trackId !== prevTrackId) {
		setPrevTrackId(trackId);
		setCurrentArtwork(newArtwork);
		if (newArtwork) {
			setIsLoading(true);
			setError(false);
		} else {
			setIsLoading(false);
			setError(false);
		}
	}

	const sizeClasses = {
		sm: "w-16 h-16",
		md: "w-24 h-24",
		lg: "w-32 h-32",
		xl: "w-full aspect-square",
	};

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
					"flex items-center justify-center bg-zinc-900 border border-zinc-800 relative overflow-hidden",
					size === "xl" ? "w-full aspect-square" : sizeClasses[size],
					className,
				)}
			>
				<div
					className={cn(
						"text-center z-10",
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
							<p className="text-foreground text-sm font-semibold">
								No music playing
							</p>
							<p className="text-muted-foreground text-xs mt-1">
								Start playing to see artwork
							</p>
						</>
					)}
				</div>
			</Card>
		);
	}

	return (
		<Card
			className={cn(
				"overflow-hidden bg-zinc-900 border border-zinc-800 group relative p-0 rounded-lg",
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
					<div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
						<Skeleton className="w-full h-full" />
						<div className="absolute inset-0 flex items-center justify-center">
							<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
								<Music className="w-4 h-4 text-primary" />
							</div>
						</div>
					</div>
				)}

				{error ? (
					<div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
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
					<Image
						src={currentArtwork}
						alt={`Album artwork for ${playerState.track?.title || "Unknown"}`}
						fill
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
						className={cn(
							"object-cover transition-opacity duration-300",
							isLoading ? "opacity-0" : "opacity-100",
						)}
						onLoad={handleImageLoad}
						onError={handleImageError}
						priority
						loading="eager"
						unoptimized
					/>
				)}
			</div>
		</Card>
	);
};
