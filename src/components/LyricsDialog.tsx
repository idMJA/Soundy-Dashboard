"use client";

import { useState, useEffect, memo } from "react";
import { useWebSocket } from "./WebSocketProvider";
import { SyncedLyrics } from "./SyncedLyrics";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const LyricsIcon = ({ className }: { className?: string }) => (
	<svg
		className={className || "w-5 h-5"}
		fill="currentColor"
		viewBox="0 0 24 24"
		aria-label="Lyrics"
	>
		<title>Lyrics</title>
		<path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5zm2 0v14h10V5H7zm2 4h6v2H9V9zm0 4h6v2H9v-2z" />
	</svg>
);

// Memoize SyncedLyrics to prevent unnecessary re-renders
const MemoizedSyncedLyrics = memo(SyncedLyrics);

export function LyricsDialog() {
	const { playerState } = useWebSocket();
	const [isOpen, setIsOpen] = useState(false);
	const [lastTrackId, setLastTrackId] = useState<string | undefined>(undefined);
	const track = playerState.track;

	// Only close dialog if the track actually changes (not on every update)
	useEffect(() => {
		if (!track) return;
		const trackId = `${track.title}__${track.author}__${track.duration}`;
		if (lastTrackId && lastTrackId !== trackId) {
			setIsOpen(false);
		}
		setLastTrackId(trackId);
	}, [track, lastTrackId]);

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button
					disabled={!track}
					variant="ghost"
					size="default"
					className="rounded-full w-10 h-10 p-0 hover:bg-primary/10 hover:text-primary transition-all hover:scale-110"
					title="Show lyrics"
				>
					<LyricsIcon className="w-5 h-5" />
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-3xl h-[80vh]">
				<DialogHeader>
					<DialogTitle className="flex justify-between items-center">
						<span>
							Lyrics: {track?.title ? track.title : "Unknown"} -{" "}
							{track?.author ? track.author : "Unknown Artist"}
						</span>
					</DialogTitle>
				</DialogHeader>
				<div className="h-[calc(80vh-7rem)]">
					<MemoizedSyncedLyrics />
				</div>
			</DialogContent>
		</Dialog>
	);
}
