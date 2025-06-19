"use client";

import { useState } from "react";
import { useWebSocket } from "./WebSocketProvider";

const HomeIcon = ({ className }: { className?: string }) => (
	<svg className={className} fill="currentColor" viewBox="0 0 24 24">
		<title>Home</title>
		<path d="M12.8 1.613a1 1 0 0 0-1.6 0L2 11v8a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2v-6h6v6a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2v-8l-9.2-9.387Z" />
	</svg>
);

const SearchIcon = ({ className }: { className?: string }) => (
	<svg className={className} fill="currentColor" viewBox="0 0 24 24">
		<title>Search</title>
		<path d="M10.533 1.279c-5.18 0-9.407 4.14-9.407 9.279s4.226 9.279 9.407 9.279c2.234 0 4.29-.77 5.907-2.058l4.353 4.353a1 1 0 1 0 1.414-1.414l-4.344-4.344a9.157 9.157 0 0 0 2.077-5.816c0-5.14-4.226-9.28-9.407-9.28zm-7.407 9.279c0-4.006 3.302-7.28 7.407-7.28s7.407 3.274 7.407 7.28-3.302 7.279-7.407 7.279-7.407-3.273-7.407-7.28z" />
	</svg>
);

const LibraryIcon = ({ className }: { className?: string }) => (
	<svg className={className} fill="currentColor" viewBox="0 0 24 24">
		<title>Library</title>
		<path d="M3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1zM15.5 2.134A1 1 0 0 0 14 3v18a1 1 0 0 0 1.5.866l6-3a1 1 0 0 0 0-1.732l-6-3a1 1 0 0 0-1.5.866zM16 5.041L19.197 6.5 16 7.959V5.041zM6 2a1 1 0 0 0-1 1v18a1 1 0 0 0 2 0V3a1 1 0 0 0-1-1z" />
	</svg>
);

const SettingsIcon = ({ className }: { className?: string }) => (
	<svg className={className} fill="currentColor" viewBox="0 0 24 24">
		<title>Settings</title>
		<path d="M12 2.25c.41 0 .75.34.75.75v1.54a6.25 6.25 0 0 1 5.46 5.46h1.54c.41 0 .75.34.75.75s-.34.75-.75.75h-1.54a6.25 6.25 0 0 1-5.46 5.46v1.54c0 .41-.34.75-.75.75s-.75-.34-.75-.75v-1.54a6.25 6.25 0 0 1-5.46-5.46H3.75c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h1.54a6.25 6.25 0 0 1 5.46-5.46V3c0-.41.34-.75.75-.75zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" />
	</svg>
);

const LogsIcon = ({ className }: { className?: string }) => (
	<svg className={className} fill="currentColor" viewBox="0 0 24 24">
		<title>Logs</title>
		<path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" />
	</svg>
);

interface SidebarProps {
	activeTab: string;
	onTabChange: (tab: string) => void;
	isOpen?: boolean;
	onToggle?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
	activeTab,
	onTabChange,
	isOpen = true,
	onToggle,
}) => {
	const { connected, playerState } = useWebSocket();

	const menuItems = [
		{ id: "home", label: "Home", icon: HomeIcon },
		{ id: "search", label: "Search", icon: SearchIcon },
		{ id: "library", label: "Your Library", icon: LibraryIcon },
		{ id: "settings", label: "Settings", icon: SettingsIcon },
		{ id: "logs", label: "Logs", icon: LogsIcon },
	];
	return (
		<div
			className={`w-64 bg-black text-white h-screen flex flex-col fixed left-0 top-0 z-40 transition-transform duration-300 ${
				isOpen ? "translate-x-0" : "-translate-x-full"
			} lg:translate-x-0`}
		>
			{/* Logo */}
			<div className="p-6">
				<div className="flex items-center space-x-2">
					<div className="text-2xl">🎵</div>
					<span className="text-xl font-bold">Soundy</span>
				</div>
			</div>

			{/* Navigation */}
			<nav className="flex-1 px-2">
				<ul className="space-y-1">
					{menuItems.map((item) => (
						<li key={item.id}>
							{" "}
							<button
								type="button"
								onClick={() => onTabChange(item.id)}
								className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
									activeTab === item.id
										? "bg-gray-800 text-white"
										: "text-gray-300 hover:text-white hover:bg-gray-800/50"
								}`}
							>
								<item.icon className="w-6 h-6" />
								<span className="font-medium">{item.label}</span>
							</button>
						</li>
					))}
				</ul>
			</nav>

			{/* Connection Status */}
			<div className="p-4 border-t border-gray-800">
				<div className="flex items-center space-x-2 mb-2">
					<div
						className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`}
					/>
					<span className="text-sm text-gray-300">
						{connected ? "Connected" : "Disconnected"}
					</span>
				</div>

				{/* Now Playing Mini Card */}
				{playerState.track && (
					<div className="bg-gray-900 rounded-lg p-3 mt-2">
						<div className="flex items-center space-x-2">
							<div
								className={`w-2 h-2 rounded-full ${playerState.playing ? "bg-green-500 animate-pulse" : "bg-gray-500"}`}
							/>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium text-white truncate">
									{playerState.track.title}
								</p>
								<p className="text-xs text-gray-400 truncate">
									{playerState.track.author}
								</p>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
