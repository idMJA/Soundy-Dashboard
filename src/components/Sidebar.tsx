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
	Heart,
	Download,
	LogOut,
	Music,
	FileText,
	Compass,
	ChevronDown,
	ChevronRight,
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
	const { connected, userContext } = useWebSocket();
	const [playlists, setPlaylists] = useState<Playlist[]>([]);
	const [isLibraryOpen, setIsLibraryOpen] = useState(true);
	const [isPlaylistsOpen, setIsPlaylistsOpen] = useState(true);

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
		// { id: "/mixes", label: "Daily Mixes", icon: Radio, href: "/mixes" },
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
				"w-64 bg-sidebar text-sidebar-foreground h-screen flex flex-col fixed left-0 top-0 z-40 transition-all duration-300 border-r border-sidebar-border/50 shadow-modern",
				isOpen ? "translate-x-0" : "-translate-x-full",
				"lg:translate-x-0",
			)}
		>
			{/* Scrollable main content */}
			<ScrollArea className="flex-1 min-h-0">
				<div className="flex flex-col">
					{/* Header */}
					<div className="p-6 border-b border-sidebar-border/30">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-3">
								<div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg">
									<Music className="w-5 h-5 text-white" />
								</div>
								<div>
									<span className="text-xl font-bold text-sidebar-foreground">
										Soundy
									</span>
									<div className="text-xs text-sidebar-foreground/60">
										Music Dashboard
									</div>
								</div>
							</div>
							<ThemeToggle />
						</div>
					</div>

					{/* Main Navigation */}
					<nav className="px-4 py-4">
						<ul className="space-y-2">
							{mainMenuItems.map((item) => (
								<li key={item.id}>
									<Button
										variant={isActiveRoute(item.href) ? "secondary" : "ghost"}
										className={cn(
											"w-full justify-start h-11 px-4 text-sm font-medium transition-all duration-200 rounded-xl group",
											isActiveRoute(item.href)
												? "bg-primary/10 text-primary shadow-sm border border-primary/20"
												: "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-sm",
										)}
										onClick={() => router.push(item.href)}
									>
										<item.icon
											className={cn(
												"mr-3 h-5 w-5 transition-all",
												isActiveRoute(item.href)
													? "text-primary"
													: "group-hover:scale-110",
											)}
										/>
										{item.label}
									</Button>
								</li>
							))}
						</ul>
					</nav>

					<Separator className="mx-4 bg-sidebar-border/50" />

					{/* Library Section */}
					<div className="px-4 pt-4">
						<div className="flex items-center justify-between mb-3">
							<Button
								variant="ghost"
								className="w-full justify-start h-10 px-3 text-sm font-medium transition-all duration-200 rounded-lg"
								onClick={() => setIsLibraryOpen(!isLibraryOpen)}
							>
								<Library className="h-4 w-4 mr-2" />
								<span>Your Library</span>
								<span className="ml-auto flex items-center">
									{isLibraryOpen ? (
										<ChevronDown className="h-4 w-4" />
									) : (
										<ChevronRight className="h-4 w-4" />
									)}
								</span>
							</Button>
						</div>
						<div
							className={cn(
								"overflow-hidden transition-all duration-300",
								isLibraryOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0",
							)}
						>
							<ul className="space-y-1 pl-3">
								{libraryItems.map((item) => (
									<li key={item.id}>
										<Button
											variant={isActiveRoute(item.href) ? "secondary" : "ghost"}
											className={cn(
												"w-full justify-start h-10 px-3 text-sm font-medium transition-all duration-200 rounded-lg",
												isActiveRoute(item.href)
													? "bg-primary/10 text-primary"
													: "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
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
					</div>

					{/* Playlists Section */}
					<div className="px-4 pb-2">
						<Button
							variant="ghost"
							className="w-full justify-start h-10 px-3 text-sm font-medium transition-all duration-200 rounded-lg mb-3"
							onClick={() => setIsPlaylistsOpen(!isPlaylistsOpen)}
						>
							<Music className="h-4 w-4 mr-2" />
							<span>My Playlists</span>
							<span className="ml-auto flex items-center">
								{isPlaylistsOpen ? (
									<ChevronDown className="h-4 w-4" />
								) : (
									<ChevronRight className="h-4 w-4" />
								)}
							</span>
						</Button>
						<div
							className={cn(
								"overflow-hidden transition-all duration-300",
								isPlaylistsOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0",
							)}
						>
							<div className="space-y-1">
								{playlists.length > 0 ? (
									playlists.map((playlist) => (
										<Button
											key={playlist.id}
											variant="ghost"
											className="w-full justify-start h-auto p-3 text-sm font-normal text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-all duration-200"
											onClick={() => router.push(`/playlist/${playlist.id}`)}
										>
											<div className="w-10 h-10 mr-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
												<Music className="w-4 h-4 text-primary" />
											</div>
											<div className="flex-1 min-w-0 text-left">
												<div className="truncate font-medium">
													{playlist.name}
												</div>
												<div className="text-xs text-sidebar-foreground/50">
													{playlist.tracks.length} track
													{playlist.tracks.length !== 1 ? "s" : ""}
												</div>
											</div>
										</Button>
									))
								) : (
									<div className="text-center py-8">
										<div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mx-auto mb-3">
											<Music className="h-6 w-6 text-muted-foreground" />
										</div>
										<div className="text-sm text-sidebar-foreground/60 mb-1">
											No playlists yet
										</div>
										<div className="text-xs text-sidebar-foreground/40">
											Create your first playlist
										</div>
									</div>
								)}
							</div>
						</div>
					</div>

					<Separator className="mx-4 bg-sidebar-border/50" />

					{/* Settings Section */}
					<div className="px-4 py-3">
						<ul className="space-y-1">
							{settingsItems.map((item) => (
								<li key={item.id}>
									<Button
										variant={isActiveRoute(item.href) ? "secondary" : "ghost"}
										className={cn(
											"w-full justify-start h-10 px-3 text-sm font-medium transition-all duration-200 rounded-lg",
											isActiveRoute(item.href)
												? "bg-primary/10 text-primary"
												: "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
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
				</div>
			</ScrollArea>

			{/* Connection Status & Now Playing (fixed at bottom) */}
			<div className="p-4 space-y-4 border-t border-sidebar-border/30 bg-sidebar-accent/30">
				{/* Connection Status */}
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-3">
						<div
							className={cn(
								"w-3 h-3 rounded-full shadow-sm",
								connected ? "bg-primary pulse-green" : "bg-destructive",
							)}
						/>
						<span className="text-sm font-medium text-sidebar-foreground/80">
							{connected ? "Connected" : "Disconnected"}
						</span>
					</div>
					{connected && (
						<Badge
							variant="secondary"
							className="text-xs bg-primary/10 text-primary border-primary/20"
						>
							{userContext.userId ? "Live" : "Guest"}
						</Badge>
					)}
				</div>

				{/* User Profile (if connected) */}
				{connected && userContext.userId && (
					<div className="flex items-center space-x-3 p-3 bg-sidebar-accent/50 rounded-xl">
						<Avatar className="h-8 w-8 border-2 border-primary/20">
							<AvatarImage
								src={
									userContext.avatar
										? `https://cdn.discordapp.com/avatars/${userContext.userId}/${userContext.avatar}.webp`
										: ""
								}
								alt="User"
							/>
							<AvatarFallback className="text-xs bg-primary/10 text-primary">
								{userContext.userId.slice(0, 2).toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<div className="flex-1 min-w-0">
							<div className="text-sm font-medium text-sidebar-foreground truncate">
								{userContext.globalName || "User"}
							</div>
							<div className="text-xs text-sidebar-foreground/60">
								{userContext.guildId ? "Server Member" : "Direct User"}
							</div>
						</div>
						<Button
							variant="ghost"
							size="sm"
							className="h-8 w-8 p-0 text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
						>
							<LogOut className="h-4 w-4" />
						</Button>
					</div>
				)}
			</div>
		</div>
	);
};
