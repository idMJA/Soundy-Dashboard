"use client";

import {
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	Compass,
	Download,
	FileText,
	Heart,
	Home,
	Library,
	LogOut,
	Music,
	Search,
	Settings,
	Sparkles,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { type ComponentType, useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useWebSocket } from "./WebSocketProvider";

interface SidebarProps {
	isOpen?: boolean;
	onToggle?: () => void;
	isCollapsed?: boolean;
	onCollapseToggle?: () => void;
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

export const Sidebar: React.FC<SidebarProps> = ({
	isOpen = true,
	isCollapsed = false,
	onCollapseToggle,
}) => {
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
		{
			id: "/analytics",
			label: "Soundy Wrapped",
			icon: Sparkles,
			href: "/analytics",
		},
	];

	const libraryItems = [
		{ id: "/liked", label: "Liked Songs", icon: Heart, href: "/liked" },
		{
			id: "/recent",
			label: "Recently Played",
			icon: Download,
			href: "/recent",
		},
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

	const renderNavItem = (item: {
		label: string;
		icon: ComponentType<{ className?: string }>;
		href: string;
		id: string;
	}) => {
		const active = isActiveRoute(item.href);
		const iconColorClass = active ? "text-primary" : "group-hover:text-primary";

		const buttonContent = (
			<Button
				variant={active ? "secondary" : "ghost"}
				className={cn(
					"w-full transition-all duration-200 rounded-xl group relative overflow-hidden",
					isCollapsed
						? "h-11 w-11 justify-center p-0 mx-auto"
						: "justify-start h-10 px-4 text-sm font-medium",
					active
						? "bg-primary/10 text-foreground border border-primary/20"
						: "text-sidebar-foreground/80 hover:bg-white/5 hover:text-foreground",
				)}
				onClick={() => router.push(item.href)}
			>
				{active && isCollapsed && (
					<div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
				)}
				<item.icon
					className={cn(
						isCollapsed ? "h-5 w-5" : "mr-3 h-4.5 w-4.5",
						"transition-all",
						iconColorClass,
					)}
				/>
				{!isCollapsed && <span>{item.label}</span>}
			</Button>
		);

		if (isCollapsed) {
			return (
				<Tooltip key={item.id} delayDuration={100}>
					<TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
					<TooltipContent
						side="right"
						className="bg-zinc-900 border-zinc-800 text-foreground font-semibold text-xs px-2.5 py-1.5 rounded-lg shadow-xl"
					>
						{item.label}
					</TooltipContent>
				</Tooltip>
			);
		}

		return <li key={item.id}>{buttonContent}</li>;
	};

	return (
		<TooltipProvider>
			<div
				className={cn(
					"bg-background/80 backdrop-blur-xl border-r border-border/40 text-sidebar-foreground h-screen flex flex-col fixed left-0 top-0 z-40 transition-all duration-300 ease-in-out",
					isOpen ? "translate-x-0" : "-translate-x-full",
					isCollapsed ? "w-20" : "w-64",
					"lg:translate-x-0",
				)}
			>
				{/* Header */}
				<div
					className={cn(
						"p-4 border-b border-border/30 flex items-center justify-between",
						isCollapsed ? "justify-center h-[69px]" : "h-[69px]",
					)}
				>
					<div className="flex items-center space-x-3">
						<div className="flex items-center gap-2">
							<div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
							{!isCollapsed && (
								<span className="text-lg font-black text-foreground tracking-wide font-heading">
									Soundy
								</span>
							)}
						</div>
					</div>
					{!isCollapsed && <ThemeToggle />}
				</div>

				{/* Scrollable content */}
				<ScrollArea className="flex-1 min-h-0 thin-scrollbar">
					<div className="flex flex-col py-4">
						{/* Main Navigation */}
						<nav className="px-3">
							<ul className="space-y-1.5">
								{mainMenuItems.map((item) => renderNavItem(item))}
							</ul>
						</nav>

						<Separator className="my-4 mx-3 bg-border/40" />

						{/* Library Section */}
						{isCollapsed ? (
							<div className="px-3 space-y-1.5">
								{libraryItems.map((item) => renderNavItem(item))}
							</div>
						) : (
							<div className="px-3">
								<div className="flex items-center justify-between mb-1.5">
									<Button
										variant="ghost"
										className="w-full justify-start h-9 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 hover:bg-white/5 hover:text-foreground"
										onClick={() => setIsLibraryOpen(!isLibraryOpen)}
									>
										<Library className="h-4 w-4 mr-2 text-primary" />
										<span>Your Library</span>
										<span className="ml-auto flex items-center">
											{isLibraryOpen ? (
												<ChevronDown className="h-3.5 w-3.5" />
											) : (
												<ChevronRight className="h-3.5 w-3.5" />
											)}
										</span>
									</Button>
								</div>
								<div
									className={cn(
										"overflow-hidden transition-all duration-300",
										isLibraryOpen
											? "max-h-40 opacity-100"
											: "max-h-0 opacity-0",
									)}
								>
									<ul className="space-y-1 pl-1">
										{libraryItems.map((item) => (
											<li key={item.id}>
												<Button
													variant={
														isActiveRoute(item.href) ? "secondary" : "ghost"
													}
													className={cn(
														"w-full justify-start h-9 px-3 text-sm font-medium transition-all duration-200 rounded-lg",
														isActiveRoute(item.href)
															? "bg-primary/10 text-foreground border border-primary/10"
															: "text-sidebar-foreground/75 hover:bg-white/5 hover:text-foreground",
													)}
													onClick={() => router.push(item.href)}
												>
													<item.icon
														className={cn(
															"mr-3 h-4 w-4",
															isActiveRoute(item.href) ? "text-primary" : "",
														)}
													/>
													{item.label}
												</Button>
											</li>
										))}
									</ul>
								</div>
							</div>
						)}

						<Separator className="my-4 mx-3 bg-border/40" />

						{/* Playlists Section */}
						{isCollapsed ? (
							<div className="px-3 space-y-1.5">
								{playlists.slice(0, 3).map((p) => {
									const active = isActiveRoute(`/playlist/${p.id}`);
									const buttonContent = (
										<Button
											variant={active ? "secondary" : "ghost"}
											className={cn(
												"w-11 h-11 rounded-xl p-0 mx-auto transition-all flex items-center justify-center",
												active
													? "bg-primary/10 border border-primary/20 text-primary"
													: "text-sidebar-foreground/70 hover:bg-white/5",
											)}
											onClick={() => router.push(`/playlist/${p.id}`)}
										>
											<Music className="w-4 h-4 text-primary" />
										</Button>
									);
									return (
										<Tooltip key={p.id} delayDuration={100}>
											<TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
											<TooltipContent
												side="right"
												className="bg-zinc-900 border-zinc-800 text-foreground font-semibold text-xs px-2.5 py-1.5 rounded-lg shadow-xl"
											>
												{p.name}
											</TooltipContent>
										</Tooltip>
									);
								})}
							</div>
						) : (
							<div className="px-3">
								<Button
									variant="ghost"
									className="w-full justify-start h-9 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 hover:bg-white/5 hover:text-foreground mb-1.5"
									onClick={() => setIsPlaylistsOpen(!isPlaylistsOpen)}
								>
									<Music className="h-4 w-4 mr-2 text-primary" />
									<span>My Playlists</span>
									<span className="ml-auto flex items-center">
										{isPlaylistsOpen ? (
											<ChevronDown className="h-3.5 w-3.5" />
										) : (
											<ChevronRight className="h-3.5 w-3.5" />
										)}
									</span>
								</Button>
								<div
									className={cn(
										"overflow-hidden transition-all duration-300",
										isPlaylistsOpen
											? "max-h-60 opacity-100"
											: "max-h-0 opacity-0",
									)}
								>
									<div className="space-y-1 pl-1">
										{playlists.length > 0 ? (
											playlists.map((playlist) => (
												<Button
													key={playlist.id}
													variant="ghost"
													className="w-full justify-start h-auto p-1.5 text-sm font-normal text-sidebar-foreground/75 hover:text-foreground hover:bg-white/5 rounded-xl transition-all duration-200"
													onClick={() =>
														router.push(`/playlist/${playlist.id}`)
													}
												>
													<div className="w-8 h-8 mr-2.5 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center border border-primary/10 flex-shrink-0">
														<Music className="w-3.5 h-3.5 text-primary" />
													</div>
													<div className="flex-1 min-w-0 text-left">
														<div className="truncate font-semibold text-xs text-sidebar-foreground">
															{playlist.name}
														</div>
														<div className="text-[10px] text-muted-foreground">
															{playlist.tracks.length} track
															{playlist.tracks.length !== 1 ? "s" : ""}
														</div>
													</div>
												</Button>
											))
										) : (
											<div className="text-center py-4 bg-white/5 rounded-xl border border-border/10 mx-1">
												<Music className="h-4 w-4 text-muted-foreground/60 mx-auto mb-1" />
												<div className="text-[10px] text-muted-foreground">
													No playlists yet
												</div>
											</div>
										)}
									</div>
								</div>
							</div>
						)}

						<Separator className="my-4 mx-3 bg-border/40" />

						{/* Settings Section */}
						<div className="px-3">
							{settingsItems.map((item) => renderNavItem(item))}
						</div>
					</div>
				</ScrollArea>

				{/* Bottom Area */}
				<div className="p-3 border-t border-border/30 bg-background/90 flex flex-col gap-3">
					{/* Live Indicator (only in expanded mode) */}
					{!isCollapsed && (
						<div className="flex items-center justify-between px-1">
							<div className="flex items-center space-x-2">
								<div
									className={cn(
										"w-2 h-2 rounded-full transition-all",
										connected ? "bg-primary animate-pulse" : "bg-destructive",
									)}
								/>
								<span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
									{connected ? "Connected" : "Disconnected"}
								</span>
							</div>
							{connected && (
								<Badge
									variant="secondary"
									className="text-[10px] h-4 px-1.5 bg-primary/10 text-primary border-primary/20 rounded-full font-bold"
								>
									{userContext.userId ? "Live" : "Guest"}
								</Badge>
							)}
						</div>
					)}

					{/* User profile & collapse toggle button */}
					<div
						className={cn(
							"flex items-center gap-2",
							isCollapsed ? "flex-col" : "flex-row",
						)}
					>
						{connected && userContext.userId ? (
							isCollapsed ? (
								<Tooltip delayDuration={100}>
									<TooltipTrigger asChild>
										<Avatar className="h-9 w-9 border border-primary/20 cursor-pointer">
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
									</TooltipTrigger>
									<TooltipContent
										side="right"
										className="bg-zinc-900 border-zinc-800 text-foreground font-semibold text-xs px-2.5 py-1.5 rounded-lg shadow-xl"
									>
										{userContext.globalName || "User"}
									</TooltipContent>
								</Tooltip>
							) : (
								<div className="flex-1 flex items-center space-x-2 p-1.5 bg-white/5 border border-border/20 rounded-xl min-w-0">
									<Avatar className="h-8 w-8 border border-primary/20 flex-shrink-0">
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
									<div className="flex-1 min-w-0 text-left">
										<div className="text-xs font-bold text-foreground truncate">
											{userContext.globalName || "User"}
										</div>
										<div className="text-[10px] text-muted-foreground truncate">
											{userContext.guildId ? "Server Member" : "Direct User"}
										</div>
									</div>
									<Button
										variant="ghost"
										size="sm"
										className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
									>
										<LogOut className="h-3.5 w-3.5" />
									</Button>
								</div>
							)
						) : null}

						{/* Collapse Toggle Button */}
						<Button
							variant="ghost"
							size="sm"
							onClick={onCollapseToggle}
							className={cn(
								"h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-all",
								isCollapsed ? "mx-auto" : "ml-auto flex-shrink-0",
							)}
							title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
						>
							{isCollapsed ? (
								<ChevronRight className="h-4 w-4" />
							) : (
								<ChevronLeft className="h-4 w-4" />
							)}
						</Button>
					</div>
				</div>
			</div>
		</TooltipProvider>
	);
};
