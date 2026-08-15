"use client";

import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

	useEffect(() => {
		let mounted = true;
		const fetchCurrentUser = async () => {
			if (!mounted) return;
			try {
				const response = await fetch("/api/auth/me", {
					credentials: "include",
				});
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
	}, []);

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
			const response = await fetch("/api/playlist/delete", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					userId: playlist.userId,
					playlistId: playlist.id,
				}),
			});

			if (response.ok) {
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
		<div className="space-y-6">
			<div className="flex justify-between items-center border-b border-zinc-800 pb-4 mb-4">
				<h2 className="text-xl font-bold tracking-tight text-foreground">
					My Playlists
				</h2>
				<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
					<DialogTrigger asChild>
						<Button
							disabled={!currentUser}
							className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg transition-all px-4"
						>
							<Plus className="w-4.5 h-4.5 mr-1.5" />
							Create Playlist
						</Button>
					</DialogTrigger>
					<DialogContent className="bg-zinc-900 border border-zinc-800 text-foreground rounded-lg">
						<DialogHeader>
							<DialogTitle className="text-lg font-bold">
								Create New Playlist
							</DialogTitle>
						</DialogHeader>
						<div className="space-y-4 pt-4">
							<div className="space-y-2">
								<Label className="text-xs font-semibold text-muted-foreground uppercase">
									Playlist Name
								</Label>
								<Input
									value={newPlaylistName}
									onChange={(e) => setNewPlaylistName(e.target.value)}
									placeholder="Enter playlist name"
									className="bg-zinc-950 border-zinc-800 focus:border-primary focus:ring-primary text-foreground rounded-lg"
									onKeyPress={(e) => {
										if (e.key === "Enter") {
											handleCreatePlaylist();
										}
									}}
								/>
							</div>
							<div className="flex justify-end space-x-2 pt-2">
								<Button
									variant="outline"
									onClick={() => setIsCreateDialogOpen(false)}
									className="border-zinc-800 text-muted-foreground hover:text-foreground rounded-lg"
								>
									Cancel
								</Button>
								<Button
									onClick={handleCreatePlaylist}
									className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg"
								>
									Create
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			</div>

			{loading && (
				<div className="text-sm text-muted-foreground animate-pulse">
					Loading playlists...
				</div>
			)}
			{error && (
				<div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-lg">
					{error}
				</div>
			)}
			{!currentUser && !loading && (
				<div className="text-sm text-muted-foreground">
					Please log in to view playlists.
				</div>
			)}
			{playlists.length === 0 && !loading && !error && currentUser && (
				<div className="text-sm text-muted-foreground py-8 text-center bg-zinc-950 border border-zinc-800 rounded-lg">
					No playlists found. Create one above to get started!
				</div>
			)}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{playlists.map((playlist) => (
					<Card
						key={playlist.id}
						className="bg-zinc-950 border border-zinc-800 rounded-lg hover:bg-zinc-900 transition-all duration-150 flex flex-col justify-between overflow-hidden shadow-none"
					>
						<CardHeader className="p-5 pb-3">
							<div className="flex justify-between items-start gap-4">
								<CardTitle className="text-base font-bold text-foreground truncate">
									{playlist.name}
								</CardTitle>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => handleDeletePlaylist(playlist)}
									className="h-8 w-8 p-0 rounded-lg text-rose-500 hover:bg-zinc-900 transition-all flex-shrink-0"
								>
									<Trash2 className="w-4.5 h-4.5" />
								</Button>
							</div>
						</CardHeader>
						<CardContent className="p-5 pt-0 flex-1 flex flex-col justify-between">
							<div className="space-y-2">
								<p className="text-xs text-muted-foreground line-clamp-2">
									{playlist.description || "No description provided"}
								</p>
								<p className="text-[11px] font-mono text-primary font-bold">
									Tracks: {playlist.tracks?.length || 0}
								</p>
							</div>
							<div className="flex items-center space-x-2 mt-4 pt-4 border-t border-zinc-900">
								<Button
									size="sm"
									variant="outline"
									onClick={() => {
										window.location.href = `/playlist/${playlist.id}`;
									}}
									className="flex-1 border-zinc-800 text-foreground hover:bg-zinc-900 hover:text-primary transition-all rounded-lg font-semibold text-xs"
								>
									Open Playlist
								</Button>
								<Button
									size="sm"
									variant="ghost"
									onClick={() =>
										window.open(`/api/playlist/view/${playlist.id}`, "_blank")
									}
									className="text-[10px] text-muted-foreground hover:text-foreground h-8"
									title="View Raw API data"
								>
									Raw
								</Button>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
};
