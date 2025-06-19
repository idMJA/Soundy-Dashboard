"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Playlist {
	id: string;
	name: string;
	description?: string;
	trackCount?: number;
}

export const PlaylistList = () => {
	const [playlists, setPlaylists] = useState<Playlist[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchPlaylists = async () => {
			setLoading(true);
			setError(null);
			try {
				// Ganti guildId sesuai kebutuhan, bisa juga dari context
				const guildId = "885731228874051624";
				const res = await fetch(
					`http://localhost:4000/api/playlist/list/${guildId}`,
				);
				if (!res.ok) throw new Error("Failed to fetch playlists");
				const data = await res.json();
				setPlaylists(data.playlists || []);
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "Failed to fetch playlists",
				);
			} finally {
				setLoading(false);
			}
		};
		fetchPlaylists();
	}, []);

	return (
		<div className="space-y-4">
			{loading && <div>Loading playlists...</div>}
			{error && <div className="text-red-500">{error}</div>}
			{playlists.length === 0 && !loading && !error && (
				<div className="text-muted-foreground">No playlists found.</div>
			)}
			{playlists.map((playlist) => (
				<Card key={playlist.id} className="mb-2">
					<CardHeader>
						<CardTitle className="text-base">{playlist.name}</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-sm text-muted-foreground mb-2">
							{playlist.description || "No description"}
						</div>
						<div className="text-xs text-muted-foreground mb-2">
							Tracks: {playlist.trackCount ?? "-"}
						</div>
						<Button
							size="sm"
							variant="outline"
							onClick={() =>
								window.open(
									`http://localhost:4000/api/playlist/viewById/${playlist.id}`,
									"_blank",
								)
							}
						>
							View Playlist
						</Button>
					</CardContent>
				</Card>
			))}
		</div>
	);
};
