import { type NextRequest, NextResponse } from "next/server";

interface DiscordTokenResponse {
	access_token: string;
	token_type: string;
	expires_in: number;
	refresh_token: string;
	scope: string;
}

interface DiscordUser {
	id: string;
	username: string;
	discriminator: string;
	avatar: string | null;
	email?: string;
	verified?: boolean;
	flags?: number;
	banner?: string | null;
	accent_color?: number | null;
	premium_type?: number;
	public_flags?: number;
}
// Validator function for environment variables

// Validate that we have all required environment variables
const validateEnv = () => {
	const required = [
		"DISCORD_CLIENT_ID",
		"DISCORD_CLIENT_SECRET",
		"DISCORD_REDIRECT_URI",
	];
	const missing = required.filter((key) => !process.env[key]);
	if (missing.length > 0) {
		throw new Error(
			`Missing required environment variables: ${missing.join(", ")}`,
		);
	}
};

export async function GET(req: NextRequest) {
	try {
		validateEnv();

		const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID as string;
		const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET as string;
		const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI as string;
		const DISCORD_OAUTH_URL =
			`https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}` +
			`&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}` +
			`&response_type=code&scope=identify%20guilds`;

		const { searchParams } = new URL(req.url);
		const code = searchParams.get("code");
		const error = searchParams.get("error");

		// If user denied access
		if (error) {
			return NextResponse.redirect(
				new URL("/auth/error?reason=access_denied", req.url),
			);
		}

		if (!code) {
			// Step 1: Redirect user to Discord OAuth
			return NextResponse.redirect(DISCORD_OAUTH_URL);
		}

		// Step 2: Exchange code for access token
		const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: new URLSearchParams({
				client_id: DISCORD_CLIENT_ID,
				client_secret: DISCORD_CLIENT_SECRET,
				grant_type: "authorization_code",
				code,
				redirect_uri: DISCORD_REDIRECT_URI,
			}),
		});

		if (!tokenRes.ok) {
			console.error("Failed to get Discord token:", await tokenRes.text());
			return NextResponse.json(
				{ success: false, error: "Failed to authenticate with Discord" },
				{ status: 400 },
			);
		}
		const tokenData: DiscordTokenResponse = await tokenRes.json();
		const accessToken = tokenData.access_token;

		// Step 3: Get user info
		const userRes = await fetch("https://discord.com/api/users/@me", {
			headers: { Authorization: `Bearer ${accessToken}` },
		});

		if (!userRes.ok) {
			console.error("Failed to get Discord user:", await userRes.text());
			return NextResponse.json(
				{ success: false, error: "Failed to get Discord user information" },
				{ status: 400 },
			);
		}
		const user: DiscordUser = await userRes.json();

		// Step 4: Get user's guilds (servers)
		const guildsRes = await fetch("https://discord.com/api/users/@me/guilds", {
			headers: { Authorization: `Bearer ${accessToken}` },
		});

		// We'll fetch guilds data but won't use it yet
		if (guildsRes.ok) {
			await guildsRes.json();
		}

		// Step 5: Save session in cookies
		const response = NextResponse.redirect(new URL("/", req.url));

		// Set cookies with user data and access token
		response.cookies.set({
			name: "discord_user",
			value: JSON.stringify(user),
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			path: "/",
			maxAge: 60 * 60 * 24 * 7, // 1 week
		});

		response.cookies.set({
			name: "discord_access_token",
			value: accessToken,
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			path: "/",
			maxAge: 60 * 60 * 24 * 7, // 1 week
		});

		// Return the response with set cookies
		return response;
	} catch (error) {
		console.error("Discord auth error:", error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Authentication failed",
			},
			{ status: 500 },
		);
	}
}

export async function POST() {
	// For logout: clear cookies
	const response = NextResponse.json({ success: true });

	response.cookies.set({
		name: "discord_user",
		value: "",
		httpOnly: true,
		expires: new Date(0),
		path: "/",
	});

	response.cookies.set({
		name: "discord_access_token",
		value: "",
		httpOnly: true,
		expires: new Date(0),
		path: "/",
	});

	return response;
}
