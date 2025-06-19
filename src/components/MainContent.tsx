"use client";

import { ConnectionPanel } from "./ConnectionPanel";
import { MusicControlsShadcn } from "./MusicControlsShadcn";
import { MusicArtworkShadcn } from "./MusicArtworkShadcn";
import { SearchPanel } from "./SearchPanel";
import { LogsPanel } from "./LogsPanel";
import { DebugPanel } from "./DebugPanel";
import { AutoUpdateControls } from "./AutoUpdateControls";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MainContentProps {
	activeTab: string;
}

export const MainContent: React.FC<MainContentProps> = ({ activeTab }) => {
	const renderContent = () => {
		switch (activeTab) {
			case "home":
				return (
					<div className="space-y-6">
						{/* Hero Section */}
						<div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
							<div className="flex items-center justify-between">
								<div>
									<h1 className="text-3xl font-bold mb-2">Good vibes only</h1>
									<p className="text-blue-100 mb-4">
										Control your Discord music with style
									</p>
									<div className="flex items-center space-x-4 text-sm">
										<span className="bg-white/20 px-3 py-1 rounded-full">
											Discord Bot
										</span>
										<span className="bg-white/20 px-3 py-1 rounded-full">
											WebSocket
										</span>
										<span className="bg-white/20 px-3 py-1 rounded-full">
											Real-time
										</span>
									</div>
								</div>
								<div className="text-6xl opacity-50">🎵</div>
							</div>
						</div>
						{/* Quick Controls */}{" "}
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
							<div className="lg:col-span-1">
								<MusicArtworkShadcn />
							</div>
							<div className="lg:col-span-2">
								<MusicControlsShadcn />
							</div>
						</div>
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
											<div className="text-4xl mb-2">❤️</div>
											<p className="text-muted-foreground">No favorites yet</p>
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

	return <div className="flex-1 p-6">{renderContent()}</div>;
};
