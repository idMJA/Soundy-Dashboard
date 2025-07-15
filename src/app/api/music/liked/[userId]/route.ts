import { type NextRequest, NextResponse } from "next/server";
import { makeApiRequest } from "@/lib/api";

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ userId: string }> },
) {
	try {
		const { userId } = await params;
		const { response, data } = await makeApiRequest(
			`api/music/liked/${userId}`,
			{
				method: "GET",
			},
		);
		if (!response.ok) {
			return NextResponse.json(
				{ error: data.error || "Failed to fetch liked songs" },
				{ status: response.status },
			);
		}
		return NextResponse.json(data);
	} catch (error) {
		console.error("Error fetching liked songs:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
