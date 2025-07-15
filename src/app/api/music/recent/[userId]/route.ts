import { type NextRequest, NextResponse } from "next/server";
import { makeApiRequest } from "@/lib/api";

// GET /api/music/recent/[userId]
export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ userId: string }> },
) {
	try {
		const { userId } = await params;
		if (!userId) {
			return NextResponse.json({ error: "Missing userId" }, { status: 400 });
		}
		const { response, data } = await makeApiRequest(
			`api/music/recent/${userId}`,
			{
				method: "GET",
			},
		);
		if (!response.ok) {
			return NextResponse.json(
				{ error: data.error || "Failed to fetch recent tracks" },
				{ status: response.status },
			);
		}
		return NextResponse.json(data);
	} catch (error) {
		console.error("Error fetching recent tracks:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
