"use client";

interface MobileHeaderProps {
	onMenuToggle: () => void;
}

const MenuIcon = ({ className }: { className?: string }) => (
	<svg className={className} fill="currentColor" viewBox="0 0 24 24">
		<title>Menu</title>
		<path
			d="M3 12h18M3 6h18M3 18h18"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

export const MobileHeader: React.FC<MobileHeaderProps> = ({ onMenuToggle }) => {
	return (
		<div className="lg:hidden glass border-b border-border/50 p-4 fixed top-0 left-0 right-0 z-50 backdrop-blur-xl shadow-modern animate-slide-up">
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-4">
					<button
						type="button"
						onClick={onMenuToggle}
						className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-all hover:scale-110"
					>
						<MenuIcon className="w-6 h-6" />
					</button>
					<div className="flex items-center space-x-3">
						<div>
							<h1 className="text-lg font-bold text-foreground">Soundy</h1>
						</div>
					</div>
				</div>
				<div className="flex items-center gap-3">
					<div className="flex items-center gap-2">
						<div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
						<span className="text-xs text-muted-foreground">Live</span>
					</div>
				</div>
			</div>
		</div>
	);
};
