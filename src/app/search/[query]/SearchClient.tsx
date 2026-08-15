"use client";

import {
	Brain,
	Clock,
	Coffee,
	ExternalLink,
	Heart,
	MoreHorizontal,
	Music,
	Play,
	Plus,
	Search,
	TrendingUp,
	X,
	Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useWebSocket } from "@/components/WebSocketProvider";
import { generateTrackId } from "@/lib/track-utils";
import { cn } from "@/lib/utils";

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

interface SearchClientProps {
	initialQuery: string;
}

export default function SearchClient({ initialQuery }: SearchClientProps) {
	const router = useRouter();
	const decodedQuery = decodeURIComponent(initialQuery);
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
	const searchContainerRef = useRef<HTMLDivElement>(null);

	// Focus input on mount
	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.focus();
		}
	}, []);

	// Click outside suggestions logic
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				searchContainerRef.current &&
				!searchContainerRef.current.contains(event.target as Node)
			) {
				setShowSuggestions(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const [prevDecodedQuery, setPrevDecodedQuery] = useState(decodedQuery);
	if (decodedQuery !== prevDecodedQuery) {
		setPrevDecodedQuery(decodedQuery);
		setQuery(decodedQuery);
	}

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
			const timer = setTimeout(() => {
				setResults((prev) => (prev.length > 0 ? [] : prev));
				setError((prev) => (prev !== null ? null : prev));
			}, 0);
			return () => clearTimeout(timer);
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

	const handleTrackClick = (result: SearchResult) => {
		const trackId = generateTrackId(result);
		router.push(`/view/${trackId}`);
	};

	if (!connected) {
		return (
			<div className="flex flex-col items-center justify-center bg-zinc-900 border border-zinc-800 rounded-lg p-10 max-w-md mx-auto space-y-6 my-12 animate-fade-in">
				<div className="w-16 h-16 bg-zinc-950 rounded-lg flex items-center justify-center border border-zinc-800">
					<Music className="w-8 h-8 text-primary" />
				</div>
				<div className="text-center space-y-2">
					<h3 className="text-lg font-bold text-foreground">Not Connected</h3>
					<p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
						Connect to your music service to start searching and playing tracks
						on your bot.
					</p>
				</div>
				<Button
					onClick={() => {
						router.push("/api/auth/login");
					}}
					className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg px-6 py-2"
				>
					Connect Now
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-6 animate-fade-in">
			<Card className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 shadow-none">
				<CardHeader className="border-b border-zinc-800 pb-4 mb-6">
					<CardTitle className="text-2xl font-black tracking-tight text-foreground">
						Search Results for &ldquo;{decodedQuery}&rdquo;
					</CardTitle>
				</CardHeader>
				<CardContent className="p-0">
					{/* Search Header */}
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h1 className="text-xl font-bold tracking-tight text-foreground">
								Search
							</h1>
							{selectedCategory && (
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setSelectedCategory(null)}
									className="text-muted-foreground hover:text-foreground h-8 hover:bg-zinc-900 rounded-lg px-3"
								>
									<X className="w-4 h-4 mr-1" />
									Clear Filter
								</Button>
							)}
						</div>

						{/* Search Bar */}
						<div ref={searchContainerRef} className="relative">
							<div className="relative">
								<Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4.5 h-4.5" />
								<Input
									ref={inputRef}
									autoFocus
									placeholder="What do you want to listen to?"
									value={query}
									onChange={(e) => setQuery(e.target.value)}
									onFocus={() => setShowSuggestions(true)}
									className="pl-11 pr-11 h-11 text-base bg-zinc-950 border border-zinc-800 focus:border-primary focus:ring-primary text-foreground rounded-lg"
								/>
								{query && (
									<Button
										variant="ghost"
										size="sm"
										onClick={clearSearch}
										className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-zinc-900 rounded-lg"
									>
										<X className="w-4 h-4" />
									</Button>
								)}
							</div>

							{/* Search Suggestions Dropdown */}
							{showSuggestions && query.length === 0 && (
								<Card className="absolute top-full left-0 right-0 mt-1 z-30 border border-zinc-800/50 bg-zinc-950 rounded-lg shadow-none">
									<CardContent className="p-4 space-y-3">
										<div className="flex items-center justify-between">
											<h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
												Recent searches
											</h4>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => setShowSuggestions(false)}
												className="h-6 w-6 p-0 hover:bg-zinc-900 rounded-lg"
											>
												<X className="w-3.5 h-3.5" />
											</Button>
										</div>{" "}
										<div className="space-y-1">
											{recentSearches.map((search) => (
												<Button
													key={search}
													variant="ghost"
													onClick={() => handleSearch(search)}
													className="flex items-center justify-start space-x-3 px-3 py-2 h-10 w-full hover:bg-zinc-900/40 hover:text-primary transition-all rounded-lg text-left"
												>
													<Clock className="w-4 h-4 text-muted-foreground" />
													<span className="text-sm font-medium">{search}</span>
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
						<div className="space-y-4 mt-8">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-bold tracking-tight text-foreground">
									Browse all
								</h2>
								<Button
									variant="outline"
									size="sm"
									onClick={() => handlePlayDirect("trending popular music")}
									disabled={!connected || !userContext.userId}
									className="h-9 border-zinc-800 text-foreground hover:bg-zinc-900 hover:text-primary px-4 font-bold rounded-lg"
								>
									<Play className="w-4 h-4 mr-1.5" fill="currentColor" />
									Play Popular
								</Button>
							</div>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
								{searchCategories.map((category) => (
									<Card
										key={category.id}
										className="relative overflow-hidden cursor-pointer group border border-zinc-800/50 rounded-lg bg-zinc-900/20"
									>
										<div
											className={cn(
												"h-32 p-4 flex flex-col justify-between text-white relative",
												category.color,
											)}
										>
											<div className="space-y-1">
												<h3 className="font-extrabold text-lg tracking-tight">
													{category.name}
												</h3>
												<p className="text-xs text-white/80 font-light">
													{category.description}
												</p>
											</div>
											<div className="absolute bottom-4 right-4 opacity-50 group-hover:opacity-90 transition-opacity">
												{category.icon}
											</div>
											<div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />

											{/* Category Action Buttons */}
											<div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/35">
												<div className="flex space-x-2">
													<Button
														size="sm"
														variant="secondary"
														onClick={(e) => {
															e.stopPropagation();
															handleCategoryClick(category.id);
														}}
														className="h-8 px-3 bg-white/20 text-white hover:bg-white/30 border-white/30 rounded-lg font-bold text-xs"
													>
														<Search className="w-3.5 h-3.5 mr-1" />
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
														className="h-8 px-3 bg-primary text-primary-foreground hover:bg-primary/95 rounded-lg font-bold text-xs"
													>
														<Play
															className="w-3.5 h-3.5 mr-1"
															fill="currentColor"
														/>
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
						<div className="space-y-4 mt-8">
							{" "}
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-bold tracking-tight text-foreground">
									{selectedCategory
										? `${searchCategories.find((c) => c.id === selectedCategory)?.name} Music`
										: `Results`}
								</h2>
								<div className="flex items-center space-x-3">
									{query && (
										<Button
											onClick={() => handlePlayDirect(query)}
											className="h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-4 rounded-lg transition-all"
											disabled={!connected || !userContext.userId}
										>
											<Play className="w-4 h-4 mr-1.5" fill="currentColor" />
											Play All
										</Button>
									)}
									{results.length > 0 && (
										<Badge
											variant="secondary"
											className="text-xs font-semibold bg-zinc-950 border border-zinc-800 text-foreground px-3 py-1 rounded-lg"
										>
											{results.length} result{results.length !== 1 ? "s" : ""}
										</Badge>
									)}
								</div>
							</div>
							{isLoading && (
								<div className="space-y-2">
									{[
										"search-skel-0",
										"search-skel-1",
										"search-skel-2",
										"search-skel-3",
									].map((id) => (
										<div
											key={id}
											className="flex items-center space-x-3 p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg animate-pulse"
										>
											<div className="h-10 w-10 bg-zinc-900 rounded-lg" />
											<div className="flex-1 space-y-2">
												<div className="h-4 bg-zinc-900 rounded w-1/4" />
												<div className="h-3 bg-zinc-900 rounded w-1/6" />
											</div>
											<div className="h-8 w-16 bg-zinc-900 rounded-lg" />
										</div>
									))}
								</div>
							)}
							{/* Error State */}
							{error && !isLoading && (
								<div className="flex flex-col items-center justify-center p-12 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg space-y-3">
									<div className="w-12 h-12 bg-rose-500/20 rounded-lg flex items-center justify-center border border-rose-500/30">
										<X className="w-6 h-6 text-rose-400" />
									</div>
									<div className="text-center space-y-1">
										<h3 className="font-bold">Search Error</h3>
										<p className="text-xs text-muted-foreground">{error}</p>
									</div>
								</div>
							)}
							{/* Results List */}
							{!isLoading && results.length > 0 && (
								<ScrollArea className="h-[480px]">
									<div className="space-y-2 pr-3">
										{results.map((result, index) => (
											<div
												key={result.id}
												className="group flex items-center space-x-4 p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg hover:bg-zinc-900 transition-all duration-150"
											>
												{/* Track Number / Play Button */}
												<div className="w-6 flex-shrink-0 text-center flex items-center justify-center">
													<span className="text-xs font-mono text-muted-foreground group-hover:hidden">
														{index + 1}
													</span>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handlePlay(result)}
														className="hidden group-hover:flex h-6 w-6 p-0 bg-primary text-zinc-950 hover:bg-primary/90 rounded-lg flex-shrink-0 justify-center items-center"
													>
														<Play
															className="w-3 h-3 ml-0.5"
															fill="currentColor"
														/>
													</Button>
												</div>
												{/* Artwork */}
												<div className="relative flex-shrink-0">
													<Avatar className="h-10 w-10 rounded-lg border border-zinc-800 overflow-hidden">
														<AvatarImage
															src={result.artwork}
															alt={result.title}
															className="object-cover"
														/>
														<AvatarFallback className="rounded-lg bg-zinc-900 flex items-center justify-center">
															<Music className="w-5 h-5 text-primary" />
														</AvatarFallback>
													</Avatar>
													{result.type === "playlist" && (
														<div className="absolute -bottom-1 -right-1 bg-primary text-zinc-950 rounded-lg p-1 border border-zinc-900">
															<Music className="w-2 h-2" />
														</div>
													)}
												</div>
												{/* Track Info */}
												<button
													type="button"
													className="flex-1 min-w-0 cursor-pointer text-left focus:outline-none"
													onClick={() => handleTrackClick(result)}
													aria-label={`View details for ${result.title} by ${result.artist}`}
												>
													<div className="flex items-center space-x-2 mb-0.5">
														<p className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
															{result.title}
														</p>
														{result.isPlaying && (
															<div className="flex space-x-0.5 items-end h-3">
																<div className="w-0.5 h-2 bg-primary rounded-full animate-pulse" />
																<div className="w-0.5 h-3 bg-primary rounded-full animate-pulse delay-100" />
																<div className="w-0.5 h-1 bg-primary rounded-full animate-pulse delay-200" />
															</div>
														)}
													</div>
													<div className="flex items-center space-x-1 text-xs text-muted-foreground font-light">
														<span>{result.artist}</span>
														{result.album && (
															<>
																<span>•</span>
																<span>{result.album}</span>
															</>
														)}
													</div>
												</button>
												{/* Duration */}
												<div className="flex-shrink-0 text-xs font-mono text-muted-foreground">
													{result.duration}
												</div>{" "}
												{/* Actions */}
												<div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleLike(result)}
														className="h-8 w-8 p-0 rounded-lg hover:bg-zinc-900 text-muted-foreground hover:text-foreground"
														disabled={likeLoading === result.id}
													>
														<Heart
															className={cn(
																"w-4 h-4 transition-colors",
																likedIds.has(result.id)
																	? "text-rose-500 fill-rose-500"
																	: "text-muted-foreground hover:text-foreground",
															)}
														/>
													</Button>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleAddToPlaylist(result)}
														className="h-8 w-8 p-0 rounded-lg hover:bg-zinc-900 text-muted-foreground hover:text-foreground"
													>
														<Plus className="w-4 h-4" />
													</Button>
													{result.url && (
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleOpenInBrowser(result)}
															className="h-8 w-8 p-0 rounded-lg hover:bg-zinc-900 text-muted-foreground hover:text-foreground"
															title="Open in browser"
														>
															<ExternalLink className="w-4 h-4" />
														</Button>
													)}
													<Button
														variant="ghost"
														size="sm"
														className="h-8 w-8 p-0 rounded-lg hover:bg-zinc-900 text-muted-foreground hover:text-foreground"
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
								<div className="flex flex-col items-center justify-center p-12 bg-zinc-950 border border-zinc-800 text-muted-foreground rounded-lg space-y-4">
									<div className="w-16 h-16 bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-800">
										<Search className="w-8 h-8 text-muted-foreground/60" />
									</div>
									<div className="text-center space-y-1">
										<h3 className="text-base font-bold text-foreground">
											No results found
										</h3>
										<p className="text-xs text-muted-foreground">
											Try searching for something else or check your spelling.
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
