"use client";

import { useState } from "react";
import { MobileHeader } from "@/components/MobileHeader";
import { NowPlayingBar } from "@/components/NowPlayingBar";
import { RightSidebar } from "@/components/RightSidebar";
import { Sidebar } from "@/components/Sidebar";
import { WebSocketProvider } from "@/components/WebSocketProvider";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
	children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

	const toggleSidebar = () => {
		setSidebarOpen(!sidebarOpen);
	};

	return (
		<WebSocketProvider>
			<div className="min-h-screen bg-background text-foreground flex relative overflow-hidden noise-bg">
				{/* Mobile Header */}
				<MobileHeader onMenuToggle={toggleSidebar} />

				{/* Sidebar */}
				<Sidebar
					isOpen={sidebarOpen}
					onToggle={toggleSidebar}
					isCollapsed={sidebarCollapsed}
					onCollapseToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
				/>

				{/* Overlay for mobile */}
				{sidebarOpen && (
					<button
						type="button"
						className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden cursor-default"
						onClick={toggleSidebar}
						onKeyDown={(e) => {
							if (e.key === "Escape") {
								toggleSidebar();
							}
						}}
						aria-label="Close sidebar"
					/>
				)}

				{/* Main Content & Right Sidebar Container */}
				<div
					className={cn(
						"flex-1 pt-16 lg:pt-0 flex flex-row relative z-10 transition-all duration-300 ease-in-out pb-28 lg:pb-32",
						sidebarCollapsed ? "lg:ml-20" : "lg:ml-64",
					)}
				>
					{/* Scrollable Center View */}
					<div className="flex-1 min-w-0 flex flex-col h-full overflow-y-auto thin-scrollbar">
						<div className="flex-1 p-4 md:p-6 bg-transparent">{children}</div>
					</div>

					{/* Right Sidebar - Sticky on XL+ screens */}
					<div className="hidden xl:block w-80 flex-shrink-0 p-4 md:p-6 pl-0">
						<div className="sticky top-6">
							<RightSidebar />
						</div>
					</div>
				</div>

				{/* Floating Now Playing Bar */}
				<NowPlayingBar sidebarCollapsed={sidebarCollapsed} />
			</div>
		</WebSocketProvider>
	);
};
