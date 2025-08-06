"use client";

import { useState } from "react";
import { WebSocketProvider } from "@/components/WebSocketProvider";
import { Sidebar } from "@/components/Sidebar";
import { NowPlayingBar } from "@/components/NowPlayingBar";
import { MobileHeader } from "@/components/MobileHeader";
import { GlobalSearchBar } from "@/components/GlobalSearchBar";

interface AppLayoutProps {
	children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
	const [sidebarOpen, setSidebarOpen] = useState(false);

	const toggleSidebar = () => {
		setSidebarOpen(!sidebarOpen);
	};

	return (
		<WebSocketProvider>
			<div className="min-h-screen bg-background flex">
				{/* Mobile Header */}
				<MobileHeader onMenuToggle={toggleSidebar} />

				{/* Sidebar */}
				<Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

				{/* Overlay for mobile */}
				{sidebarOpen && (
					<button
						type="button"
						className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden cursor-default"
						onClick={toggleSidebar}
						onKeyDown={(e) => {
							if (e.key === "Escape") {
								toggleSidebar();
							}
						}}
						aria-label="Close sidebar"
					/>
				)}

				{/* Main Content */}
				<div className="flex-1 lg:ml-64 pt-16 lg:pt-0 pb-20">
					{/* Global Search Bar - Desktop Only */}
					<div className="sticky top-1 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50 p-4 hidden lg:block">
						<div className="max-w-4xl mx-auto flex justify-center">
							<GlobalSearchBar className="w-full max-w-lg" />
						</div>
					</div>

					<div className="flex-1 p-6 bg-background">{children}</div>
				</div>

				{/* Now Playing Bar */}
				<NowPlayingBar />
			</div>
		</WebSocketProvider>
	);
};
