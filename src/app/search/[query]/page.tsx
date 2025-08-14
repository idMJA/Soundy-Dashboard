"use client";

import { useState, useEffect, useRef } from "react";
import {
	Search,
	X,
	Play,
	Plus,
	Heart,
	MoreHorizontal,
	Clock,
	TrendingUp,
	Music,
	Coffee,
	Zap,
	Brain,
	ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useWebSocket } from "@/components/WebSocketProvider";

interface WebSocketCommand {
	type: string;
	[key: string]: unknown;
}

interface SearchResult {
	id: string;
	title: string;
	artist: string;
	album?: string;
	duration?: string;
	artwork?: string;
	type: "song" | "playlist" | "artist" | "album";
	isPlaying?: boolean;
	url?: string;
	uri?: string;
}

interface SearchCategory {
	id: string;
	name: string;
	icon: React.ReactNode;
	color: string;
	description: string;
	searchQuery?: string;
}

const searchCategories: SearchCategory[] = [
	{
		id: "trending",
		name: "Trending",
		icon: <TrendingUp className="w-6 h-6" />,
		color: "bg-gradient-to-br from-pink-500 to-rose-500",
		description: "What's hot right now",
		searchQuery: "trending music 2024",
	},
	{
		id: "chill",
		name: "Chill",
		icon: <Coffee className="w-6 h-6" />,
		color: "bg-gradient-to-br from-blue-500 to-cyan-500",
		description: "Relax and unwind",
		searchQuery: "chill lofi ambient relaxing music",
	},
	{
		id: "party",
		name: "Party",
		icon: <Zap className="w-6 h-6" />,
		color: "bg-gradient-to-br from-purple-500 to-indigo-500",
		description: "Turn up the energy",
		searchQuery: "party dance electronic music",
	},
	{
		id: "focus",
		name: "Focus",
		icon: <Brain className="w-6 h-6" />,
		color: "bg-gradient-to-br from-green-500 to-emerald-500",
		description: "Deep concentration",
		searchQuery: "focus study concentration instrumental music",
	},
];

const recentSearches = [
	"Lo-fi Hip Hop",
	"Synthwave",
	"Indie Rock",
	"Jazz Fusion",
	"Electronic Chill",
];

interface SearchQueryPageProps {
	params: {
		query: string;
	};
}

