import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { makeApiRequest } from "@/lib/api";

// POST /api/music/like
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { response, data } = await makeApiRequest("api/music/like", {
			method: "POST",
			body: JSON.stringify(body),
		});
		if (!response.ok) {
			return NextResponse.json(
				{ error: data.error || "Failed to like/unlike track" },
				{ status: response.status },
			);
		}
		return NextResponse.json(data);
	} catch (error) {
		console.error("Error liking/unliking track:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
