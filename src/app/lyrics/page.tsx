"use client";

import { SyncedLyrics } from "@/components/SyncedLyrics";
import { useWebSocket } from "@/components/WebSocketProvider";

export default function LyricsPage() {
	const { playerState } = useWebSocket();
	const track = playerState.track;

	return (
		<div className="min-h-screen bg-background">
			<div className="h-[calc(100vh-5rem)]">
				<SyncedLyrics />
			</div>

			{track && (
				<div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-sm border-t p-3">
					<div className="text-center">
						<p className="text-sm font-medium">{track.title}</p>
						<p className="text-xs text-muted-foreground">{track.author}</p>
					</div>
				</div>
			)}
		</div>
	);
}
