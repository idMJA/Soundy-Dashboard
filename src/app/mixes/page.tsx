"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MixesPage() {
	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle>Daily Mixes</CardTitle>
						<Button variant="ghost" size="sm">
							Refresh
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{[
							{
								name: "Daily Mix 1",
								description: "Kagura-sama, YOASOBI and more",
								image: "🎧",
								tracks: 50,
							},
							{
								name: "Daily Mix 2",
								description: "Studio Ghibli, Anime OST",
								image: "🌸",
								tracks: 45,
							},
							{
								name: "Daily Mix 3",
								description: "Electronic, Lo-Fi beats",
								image: "🎛️",
								tracks: 40,
							},
							{
								name: "Chill Mix",
								description: "Perfect for relaxing",
								image: "☁️",
								tracks: 60,
							},
							{
								name: "Focus Mix",
								description: "Instrumental music for work",
								image: "🧠",
								tracks: 75,
							},
							{
								name: "Anime Mix",
								description: "Your favorite anime themes",
								image: "📺",
								tracks: 35,
							},
						].map((mix, index) => (
							<div
								key={`mix-${mix.name}-${index}`}
								className="group bg-card hover:bg-accent transition-colors rounded-lg p-4 cursor-pointer"
							>
								<div className="flex items-center space-x-3">
									<div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center group-hover:bg-background transition-colors">
										<div className="text-2xl">{mix.image}</div>
									</div>
									<div className="flex-1 min-w-0">
										<h3 className="font-medium truncate group-hover:text-primary">
											{mix.name}
										</h3>
										<p className="text-sm text-muted-foreground truncate">
											{mix.description}
										</p>
										<p className="text-xs text-muted-foreground">
											{mix.tracks} tracks
										</p>
									</div>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Based on Your Music */}
			<Card>
				<CardHeader>
					<CardTitle>Based on Your Music</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
						{[
							{
								name: "More Like YOASOBI",
								artist: "Generated playlist",
								image: "🌟",
							},
							{
								name: "Discover Weekly",
								artist: "Your weekly mixtape",
								image: "🔍",
							},
							{
								name: "Release Radar",
								artist: "New music from artists you love",
								image: "📡",
							},
							{
								name: "Anime Radio",
								artist: "Based on your listening",
								image: "📻",
							},
							{
								name: "Lo-Fi Station",
								artist: "Chill beats you'll love",
								image: "🎵",
							},
						].map((playlist, index) => (
							<div
								key={`based-${playlist.name}-${index}`}
								className="group cursor-pointer"
							>
								<div className="bg-muted rounded-lg aspect-square flex items-center justify-center mb-3 group-hover:bg-accent transition-colors shadow-sm">
									<div className="text-3xl">{playlist.image}</div>
								</div>
								<h3 className="font-medium text-sm truncate group-hover:text-primary">
									{playlist.name}
								</h3>
								<p className="text-xs text-muted-foreground truncate">
									{playlist.artist}
								</p>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
