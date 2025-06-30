"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";

interface Playlist {
	id: string;
	name: string;
	description?: string;
	trackCount?: number;
	userId: string;
	guildId: string;
	createdAt: string;
	tracks: Track[];
}

interface Track {
	id: string;
	url: string;
	playlistId: string;
	info: string;
}

export const PlaylistList = () => {
	const [playlists, setPlaylists] = useState<Playlist[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [newPlaylistName, setNewPlaylistName] = useState("");
	const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);

	// Fetch current user - only once
	useEffect(() => {
		let mounted = true;
		const fetchCurrentUser = async () => {
			if (!mounted) return;
			try {
				const response = await fetch("/api/auth/me");
				if (response.ok && mounted) {
					const data = await response.json();
					if (data.success && data.user) {
						setCurrentUser({
							id: data.user.id,
						});
					}
				}
			} catch (error) {
				console.error("Failed to fetch current user:", error);
			}
		};
		fetchCurrentUser();
		return () => {
			mounted = false;
		};
	}, []); // Empty dependency array - run only once

	useEffect(() => {
		const fetchPlaylists = async () => {
			if (!currentUser?.id) return;

			setLoading(true);
			setError(null);
			try {
				const res = await fetch(`/api/playlist/list/${currentUser.id}`);
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
	}, [currentUser?.id]);

	const handleCreatePlaylist = async () => {
		if (!newPlaylistName.trim() || !currentUser?.id) return;

		try {
			console.log("Creating playlist with:", {
				userId: currentUser.id,
				name: newPlaylistName.trim(),
			});

			const response = await fetch("/api/playlist", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					userId: currentUser.id,
					name: newPlaylistName.trim(),
				}),
			});

			console.log("Response status:", response.status);

			if (response.ok) {
				const responseData = await response.json();
				console.log("Response data:", responseData);

				if (responseData.success) {
					setNewPlaylistName("");
					setIsCreateDialogOpen(false);
					setError(null);
					// Refresh playlist list
					const res = await fetch(`/api/playlist/list/${currentUser.id}`);
					if (res.ok) {
						const data = await res.json();
						setPlaylists(data.playlists || []);
					}
				} else {
					const errorMsg = responseData.error || "Failed to create playlist";
					console.error("Create playlist failed:", errorMsg);
					setError(errorMsg);
				}
			} else {
				// Handle non-200 status codes
				try {
					const responseData = await response.json();
					const errorMsg =
						responseData.error ||
						`Failed to create playlist (${response.status})`;
					console.error("Create playlist failed:", errorMsg);
					setError(errorMsg);
				} catch {
					setError(`Failed to create playlist (${response.status})`);
				}
			}
		} catch (error) {
			console.error("Error creating playlist:", error);
			setError(
				"Error creating playlist: " +
					(error instanceof Error ? error.message : "Unknown error"),
			);
		}
	};

	const handleDeletePlaylist = async (playlist: Playlist) => {
		if (
			!confirm(`Are you sure you want to delete "${playlist.name}"?`) ||
			!currentUser?.id
		)
			return;

		try {
			const response = await fetch("/api/playlist", {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					userId: playlist.userId,
					name: playlist.name,
				}),
			});

			if (response.ok) {
				// Refresh playlist list
				const res = await fetch(`/api/playlist/list/${currentUser.id}`);
				if (res.ok) {
					const data = await res.json();
					setPlaylists(data.playlists || []);
				}
			} else {
				setError("Failed to delete playlist");
			}
		} catch {
			setError("Error deleting playlist");
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<h2 className="text-xl font-semibold">My Playlists</h2>
				<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
					<DialogTrigger asChild>
						<Button disabled={!currentUser}>
							<Plus className="w-4 h-4 mr-2" />
							Create Playlist
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Create New Playlist</DialogTitle>
						</DialogHeader>
						<div className="space-y-4">
							<div>
								<Label>Playlist Name</Label>
								<Input
									value={newPlaylistName}
									onChange={(e) => setNewPlaylistName(e.target.value)}
									placeholder="Enter playlist name"
									onKeyPress={(e) => {
										if (e.key === "Enter") {
											handleCreatePlaylist();
										}
									}}
								/>
							</div>
							<div className="flex justify-end space-x-2">
								<Button
									variant="outline"
									onClick={() => setIsCreateDialogOpen(false)}
								>
									Cancel
								</Button>
								<Button onClick={handleCreatePlaylist}>Create</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			</div>

			{loading && <div>Loading playlists...</div>}
			{error && <div className="text-red-500">{error}</div>}
			{!currentUser && !loading && (
				<div className="text-muted-foreground">
					Please log in to view playlists.
				</div>
			)}
			{playlists.length === 0 && !loading && !error && currentUser && (
				<div className="text-muted-foreground">No playlists found.</div>
			)}
			{playlists.map((playlist) => (
				<Card key={playlist.id} className="mb-2">
					<CardHeader>
						<div className="flex justify-between items-start">
							<CardTitle className="text-base">{playlist.name}</CardTitle>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => handleDeletePlaylist(playlist)}
								className="text-red-500 hover:text-red-700"
							>
								<Trash2 className="w-4 h-4" />
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-sm text-muted-foreground mb-2">
							{playlist.description || "No description"}
						</div>
						<div className="text-xs text-muted-foreground mb-2">
							Tracks: {playlist.tracks?.length || 0}
						</div>
						<Button
							size="sm"
							variant="outline"
							onClick={() =>
								window.open(`/api/playlist/viewById/${playlist.id}`, "_blank")
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
