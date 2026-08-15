import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	try {
		const accessToken = req.cookies.get("discord_access_token")?.value;
		if (!accessToken) {
			return NextResponse.json({ success: true, guilds: [] });
		}

		const res = await fetch("https://discord.com/api/users/@me/guilds", {
			headers: { Authorization: `Bearer ${accessToken}` },
		});

		if (!res.ok) {
			return NextResponse.json({ success: true, guilds: [] });
		}

		const guilds = await res.json();
		return NextResponse.json({ success: true, guilds });
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: String(error) },
			{ status: 500 },
		);
	}
}
