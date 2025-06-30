"use client";

import { ConnectionPanel } from "./ConnectionPanel";
import { SearchPanel } from "./SearchPanel";
import { LogsPanel } from "./LogsPanel";
import { DebugPanel } from "./DebugPanel";
import { AutoUpdateControls } from "./AutoUpdateControls";
import { PlaylistDetail } from "./PlaylistDetail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlaylistList } from "./PlaylistList";
import { RightSidebar } from "./RightSidebar";

interface MainContentProps {
	activeTab: string;
}

export const MainContent: React.FC<MainContentProps> = ({ activeTab }) => {
	const renderContent = () => {
		// Check if it's a playlist view
		if (activeTab.startsWith("playlist-")) {
			const playlistId = activeTab.replace("playlist-", "");
			return (
				<div className="space-y-6">
					<PlaylistDetail playlistId={playlistId} />
				</div>
			);
		}

		switch (activeTab) {
			case "home":
				return (
					<div className="flex h-full gap-6">
						{/* Center Content - Main Area */}
						<div className="flex-1 space-y-6">
							{/* Hero Section with gradient background */}
							<div className="bg-gradient-to-br from-primary/30 via-primary/20 to-background rounded-xl p-8 min-h-[300px] flex items-center">
								<div className="flex items-center justify-between w-full">
									<div className="space-y-4">
										<div className="space-y-2">
											<p className="text-sm text-muted-foreground">
												Welcome back
											</p>
											<h1 className="text-5xl font-bold text-foreground">
												Good morning
											</h1>
											<p className="text-lg text-muted-foreground max-w-md">
												Let&apos;s start your music journey with personalized
												recommendations
											</p>
										</div>
										<div className="flex items-center space-x-3">
											<div className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium">
												Discord Music Bot
											</div>
											<div className="bg-muted text-muted-foreground px-4 py-2 rounded-full text-sm">
												Real-time Control
											</div>
										</div>
									</div>
									<div className="w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center ml-8">
										<div className="text-5xl">🎵</div>
									</div>
								</div>
							</div>

							{/* Jump back in Section */}
							<div className="space-y-4">
								<h2 className="text-2xl font-semibold">Jump back in</h2>
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
									{[
										{
											name: "Daily Mix 1",
											description: "Kagura-sama, YOASOBI and more",
											image: "🎧",
										},
										{
											name: "Chill Vibes",
											description: "Lo-fi hip hop beats",
											image: "☁️",
										},
										{
											name: "Anime OST",
											description: "Your favorite anime soundtracks",
											image: "🌸",
										},
									].map((item, jumpIndex) => (
										<div
											key={`jump-${item.name}-${jumpIndex}`}
											className="group bg-card hover:bg-accent transition-colors rounded-lg p-4 cursor-pointer"
										>
											<div className="flex items-center space-x-3">
												<div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center group-hover:bg-background transition-colors">
													<div className="text-2xl">{item.image}</div>
												</div>
												<div className="flex-1 min-w-0">
													<h3 className="font-medium truncate group-hover:text-primary">
														{item.name}
													</h3>
													<p className="text-sm text-muted-foreground truncate">
														{item.description}
													</p>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>

							{/* Recently Played Section */}
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<h2 className="text-2xl font-semibold">Recently played</h2>
									<Button
										variant="ghost"
										size="sm"
										className="text-muted-foreground hover:text-foreground"
									>
										Show all
									</Button>
								</div>
								<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
									{[
										{
											name: "Daily Mix 2",
											artist: "Various Artists",
											image: "🎧",
										},
										{
											name: "Aoi Teshima",
											artist: "Studio Ghibli",
											image: "🌸",
										},
										{ name: "YOASOBI", artist: "J-Pop", image: "🌟" },
										{ name: "Daily Mix 1", artist: "Anime Mix", image: "🎵" },
										{ name: "ɐuıɯıɥsǝ┴ ᴉo∀", artist: "Reversed", image: "🔄" },
										{ name: "Witch Watch", artist: "Soundtrack", image: "🧙‍♀️" },
										{ name: "Focus Mix", artist: "Instrumental", image: "🧠" },
										{ name: "Party Hits", artist: "Electronic", image: "🎉" },
									].map((item, recentIndex) => (
										<div
											key={`recent-${item.name}-${recentIndex}`}
											className="group cursor-pointer"
										>
											<div className="bg-muted rounded-lg aspect-square flex items-center justify-center mb-3 group-hover:bg-accent transition-colors shadow-sm">
												<div className="text-3xl">{item.image}</div>
											</div>
											<h3 className="font-medium text-sm truncate group-hover:text-primary">
												{item.name}
											</h3>
											<p className="text-xs text-muted-foreground truncate">
												{item.artist}
											</p>
										</div>
									))}
								</div>
							</div>

							{/* Quick Access Cards */}
							<div className="space-y-3">
								<h2 className="text-lg font-semibold px-2">Quick Access</h2>
								<div className="space-y-2">
									{[
										{
											name: "Liked Songs",
											color: "bg-gradient-to-br from-purple-500 to-pink-500",
											icon: "❤️",
										},
										{
											name: "Recently Played",
											color: "bg-gradient-to-br from-green-500 to-teal-500",
											icon: "🕒",
										},
										{
											name: "Your Playlists",
											color: "bg-gradient-to-br from-blue-500 to-indigo-500",
											icon: "📋",
										},
										{
											name: "Discover",
											color: "bg-gradient-to-br from-orange-500 to-red-500",
											icon: "🔍",
										},
									].map((item, itemIndex) => (
										<div
											key={`quick-access-${item.name}-${itemIndex}`}
											className="group bg-card hover:bg-accent transition-colors duration-200 rounded-lg p-3 cursor-pointer flex items-center space-x-3"
										>
											<div
												className={`w-12 h-12 rounded ${item.color} flex items-center justify-center flex-shrink-0`}
											>
												<div className="text-white text-lg">{item.icon}</div>
											</div>
											<div className="min-w-0 flex-1">
												<p className="font-medium text-card-foreground group-hover:text-accent-foreground truncate">
													{item.name}
												</p>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>

						{/* Right Sidebar - Now Playing & Queue */}
						<RightSidebar />
					</div>
				);
			case "search":
				return (
					<div className="space-y-6">
						<SearchPanel />
					</div>
				);
			case "library":
				return (
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Your Library</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<Card>
									<CardHeader>
										<CardTitle className="text-lg">Recently Played</CardTitle>
									</CardHeader>
									<CardContent>
										<p className="text-muted-foreground text-sm mb-4">
											Your music history will appear here
										</p>
										<div className="text-center py-8">
											<div className="text-4xl mb-2">📚</div>
											<p className="text-muted-foreground">No recent tracks</p>
										</div>
									</CardContent>
								</Card>

								<Card>
									<CardHeader>
										<CardTitle className="text-lg">Favorites</CardTitle>
									</CardHeader>
									<CardContent>
										<p className="text-muted-foreground text-sm mb-4">
											Save your favorite songs
										</p>
										<div className="text-center py-8">
											<PlaylistList />
										</div>
									</CardContent>
								</Card>
							</CardContent>
						</Card>
					</div>
				);
			case "settings":
				return (
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Settings</CardTitle>
							</CardHeader>
							<CardContent className="space-y-8">
								{/* Connection Settings */}
								<div>
									<h3 className="text-lg font-semibold mb-4">Connection</h3>
									<ConnectionPanel />
								</div>

								{/* Auto Update Settings */}
								<div>
									<h3 className="text-lg font-semibold mb-4">Auto Update</h3>
									<AutoUpdateControls />
								</div>

								{/* Debug Panel */}
								<div>
									<h3 className="text-lg font-semibold mb-4">Debug Info</h3>
									<DebugPanel />
								</div>
							</CardContent>
						</Card>
					</div>
				);
			case "logs":
				return (
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>WebSocket Logs</CardTitle>
							</CardHeader>
							<CardContent>
								<LogsPanel />
							</CardContent>
						</Card>
					</div>
				);
			default:
				return (
					<Card>
						<CardHeader>
							<CardTitle>Page Not Found</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground">
								The requested page could not be found.
							</p>
						</CardContent>
					</Card>
				);
		}
	};

	return <div className="flex-1 p-6 bg-background">{renderContent()}</div>;
};
