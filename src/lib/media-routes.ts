export interface PlatformConfig {
	prefix: string;
	domainPattern: string | RegExp;
	// Function to generate the clean URL path from a full URL
	toAestheticPath: (url: string) => string | null;
	// Function to reconstruct the full URL from the parsed catch-all parts
	toFullUrl: (parts: string[]) => string | null;
}

export const PLATFORMS: PlatformConfig[] = [
	{
		prefix: "s",
		domainPattern: /open\.spotify\.com|spotify:/,
		toAestheticPath: (url) => {
			const match = url.match(
				/(?:open\.spotify\.com\/|spotify:)(track|album|playlist|artist)[/:]([a-zA-Z0-9]+)/,
			);
			return match ? `s/${match[1]}/${match[2]}` : null;
		},
		toFullUrl: (parts) => {
			if (parts.length >= 3) {
				const [, subType, trackId] = parts;
				return `https://open.spotify.com/${subType}/${trackId}`;
			}
			return null;
		},
	},
	{
		prefix: "am",
		domainPattern: "music.apple.com",
		toAestheticPath: (url) => {
			try {
				const urlObj = new URL(url);
				const pathParts = urlObj.pathname.split("/").filter(Boolean);
				if (pathParts.length >= 2) {
					return `am/${pathParts.join("/")}`;
				}
			} catch {}
			return null;
		},
		toFullUrl: (parts) => {
			if (parts.length >= 2) {
				const partsWithoutAm = parts.slice(1);
				return `https://music.apple.com/${partsWithoutAm.join("/")}`;
			}
			return null;
		},
	},
	{
		prefix: "yt",
		domainPattern: /youtube\.com|youtu\.be/,
		toAestheticPath: (url) => {
			try {
				if (url.includes("youtu.be")) {
					const urlObj = new URL(url);
					const videoId = urlObj.pathname.split("/").filter(Boolean)[0];
					if (videoId) return `yt/${videoId}`;
				} else {
					const urlObj = new URL(url);
					const videoId = urlObj.searchParams.get("v");
					if (videoId) return `yt/${videoId}`;
				}
			} catch {}
			return null;
		},
		toFullUrl: (parts) => {
			if (parts.length >= 2) {
				return `https://www.youtube.com/watch?v=${parts[1]}`;
			}
			return null;
		},
	},
];
