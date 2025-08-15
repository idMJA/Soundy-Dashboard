"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface LyricsButtonProps {
	disabled: boolean;
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

export function LyricsButton({ disabled }: LyricsButtonProps) {
	const router = useRouter();

	return (
		<Button
			onClick={() => router.push("/lyrics")}
			disabled={disabled}
			variant="ghost"
			size="default"
			className="rounded-full w-10 h-10 p-0 hover:bg-primary/10 hover:text-primary transition-all hover:scale-110"
			title="Show lyrics"
		>
			<LyricsIcon className="w-5 h-5" />
		</Button>
	);
}