export default function SearchQueryPage({ params }: SearchQueryPageProps) {
	const decodedQuery = decodeURIComponent(params.query);
	const { connected, userContext, sendCommand } = useWebSocket();
	const [query, setQuery] = useState(decodedQuery || "");
	const [results, setResults] = useState<SearchResult[]>([]);
	const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
	const [likeLoading, setLikeLoading] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	// Initial search if initialQuery is provided
	useEffect(() => {
		if (decodedQuery) {
			setQuery(decodedQuery);
		}
	}, [decodedQuery]);

	// Debounced search effect
	useEffect(() => {
		const formatDurationInternal = (ms: number): string => {
			const seconds = Math.floor(ms / 1000);
			const minutes = Math.floor(seconds / 60);
			const remainingSeconds = seconds % 60;
			return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
		};

		const performSearchInternal = async (searchQuery: string) => {
			if (!searchQuery.trim()) {
				setResults([]);
				return;
			}

			setIsLoading(true);
			setError(null);

			try {
				const response = await fetch(
					`/api/music/search?q=${encodeURIComponent(searchQuery)}`,
				);

				if (!response.ok) {
					throw new Error(`Search failed: ${response.statusText}`);
				}

				const data = await response.json();

				interface ApiTrack {
					title: string;
					author: string;
					duration: number;
					uri: string;
					artwork: string;
					isStream: boolean;
				}

				const searchResults: SearchResult[] = (data.tracks || []).map(
					(track: ApiTrack, index: number) => ({
						id: track.uri || `result-${index}`,
						title: track.title || "Unknown Title",
						artist: track.author || "Unknown Artist",
						album: undefined,
						duration: formatDurationInternal(track.duration),
						artwork: track.artwork,
						type: "song" as const,
						url: track.uri,
						uri: track.uri,
					}),
				);

				setResults(searchResults);
			} catch (err) {
				console.error("Search error:", err);
				setError(err instanceof Error ? err.message : "Search failed");
				setResults([]);
			} finally {
				setIsLoading(false);
			}
		};

		if (query.length > 2) {
			const timer = setTimeout(() => {
				performSearchInternal(query);
			}, 500);
			return () => clearTimeout(timer);
		} else {
			setResults([]);
			setError(null);
		}
	}, [query]);

	const handleCategoryClick = (categoryId: string) => {
		const category = searchCategories.find((c) => c.id === categoryId);
		setSelectedCategory(categoryId);
		if (category?.searchQuery) {
			setQuery(category.searchQuery);
		}
	};
	const handleSearch = (searchTerm: string) => {
		setQuery(searchTerm);
		setShowSuggestions(false);
	};

	const clearSearch = () => {
		setQuery("");
		setResults([]);
		setSelectedCategory(null);
		setError(null);
		inputRef.current?.focus();
	};
	const handlePlay = (result: SearchResult) => {
		if (!connected || !userContext.userId) {
			console.warn("Not connected or no user ID available");
			return;
		}

		const guildId = userContext.guildId;
		const channelId = userContext.voiceChannelId;
		const userId = userContext.userId;

		const query =
			result.uri || result.url || `${result.title} ${result.artist}`;
		if (!query) {
			console.warn("No valid query found in the result");
			return;
		}

		if (userId && ((guildId && channelId) || !guildId)) {
			const command: Record<string, unknown> = {
				type: "play",
				query,
				userId,
			};
			if (guildId) command.guildId = guildId;
			if (channelId) command.voiceChannelId = channelId;
			sendCommand(command as WebSocketCommand);
		} else {
			console.log(
				"Missing required fields for play. Need userId and either (guildId+channelId) or just userId",
			);
		}
	};

	const handlePlayDirect = (searchQuery: string) => {
		if (!connected || !userContext.userId) {
			console.warn("Not connected or no user ID available");
			return;
		}

		const guildId = userContext.guildId;
		const channelId = userContext.voiceChannelId;
		const userId = userContext.userId;

		if (userId && ((guildId && channelId) || !guildId)) {
			const command: Record<string, unknown> = {
				type: "play",
				query: searchQuery,
				userId,
			};
			if (guildId) command.guildId = guildId;
			if (channelId) command.voiceChannelId = channelId;
			sendCommand(command as WebSocketCommand);
		} else {
			console.log(
				"Missing required fields for play. Need userId and either (guildId+channelId) or just userId",
			);
		}
	};

	const handleAddToPlaylist = (result: SearchResult) => {
		if (!connected || !userContext.userId) {
			console.warn("Not connected or no user ID available");
			return;
		}

		const guildId = userContext.guildId;
		const channelId = userContext.voiceChannelId;
		const userId = userContext.userId;

		if (userId && ((guildId && channelId) || !guildId)) {
			const command: Record<string, unknown> = {
				type: "add",
				query: result.uri || result.url || `${result.title} ${result.artist}`,
				userId,
			};

			if (guildId) command.guildId = guildId;
			if (channelId) command.voiceChannelId = channelId;

			sendCommand(command as WebSocketCommand);
		}
	};
	const handleLike = async (result: SearchResult) => {
		if (!userContext?.userId) return;
		setLikeLoading(result.id);
		const isLiked = likedIds.has(result.id);
		try {
			const payload = {
				userId: userContext.userId,
				uri: result.uri,
				action: isLiked ? "unlike" : "like",
			};
			const res = await fetch("/api/music/like", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			if (!res.ok) throw new Error("Failed to update like");
			setLikedIds((prev) => {
				const next = new Set(prev);
				if (isLiked) {
					next.delete(result.id);
				} else {
					next.add(result.id);
				}
				return next;
			});
		} catch {
			// Optionally show error
		} finally {
			setLikeLoading(null);
		}
	};

	const handleOpenInBrowser = (result: SearchResult) => {
		if (result.url) {
			window.open(result.url, "_blank");
		}
	};

	if (!connected) {
		return (
			<div className="flex flex-col items-center justify-center h-96 space-y-4">
				<div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
					<Music className="w-8 h-8 text-muted-foreground" />
				</div>
				<div className="text-center space-y-2">
					<h3 className="text-lg font-semibold">Not Connected</h3>
					<p className="text-sm text-muted-foreground">
						Connect to your music service to start searching
					</p>
				</div>
				<Button
					onClick={() => {
						window.location.href = "/api/auth/login";
					}}
				>
					Connect Now
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Search Results for &ldquo;{decodedQuery}&rdquo;</CardTitle>
				</CardHeader>
				<CardContent>
					{/* Search Header */}
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h1 className="text-3xl font-bold">Search</h1>
							{selectedCategory && (
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setSelectedCategory(null)}
									className="text-muted-foreground hover:text-foreground"
								>
									<X className="w-4 h-4 mr-1" />
									Clear Filter
								</Button>
							)}
						</div>

						{/* Search Bar */}
						<div className="relative">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
								<Input
									ref={inputRef}
									placeholder="What do you want to listen to?"
									value={query}
									onChange={(e) => setQuery(e.target.value)}
									onFocus={() => setShowSuggestions(true)}
									className="pl-10 pr-10 h-12 text-base bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 focus:bg-background"
								/>
								{query && (
									<Button
										variant="ghost"
										size="sm"
										onClick={clearSearch}
										className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
									>
										<X className="w-4 h-4" />
									</Button>
								)}
							</div>

							{/* Search Suggestions Dropdown */}
							{showSuggestions && query.length === 0 && (
								<Card className="absolute top-full left-0 right-0 mt-2 z-10 shadow-lg border-border/50">
									<CardContent className="p-4 space-y-3">
										<div className="flex items-center justify-between">
											<h4 className="text-sm font-medium">Recent searches</h4>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => setShowSuggestions(false)}
												className="h-6 w-6 p-0"
											>
												<X className="w-3 h-3" />
											</Button>
										</div>{" "}
										<div className="space-y-1">
											{recentSearches.map((search) => (
												<Button
													key={search}
													variant="ghost"
													onClick={() => handleSearch(search)}
													className="flex items-center justify-start space-x-3 p-2 h-auto w-full hover:bg-muted rounded-md"
												>
													<Clock className="w-4 h-4 text-muted-foreground" />
													<span className="text-sm">{search}</span>
												</Button>
											))}
										</div>
									</CardContent>
								</Card>
							)}
						</div>
					</div>{" "}
					{/* Browse Categories */}
					{!query && !selectedCategory && (
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold">Browse all</h2>
								<Button
									variant="outline"
									size="sm"
									onClick={() => handlePlayDirect("trending popular music")}
									disabled={!connected || !userContext.userId}
									className="h-8"
								>
									<Play className="w-4 h-4 mr-1" />
									Play Popular
								</Button>
							</div>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
								{searchCategories.map((category) => (
									<Card
										key={category.id}
										className="relative overflow-hidden cursor-pointer group hover:scale-105 transition-all duration-200 border-0"
									>
										<div
											className={cn(
												"h-32 p-4 flex flex-col justify-between text-white relative",
												category.color,
											)}
										>
											<div className="space-y-1">
												<h3 className="font-bold text-lg">{category.name}</h3>
												<p className="text-sm text-white/80">
													{category.description}
												</p>
											</div>
											<div className="absolute bottom-4 right-4 opacity-60 group-hover:opacity-100 transition-opacity">
												{category.icon}
											</div>
											<div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />

											{/* Category Action Buttons */}
											<div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
												<div className="flex space-x-2">
													<Button
														size="sm"
														variant="secondary"
														onClick={(e) => {
															e.stopPropagation();
															handleCategoryClick(category.id);
														}}
														className="h-8 px-3 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border-white/30"
													>
														<Search className="w-3 h-3 mr-1" />
														Browse
													</Button>
													<Button
														size="sm"
														onClick={(e) => {
															e.stopPropagation();
															handlePlayDirect(
																category.searchQuery || category.name,
															);
														}}
														disabled={!connected || !userContext.userId}
														className="h-8 px-3 bg-primary/80 backdrop-blur-sm text-white hover:bg-primary border-primary/30"
													>
														<Play className="w-3 h-3 mr-1" />
														Play
													</Button>
												</div>
											</div>
										</div>
									</Card>
								))}
							</div>
						</div>
					)}
					{/* Search Results */}
					{(query || selectedCategory) && (
						<div className="space-y-4">
							{" "}
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold">
									{selectedCategory
										? `${searchCategories.find((c) => c.id === selectedCategory)?.name} Music`
										: `Results for "${query}"`}
								</h2>
								<div className="flex items-center space-x-2">
									{query && (
										<Button
											onClick={() => handlePlayDirect(query)}
											className="h-8 px-3"
											disabled={!connected || !userContext.userId}
										>
											<Play className="w-4 h-4 mr-1" />
											Play Now
										</Button>
									)}
									{results.length > 0 && (
										<Badge variant="secondary" className="text-xs">
											{results.length} result{results.length !== 1 ? "s" : ""}
										</Badge>
									)}
								</div>
							</div>
							{/* Loading State */}
							{isLoading && (
								<div className="space-y-3">
									{Array.from({ length: 3 }, (_, i) => (
										<div
											key={`skeleton-loading-${Date.now()}-${i}`}
											className="flex items-center space-x-3 p-3"
										>
											<Skeleton className="h-12 w-12 rounded-md" />
											<div className="flex-1 space-y-2">
												<Skeleton className="h-4 w-32" />
												<Skeleton className="h-3 w-24" />
											</div>
											<Skeleton className="h-8 w-16" />
										</div>
									))}
								</div>
							)}
							{/* Error State */}
							{error && !isLoading && (
								<div className="flex flex-col items-center justify-center h-32 space-y-4">
									<div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
										<X className="w-6 h-6 text-destructive" />
									</div>
									<div className="text-center space-y-2">
										<h3 className="text-sm font-semibold text-destructive">
											Search Error
										</h3>
										<p className="text-xs text-muted-foreground">{error}</p>
									</div>
								</div>
							)}
							{/* Results List */}
							{!isLoading && results.length > 0 && (
								<ScrollArea className="h-96">
									<div className="space-y-1">
										{results.map((result, index) => (
											<div
												key={result.id}
												className="group flex items-center space-x-3 p-3 hover:bg-muted/50 rounded-lg transition-colors"
											>
												{/* Track Number / Play Button */}
												<div className="w-6 flex-shrink-0 text-right">
													<span className="text-sm text-muted-foreground group-hover:hidden">
														{index + 1}
													</span>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handlePlay(result)}
														className="hidden group-hover:flex h-6 w-6 p-0 hover:bg-primary hover:text-primary-foreground"
													>
														<Play className="w-3 h-3" />
													</Button>
												</div>
												{/* Artwork */}
												<div className="relative flex-shrink-0">
													<Avatar className="h-12 w-12 rounded-md">
														<AvatarImage
															src={result.artwork}
															alt={result.title}
														/>
														<AvatarFallback className="rounded-md">
															<Music className="w-5 h-5" />
														</AvatarFallback>
													</Avatar>
													{result.type === "playlist" && (
														<div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1">
															<Music className="w-2 h-2" />
														</div>
													)}
												</div>
												{/* Track Info */}
												<div className="flex-1 min-w-0">
													<div className="flex items-center space-x-2 mb-1">
														<p className="font-medium text-foreground truncate">
															{result.title}
														</p>
														{result.isPlaying && (
															<div className="flex space-x-0.5">
																<div className="w-1 h-3 bg-primary rounded-full animate-pulse" />
																<div className="w-1 h-3 bg-primary rounded-full animate-pulse delay-100" />
																<div className="w-1 h-3 bg-primary rounded-full animate-pulse delay-200" />
															</div>
														)}
													</div>
													<div className="flex items-center space-x-1 text-sm text-muted-foreground">
														<span>{result.artist}</span>
														{result.album && (
															<>
																<span>•</span>
																<span>{result.album}</span>
															</>
														)}
													</div>
												</div>
												{/* Duration */}
												<div className="flex-shrink-0 text-sm text-muted-foreground">
													{result.duration}
												</div>{" "}
												{/* Actions */}
												<div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
													<Button
														variant={
															likedIds.has(result.id) ? "secondary" : "ghost"
														}
														size="sm"
														onClick={() => handleLike(result)}
														className="h-8 w-8 p-0 hover:bg-muted"
														disabled={likeLoading === result.id}
													>
														<Heart
															className={
																"w-4 h-4 transition-colors " +
																(likedIds.has(result.id)
																	? "text-primary fill-primary"
																	: "")
															}
														/>
													</Button>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleAddToPlaylist(result)}
														className="h-8 w-8 p-0 hover:bg-muted"
													>
														<Plus className="w-4 h-4" />
													</Button>
													{result.url && (
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleOpenInBrowser(result)}
															className="h-8 w-8 p-0 hover:bg-muted"
															title="Open in browser"
														>
															<ExternalLink className="w-4 h-4" />
														</Button>
													)}
													<Button
														variant="ghost"
														size="sm"
														className="h-8 w-8 p-0 hover:bg-muted"
													>
														<MoreHorizontal className="w-4 h-4" />
													</Button>
												</div>
											</div>
										))}
									</div>
								</ScrollArea>
							)}
							{/* No Results */}
							{!isLoading && results.length === 0 && query && (
								<div className="flex flex-col items-center justify-center h-64 space-y-4">
									<div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
										<Search className="w-8 h-8 text-muted-foreground" />
									</div>
									<div className="text-center space-y-2">
										<h3 className="text-lg font-semibold">No results found</h3>
										<p className="text-sm text-muted-foreground">
											Try searching for something else or check your spelling
										</p>
									</div>
								</div>
							)}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
