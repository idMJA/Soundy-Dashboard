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

const MemoizedSyncedLyrics = memo(SyncedLyrics);

export function LyricsDialog() {
	const { playerState } = useWebSocket();
	const [isOpen, setIsOpen] = useState(false);
	const [lastTrackId, setLastTrackId] = useState<string | undefined>(undefined);
	const track = playerState.track;

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
			<DialogContent className="max-w-4xl h-[85vh] p-0">
				<DialogHeader className="px-6 py-4 border-b border-border/50">
					<DialogTitle className="flex justify-between items-center">
						<div className="flex flex-col gap-1">
							<span className="text-lg font-semibold">
								{track?.title || "Unknown"}
							</span>
							<span className="text-sm text-muted-foreground font-normal">
								by {track?.author || "Unknown Artist"}
							</span>
						</div>
						<div className="text-xs text-muted-foreground bg-primary/10 px-2 py-1 rounded-full">
							Apple Music-style
						</div>
					</DialogTitle>
				</DialogHeader>
				<div className="h-[calc(85vh-5rem)] overflow-hidden">
					<MemoizedSyncedLyrics />
				</div>
			</DialogContent>
		</Dialog>
	);
}
