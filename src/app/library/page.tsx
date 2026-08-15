"use client";

import { PlaylistList } from "@/components/PlaylistList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LibraryPage() {
	return (
		<div className="space-y-6 animate-fade-in">
			<Card className="bg-zinc-900/20 border border-zinc-800/50 rounded-lg p-6 shadow-none">
				<CardHeader className="border-b border-zinc-800 pb-4 mb-6">
					<CardTitle className="text-2xl font-black tracking-tight text-foreground">
						Your Library
					</CardTitle>
				</CardHeader>
				<CardContent className="p-0">
					<PlaylistList />
				</CardContent>
			</Card>
		</div>
	);
}
