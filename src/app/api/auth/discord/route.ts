import crypto from "node:crypto";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const code = searchParams.get("code");

	const clientId = process.env.DISCORD_CLIENT_ID || "1168385371294420992";
	const clientSecret = process.env.DISCORD_CLIENT_SECRET;
	const redirectUri =
		process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI ||
		"http://localhost:3000/api/auth/discord";

	if (!code) {
		const scope = encodeURIComponent("identify guilds");
		const authUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
			redirectUri,
		)}&response_type=code&scope=${scope}`;

		return NextResponse.redirect(authUrl);
	}

	try {
		if (!clientSecret) {
			// Fallback redirect if clientSecret is not yet set in .env
			return NextResponse.redirect(new URL("/?auth=success", request.url));
		}

		// 1. Exchange authorization code for Discord access token
		const tokenResponse = await fetch(
			"https://discord.com/api/v10/oauth2/token",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body: new URLSearchParams({
					client_id: clientId,
					client_secret: clientSecret,
					grant_type: "authorization_code",
					code: code,
					redirect_uri: redirectUri,
				}),
			},
		);

		if (!tokenResponse.ok) {
			throw new Error("Failed to exchange OAuth2 code");
		}

		const tokenData = await tokenResponse.json();
		const accessToken = tokenData.access_token;

		// 2. Fetch user profile from Discord
		const userResponse = await fetch("https://discord.com/api/v10/users/@me", {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});

		if (!userResponse.ok) {
			throw new Error("Failed to fetch Discord user profile");
		}

		const userData = await userResponse.json();

		// 3. Create signed session cookie for discord_user
		const secret =
			process.env.JWT_SECRET || "soundy_secret_key_change_me_in_env";
		const base64User = Buffer.from(JSON.stringify(userData)).toString(
			"base64url",
		);
		const signature = crypto
			.createHmac("sha256", secret)
			.update(base64User)
			.digest("base64url");
		const signedToken = `${base64User}.${signature}`;

		const response = NextResponse.redirect(
			new URL("/?auth=success", request.url),
		);
		response.cookies.set({
			name: "discord_user",
			value: signedToken,
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			path: "/",
			maxAge: 60 * 60 * 24 * 7, // 7 days
		});

		response.cookies.set({
			name: "discord_access_token",
			value: accessToken,
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			path: "/",
			maxAge: tokenData.expires_in || 60 * 60 * 24 * 7,
		});

		return response;
	} catch (error) {
		console.error("Error in Discord OAuth callback:", error);
		return NextResponse.redirect(new URL("/?auth=error", request.url));
	}
}
