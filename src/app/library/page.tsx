"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LikedSongs } from "@/components/LikedSongs";
import { PlaylistList } from "@/components/PlaylistList";

export default function LibraryPage() {
	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Your Library</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Liked Songs</CardTitle>
						</CardHeader>
						<CardContent>
							<LikedSongs />
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Your Playlists</CardTitle>
						</CardHeader>
						<CardContent>
							<PlaylistList />
						</CardContent>
					</Card>
				</CardContent>
			</Card>
		</div>
	);
}
