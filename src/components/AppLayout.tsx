"use client";

import { useState } from "react";
import { WebSocketProvider } from "@/components/WebSocketProvider";
import { Sidebar } from "@/components/Sidebar";
import { NowPlayingBar } from "@/components/NowPlayingBar";
import { MobileHeader } from "@/components/MobileHeader";
import { RightSidebar } from "@/components/RightSidebar";

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

				{/* Main Content & Right Sidebar */}
				<div
					className="flex-1 lg:ml-64 pt-16 lg:pt-0 flex flex-row"
					style={{ paddingBottom: `150px` }}
				>
					<div className="flex-1 min-w-0">
						<div className="flex-1 p-6 bg-background">{children}</div>
					</div>
					{/* Right Sidebar - Now Playing & Queue (sticky on desktop) */}
					<div className="hidden lg:block w-80 flex-shrink-0">
						<div className="sticky top-24">
							<RightSidebar />
						</div>
					</div>
				</div>

				{/* Now Playing Bar */}
				<NowPlayingBar />
			</div>
		</WebSocketProvider>
	);
};
