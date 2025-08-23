"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConnectionPanel } from "@/components/ConnectionPanel";
import { AutoUpdateControls } from "@/components/AutoUpdateControls";
import { DebugPanel } from "@/components/DebugPanel";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
	return (
		<div className="space-y-8 animate-fade-in custom-scrollbar">
			{/* Header */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
							Settings
						</h1>
						<p className="text-muted-foreground mt-2">
							Manage your music dashboard preferences and connections
						</p>
					</div>
					<Badge variant="secondary" className="px-4 py-2">
						⚙️ Configuration
					</Badge>
				</div>
			</div>

			{/* Settings Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Connection Settings */}
				<Card
					className="hover-lift animate-slide-up"
					style={{ animationDelay: "0.1s" }}
				>
					<CardHeader className="space-y-3">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
								<div className="text-white text-lg">🔗</div>
							</div>
							<div>
								<CardTitle className="text-xl">Connection</CardTitle>
								<p className="text-sm text-muted-foreground">
									Manage your Discord bot connection
								</p>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<ConnectionPanel />
					</CardContent>
				</Card>

				{/* Auto Update Settings */}
				<Card
					className="hover-lift animate-slide-up"
					style={{ animationDelay: "0.2s" }}
				>
					<CardHeader className="space-y-3">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
								<div className="text-white text-lg">🔄</div>
							</div>
							<div>
								<CardTitle className="text-xl">Auto Update</CardTitle>
								<p className="text-sm text-muted-foreground">
									Control automatic refresh settings
								</p>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<AutoUpdateControls />
					</CardContent>
				</Card>

				{/* Debug Panel */}
				<Card
					className="lg:col-span-2 hover-lift animate-slide-up"
					style={{ animationDelay: "0.3s" }}
				>
					<CardHeader className="space-y-3">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
								<div className="text-white text-lg">🐛</div>
							</div>
							<div>
								<CardTitle className="text-xl">Debug Information</CardTitle>
								<p className="text-sm text-muted-foreground">
									System status and debugging information
								</p>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<DebugPanel />
					</CardContent>
				</Card>
			</div>

			{/* Quick Actions */}
			{/* <Card
				className="hover-lift animate-slide-up"
				style={{ animationDelay: "0.4s" }}
			>
				<CardHeader>
					<CardTitle className="flex items-center gap-3">
						<div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
							<div className="text-white text-sm">⚡</div>
						</div>
						Quick Actions
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<button
							type="button"
							className="music-card p-4 hover-lift text-left"
						>
							<div className="flex items-center gap-3">
								<div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
									<div className="text-primary text-sm">🔄</div>
								</div>
								<div>
									<h4 className="font-medium">Reset Settings</h4>
									<p className="text-xs text-muted-foreground">
										Restore defaults
									</p>
								</div>
							</div>
						</button>
						<button
							type="button"
							className="music-card p-4 hover-lift text-left"
						>
							<div className="flex items-center gap-3">
								<div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
									<div className="text-blue-500 text-sm">📥</div>
								</div>
								<div>
									<h4 className="font-medium">Export Config</h4>
									<p className="text-xs text-muted-foreground">
										Download settings
									</p>
								</div>
							</div>
						</button>
						<button
							type="button"
							className="music-card p-4 hover-lift text-left"
						>
							<div className="flex items-center gap-3">
								<div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
									<div className="text-purple-500 text-sm">💾</div>
								</div>
								<div>
									<h4 className="font-medium">Save Backup</h4>
									<p className="text-xs text-muted-foreground">Create backup</p>
								</div>
							</div>
						</button>
					</div>
				</CardContent>
			</Card> */}
		</div>
	);
}
