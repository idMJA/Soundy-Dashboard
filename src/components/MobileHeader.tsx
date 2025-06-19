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
		<div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 fixed top-0 left-0 right-0 z-50">
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-3">
					<button
						type="button"
						onClick={onMenuToggle}
						className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
					>
						<MenuIcon className="w-6 h-6" />
					</button>
					<div className="flex items-center space-x-2">
						<div className="text-xl">🎵</div>
						<span className="text-lg font-bold text-gray-900 dark:text-white">
							Soundy
						</span>
					</div>
				</div>
			</div>
		</div>
	);
};
