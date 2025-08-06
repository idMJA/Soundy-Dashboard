"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Clock, TrendingUp, Music, Command } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useWebSocket } from "@/components/WebSocketProvider";

interface GlobalSearchBarProps {
	className?: string;
	variant?: "default" | "compact";
}

const recentSearches = [
	"Lo-fi Hip Hop",
	"Synthwave",
	"Indie Rock",
	"Jazz Fusion",
	"Electronic Chill",
];

const quickCommands = [
	{ icon: TrendingUp, label: "Trending", query: "trending music 2024" },
	{ icon: Music, label: "Popular", query: "popular songs" },
	{ icon: Clock, label: "Recent", path: "/recent" },
];

export const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({
	className,
	variant = "default",
}) => {
	const router = useRouter();
	const { connected } = useWebSocket();
	const [query, setQuery] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	// Global keyboard shortcut (Cmd/Ctrl + K)
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault();
				setIsOpen(true);
				setTimeout(() => inputRef.current?.focus(), 100);
			}
			if (e.key === "Escape") {
				setIsOpen(false);
				setShowSuggestions(false);
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, []);

	const handleSearch = (searchQuery: string) => {
		if (!searchQuery.trim()) return;

		setQuery("");
		setIsOpen(false);
		setShowSuggestions(false);
		router.push(`/search/${encodeURIComponent(searchQuery)}`);
	};

	const handleQuickCommand = (item: (typeof quickCommands)[0]) => {
		if (item.path) {
			router.push(item.path);
		} else if (item.query) {
			handleSearch(item.query);
		}
		setIsOpen(false);
	};

	const clearSearch = () => {
		setQuery("");
		inputRef.current?.focus();
	};

	if (variant === "compact") {
		return (
			<Button
				variant="ghost"
				size="sm"
				onClick={() => setIsOpen(true)}
				className={cn(
					"w-full justify-start gap-2 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-full transition-all",
					className,
				)}
			>
				<Search className="w-4 h-4" />
				<span className="hidden md:inline">Search music...</span>
				<div className="hidden md:flex ml-auto">
					<kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
						<span className="text-xs">⌘</span>K
					</kbd>
				</div>
			</Button>
		);
	}

	return (
		<>
			{/* Search Trigger Button */}
			<Button
				variant="ghost"
				onClick={() => setIsOpen(true)}
				className={cn(
					"relative w-full max-w-sm justify-start gap-2 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-full border border-border/50",
					className,
				)}
			>
				<Search className="w-4 h-4" />
				<span>Search music...</span>
				<div className="ml-auto flex items-center gap-1">
					<kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
						<span className="text-xs">⌘</span>K
					</kbd>
				</div>
			</Button>

			{/* Search Modal */}
			{isOpen && (
				<button
					type="button"
					className="fixed inset-0 z-[45] bg-black/20 backdrop-blur-sm cursor-default"
					onClick={() => setIsOpen(false)}
					onKeyDown={(e) => {
						if (e.key === "Escape") {
							setIsOpen(false);
						}
					}}
					aria-label="Close search modal"
				>
					<div
						className="fixed left-[50%] top-[380%] z-[46] w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] p-4 cursor-default"
						onClick={(e) => e.stopPropagation()}
						onKeyDown={(e) => e.stopPropagation()}
						role="dialog"
						aria-modal="true"
					>
						<Card className="w-full border-border/50 shadow-modern-xl">
							<CardContent className="p-0">
								{/* Search Input */}
								<div className="relative border-b border-border/50">
									<Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
									<Input
										ref={inputRef}
										placeholder="Search for songs, artists, albums..."
										value={query}
										onChange={(e) => {
											setQuery(e.target.value);
											setShowSuggestions(e.target.value.length === 0);
										}}
										onKeyDown={(e) => {
											if (e.key === "Enter" && query.trim()) {
												handleSearch(query);
											}
										}}
										className="h-16 pl-12 pr-12 text-lg border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
										autoFocus
									/>
									{query && (
										<Button
											variant="ghost"
											size="sm"
											onClick={clearSearch}
											className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
										>
											<X className="w-4 h-4" />
										</Button>
									)}
									<Button
										variant="ghost"
										size="sm"
										onClick={() => setIsOpen(false)}
										className="absolute right-12 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
									>
										<kbd className="text-xs">ESC</kbd>
									</Button>
								</div>

								{/* Search Suggestions */}
								{(showSuggestions || query.length === 0) && (
									<div className="p-4 space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
										{/* Quick Commands */}
										<div className="space-y-2">
											<h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
												<Command className="w-4 h-4" />
												Quick Actions
											</h4>
											<div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
												{quickCommands.map((item) => (
													<Button
														key={item.label}
														variant="ghost"
														onClick={() => handleQuickCommand(item)}
														className="h-auto p-3 justify-start gap-3 hover:bg-accent/50 rounded-lg transition-all"
														disabled={!connected && !!item.query}
													>
														<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
															<item.icon className="w-4 h-4 text-primary" />
														</div>
														<span className="font-medium">{item.label}</span>
													</Button>
												))}
											</div>
										</div>

										{/* Recent Searches */}
										<div className="space-y-2">
											<h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
												<Clock className="w-4 h-4" />
												Recent Searches
											</h4>
											<div className="space-y-1">
												{recentSearches.map((search) => (
													<Button
														key={search}
														variant="ghost"
														onClick={() => handleSearch(search)}
														className="w-full justify-start gap-3 h-auto p-3 hover:bg-accent/50 rounded-lg transition-all"
													>
														<Search className="w-4 h-4 text-muted-foreground" />
														<span>{search}</span>
													</Button>
												))}
											</div>
										</div>
									</div>
								)}

								{/* Search Results Preview */}
								{query.length > 0 && !showSuggestions && (
									<div className="p-4">
										<div className="text-center py-8">
											<Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
											<p className="text-muted-foreground mb-4">
												Press Enter to search for &quot;{query}&quot;
											</p>
											<Button
												onClick={() => handleSearch(query)}
												disabled={!connected}
											>
												Search Now
											</Button>
										</div>
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</button>
			)}
		</>
	);
};
