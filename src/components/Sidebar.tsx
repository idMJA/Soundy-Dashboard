"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useWebSocket } from "./WebSocketProvider";
import {
	Home,
	Search,
	Library,
	Settings,
	Plus,
	Heart,
	Download,
	LogOut,
	Music,
	PlayCircle,
	PauseCircle,
	FileText,
	Compass,
	Radio,
} from "lucide-react";

interface SidebarProps {
	isOpen?: boolean;
	onToggle?: () => void;
}

interface Playlist {
	id: string;
	userId: string;
	name: string;
	guildId: string;
	createdAt: string;
	tracks: Array<{
		id: string;
		url: string;
		playlistId: string;
	}>;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true }) => {
	const router = useRouter();
	const pathname = usePathname();
	const { connected, playerState, userContext } = useWebSocket();
	const [playlists, setPlaylists] = useState<Playlist[]>([]);

	// Fetch user playlists
	useEffect(() => {
		const fetchPlaylists = async () => {
			if (!userContext.userId) return;

			try {
				const response = await fetch(
					`/api/playlist/list/${userContext.userId}`,
				);
				if (!response.ok) {
					throw new Error("Failed to fetch playlists");
				}

				const data = await response.json();
				setPlaylists(data.playlists || []);
			} catch (error) {
				console.error("Error fetching playlists:", error);
			}
		};

		fetchPlaylists();
	}, [userContext.userId]);

	const mainMenuItems = [
		{ id: "/", label: "Home", icon: Home, href: "/" },
		{ id: "/search", label: "Search", icon: Search, href: "/search" },
		{ id: "/discover", label: "Discover", icon: Compass, href: "/discover" },
		{ id: "/library", label: "Your Library", icon: Library, href: "/library" },
	];

	const libraryItems = [
		{ id: "/liked", label: "Liked Songs", icon: Heart, href: "/liked" },
		{
			id: "/recent",
			label: "Recently Played",
			icon: Download,
			href: "/recent",
		},
		{ id: "/mixes", label: "Daily Mixes", icon: Radio, href: "/mixes" },
	];

	const settingsItems = [
		{ id: "/settings", label: "Settings", icon: Settings, href: "/settings" },
		{ id: "/logs", label: "Logs", icon: FileText, href: "/logs" },
	];

	const isActiveRoute = (href: string) => {
		if (href === "/") {
			return pathname === "/";
		}
		return pathname.startsWith(href);
	};

	return (
		<div
			className={cn(
				"w-64 bg-sidebar text-sidebar-foreground h-screen flex flex-col fixed left-0 top-0 z-40 transition-transform duration-300 border-r border-sidebar-border",
				isOpen ? "translate-x-0" : "-translate-x-full",
				"lg:translate-x-0",
			)}
		>
			{/* Header */}
			<div className="p-6">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-2">
						<div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
							<Music className="w-4 h-4 text-primary-foreground" />
						</div>
						<span className="text-xl font-bold text-sidebar-foreground">
							Soundy
						</span>
					</div>
					<ThemeToggle />
				</div>
			</div>

			{/* Main Navigation */}
			<nav className="px-3 pb-2">
				<ul className="space-y-1">
					{mainMenuItems.map((item) => (
						<li key={item.id}>
							<Button
								variant={isActiveRoute(item.href) ? "secondary" : "ghost"}
								className={cn(
									"w-full justify-start h-10 px-3 text-sm font-medium transition-colors",
									isActiveRoute(item.href)
										? "bg-sidebar-accent text-sidebar-accent-foreground"
										: "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
								)}
								onClick={() => router.push(item.href)}
							>
								<item.icon className="mr-3 h-4 w-4" />
								{item.label}
							</Button>
						</li>
					))}
				</ul>
			</nav>

			<Separator className="mx-3 bg-sidebar-border" />

			{/* Library Section */}
			<div className="px-3 py-2">
				<div className="flex items-center justify-between mb-2">
					<h3 className="text-sm font-medium text-sidebar-foreground/70">
						Your Library
					</h3>
					<Button
						variant="ghost"
						size="sm"
						className="h-6 w-6 p-0 text-sidebar-foreground/70 hover:text-sidebar-foreground"
					>
						<Plus className="h-4 w-4" />
					</Button>
				</div>
				<ul className="space-y-1">
					{libraryItems.map((item) => (
						<li key={item.id}>
							<Button
								variant={isActiveRoute(item.href) ? "secondary" : "ghost"}
								className={cn(
									"w-full justify-start h-10 px-3 text-sm font-medium transition-colors",
									isActiveRoute(item.href)
										? "bg-sidebar-accent text-sidebar-accent-foreground"
										: "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
								)}
								onClick={() => router.push(item.href)}
							>
								<item.icon className="mr-3 h-4 w-4" />
								{item.label}
							</Button>
						</li>
					))}
				</ul>
			</div>

			{/* Scrollable Area for Playlists */}
			<ScrollArea className="flex-1 px-3">
				<div className="py-2">
					<h3 className="text-sm font-medium text-sidebar-foreground/70 mb-2">
						My Playlists
					</h3>
					<div className="space-y-1">
						{playlists.length > 0 ? (
							playlists.map((playlist) => (
								<Button
									key={playlist.id}
									variant="ghost"
									className="w-full justify-start h-10 px-3 text-sm font-normal text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
									onClick={() => router.push(`/playlist/${playlist.id}`)}
								>
									<div className="w-4 h-4 mr-3 bg-sidebar-foreground/20 rounded-sm flex items-center justify-center">
										<Music className="w-2 h-2" />
									</div>
									<div className="flex-1 min-w-0">
										<span className="truncate">{playlist.name}</span>
										<div className="text-xs text-sidebar-foreground/50">
											{playlist.tracks.length} tracks
										</div>
									</div>
								</Button>
							))
						) : (
							<div className="text-center py-4">
								<div className="text-xs text-sidebar-foreground/50">
									No playlists yet
								</div>
							</div>
						)}
					</div>
				</div>
			</ScrollArea>

			<Separator className="mx-3 bg-sidebar-border" />

			{/* Settings Section */}
			<div className="px-3 py-2">
				<ul className="space-y-1">
					{settingsItems.map((item) => (
						<li key={item.id}>
							<Button
								variant={isActiveRoute(item.href) ? "secondary" : "ghost"}
								className={cn(
									"w-full justify-start h-10 px-3 text-sm font-medium transition-colors",
									isActiveRoute(item.href)
										? "bg-sidebar-accent text-sidebar-accent-foreground"
										: "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
								)}
								onClick={() => router.push(item.href)}
							>
								<item.icon className="mr-3 h-4 w-4" />
								{item.label}
							</Button>
						</li>
					))}
				</ul>
			</div>

			{/* Connection Status & Now Playing */}
			<div className="p-3 space-y-3 border-t border-sidebar-border">
				{/* Connection Status */}
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-2">
						<div
							className={cn(
								"w-2 h-2 rounded-full",
								connected ? "bg-primary animate-pulse" : "bg-destructive",
							)}
						/>
						<span className="text-xs text-sidebar-foreground/70">
							{connected ? "Connected" : "Disconnected"}
						</span>
					</div>
					{connected && (
						<Badge variant="secondary" className="text-xs">
							{userContext.userId ? "Authenticated" : "Guest"}
						</Badge>
					)}
				</div>

				{/* Now Playing Mini Card */}
				{playerState.track && (
					<div className="bg-sidebar-accent rounded-lg p-3 space-y-2">
						<div className="flex items-center space-x-2">
							<div className="w-8 h-8 bg-primary/20 rounded flex items-center justify-center">
								{playerState.playing ? (
									<PauseCircle className="w-4 h-4 text-primary" />
								) : (
									<PlayCircle className="w-4 h-4 text-primary" />
								)}
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-xs font-medium text-sidebar-accent-foreground truncate">
									{playerState.track.title}
								</p>
								<p className="text-xs text-sidebar-accent-foreground/70 truncate">
									{playerState.track.author}
								</p>
							</div>
						</div>
						<div className="flex items-center space-x-1">
							<div
								className={cn(
									"w-1 h-1 rounded-full",
									playerState.playing ? "bg-primary animate-pulse" : "bg-muted",
								)}
							/>
							<span className="text-xs text-sidebar-accent-foreground/70">
								{playerState.playing ? "Playing" : "Paused"}
							</span>
						</div>
					</div>
				)}

				{/* User Profile (if connected) */}
				{connected && userContext.userId && (
					<div className="flex items-center space-x-2">
						<Avatar className="h-6 w-6">
							<AvatarImage
								src={
									userContext.avatar
										? `https://cdn.discordapp.com/avatars/${userContext.userId}/${userContext.avatar}.webp`
										: ""
								}
								alt="User"
							/>
							<AvatarFallback className="text-xs">
								{userContext.userId.slice(0, 2).toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<span className="text-xs text-sidebar-foreground/70 flex-1 truncate">
							{userContext.globalName}
						</span>
						<Button
							variant="ghost"
							size="sm"
							className="h-6 w-6 p-0 text-sidebar-foreground/70 hover:text-sidebar-foreground"
						>
							<LogOut className="h-3 w-3" />
						</Button>
					</div>
				)}
			</div>
		</div>
	);
};
