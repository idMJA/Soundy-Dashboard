import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function GET(request: NextRequest) {
	try {
		const user = request.cookies.get("discord_user")?.value;

		if (!user) {
			return NextResponse.json(
				{
					success: false,
					isLoggedIn: false,
					error: "Not logged in",
				},
				{ status: 401 },
			);
		}

		return NextResponse.json({
			success: true,
			isLoggedIn: true,
			user: JSON.parse(user),
		});
	} catch (error) {
		return NextResponse.json(
			{
				success: false,
				isLoggedIn: false,
				error: error instanceof Error ? error.message : "Authentication error",
			},
			{ status: 500 },
		);
	}
}
