import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import {
	Geist,
	Geist_Mono,
	Inter,
	Public_Sans,
	Roboto_Slab,
} from "next/font/google";
import { ThemeProvider } from "next-themes";
import { AppLayout } from "@/components/AppLayout";
import "./globals.css";
import { cn } from "@/lib/utils";

const publicSansHeading = Public_Sans({
	subsets: ["latin"],
	variable: "--font-heading",
});

const robotoSlab = Roboto_Slab({
	subsets: ["latin"],
	variable: "--font-serif",
});

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Soundy Dashboard - Modern Discord Music Bot Control",
	description:
		"Stream high quality music, manage custom playlists, view live synced lyrics, and control your Soundy Discord bot in real-time.",
	keywords: [
		"Discord music bot",
		"Soundy",
		"Music Player",
		"Lavalink",
		"Live Lyrics",
		"Discord Bot Dashboard",
	],
	openGraph: {
		title: "Soundy Dashboard - Modern Discord Music Bot Control",
		description:
			"Stream high quality music, manage custom playlists, view live synced lyrics, and control your Soundy Discord bot in real-time.",
		url: "https://soundy.mja.moe",
		siteName: "Soundy Dashboard",
		images: [
			{
				url: "https://raw.githubusercontent.com/idMJA/Soundy/master/assets/play.png",
				width: 1200,
				height: 630,
				alt: "Soundy Dashboard Interface",
			},
		],
		locale: "en_US",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Soundy Dashboard - Modern Discord Music Bot Control",
		description:
			"Control Soundy Discord Bot with high quality audio, live synced lyrics, and custom playlists.",
		images: [
			"https://raw.githubusercontent.com/idMJA/Soundy/master/assets/play.png",
		],
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={cn(
				inter.variable,
				"font-serif",
				robotoSlab.variable,
				publicSansHeading.variable,
			)}
		>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
				suppressHydrationWarning
			>
				<ThemeProvider
					attribute="class"
					defaultTheme="dark"
					enableSystem={false}
					disableTransitionOnChange
				>
					<AppLayout>{children}</AppLayout>
					<Analytics />
				</ThemeProvider>
			</body>
		</html>
	);
}
