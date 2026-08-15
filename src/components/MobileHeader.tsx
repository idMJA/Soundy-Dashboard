"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useWebSocket } from "./WebSocketProvider";

interface MobileHeaderProps {
	onMenuToggle: () => void;
}

const MenuIcon = ({ className }: { className?: string }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24">
		<title>Menu</title>
		<path
			d="M4 8h16M4 16h16"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
		/>
	</svg>
);

export const MobileHeader: React.FC<MobileHeaderProps> = ({ onMenuToggle }) => {
	const { connected, userContext } = useWebSocket();

	return (
		<div className="lg:hidden fixed top-0 left-0 right-0 z-50 floating-bar">
			<div className="flex items-center justify-between px-4 py-3">
				<button
					type="button"
					onClick={onMenuToggle}
					className="p-2 -ml-2 text-muted-foreground hover:text-foreground rounded-xl transition-colors"
				>
					<MenuIcon className="w-5 h-5" />
				</button>

				<div className="flex items-center gap-2">
					<div
						className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-primary animate-pulse" : "bg-destructive"}`}
					/>
					<span className="text-base font-bold text-foreground tracking-tight">
						Soundy
					</span>
				</div>

				{userContext?.userId ? (
					<Avatar className="h-7 w-7 border border-border/55">
						<AvatarImage
							src={
								userContext.avatar
									? `https://cdn.discordapp.com/avatars/${userContext.userId}/${userContext.avatar}.webp`
									: ""
							}
							alt="User"
						/>
						<AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
							{userContext.userId.slice(0, 2).toUpperCase()}
						</AvatarFallback>
					</Avatar>
				) : (
					<div className="w-7" />
				)}
			</div>
		</div>
	);
};
