"use client";

import { SyncedLyrics } from "@/components/SyncedLyrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LyricsPage() {
	return (
		<div className="container mx-auto p-6 max-w-3xl space-y-6">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-3xl font-bold">Live Lyrics</h1>
			</div>
			<Card className="shadow-xl h-[70vh]">
				<CardHeader>
					<CardTitle>Synced Lyrics</CardTitle>
				</CardHeader>
				<CardContent className="h-[calc(70vh-5rem)]">
					<SyncedLyrics />
				</CardContent>
			</Card>
		</div>
	);
}
