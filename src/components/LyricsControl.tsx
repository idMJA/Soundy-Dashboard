"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LyricsDialog } from "./LyricsDialog";

interface LyricsControlProps {
	disabled: boolean;
	mode?: "dialog" | "page"; // Default to "page"
}

const LyricsIcon = ({ className }: { className?: string }) => (
	<svg
		className={className || "w-5 h-5"}
		fill="currentColor"
		viewBox="0 0 24 24"
		aria-label="Lyrics"
	>
		<title>Lyrics</title>
		<path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5zm2 0v14h10V5H7zm2 4h6v2H9V9zm0 4h6v2H9v-2z" />
	</svg>
);

export function LyricsControl({ disabled, mode = "page" }: LyricsControlProps) {
	const router = useRouter();

	const handleClick = () => {
		if (mode === "page") {
			router.push("/lyrics");
		}
		// Dialog mode will be handled by LyricsDialog component itself
	};

	if (mode === "dialog") {
		return (
			<>
				<Button
					onClick={handleClick}
					disabled={disabled}
					variant="ghost"
					size="default"
					className="rounded-full w-10 h-10 p-0 hover:bg-primary/10 hover:text-primary transition-all hover:scale-110"
					title="Show lyrics"
				>
					<LyricsIcon className="w-5 h-5" />
				</Button>
				<LyricsDialog />
			</>
		);
	}

	return (
		<Button
			onClick={handleClick}
			disabled={disabled}
			variant="ghost"
			size="default"
			className="rounded-full w-10 h-10 p-0 hover:bg-primary/10 hover:text-primary transition-all hover:scale-110"
			title="Show lyrics page"
		>
			<LyricsIcon className="w-5 h-5" />
		</Button>
	);
}

// Keep the original LyricsButton for backward compatibility
export const LyricsButton = ({ disabled }: { disabled: boolean }) => (
	<LyricsControl disabled={disabled} mode="page" />
);
