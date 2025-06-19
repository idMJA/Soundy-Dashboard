"use client";

import { useState } from "react";
import { WebSocketProvider } from "@/components/WebSocketProvider";
import { Sidebar } from "@/components/Sidebar";
import { MainContent } from "@/components/MainContent";
import { NowPlayingBarShadcn } from "@/components/NowPlayingBarShadcn";
import { MobileHeader } from "@/components/MobileHeader";

export default function Home() {
	const [activeTab, setActiveTab] = useState("home");
	const [sidebarOpen, setSidebarOpen] = useState(false);

	const toggleSidebar = () => {
		setSidebarOpen(!sidebarOpen);
	};

	return (
		<WebSocketProvider>
			<div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
				{/* Mobile Header */}
				<MobileHeader onMenuToggle={toggleSidebar} />

				{/* Sidebar */}
				<Sidebar
					activeTab={activeTab}
					onTabChange={setActiveTab}
					isOpen={sidebarOpen}
					onToggle={toggleSidebar}
				/>

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
					<MainContent activeTab={activeTab} />
				</div>

				{/* Now Playing Bar */}
				<NowPlayingBarShadcn />
			</div>
		</WebSocketProvider>
	);
}
