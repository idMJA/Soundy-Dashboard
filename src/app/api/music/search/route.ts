import { type NextRequest, NextResponse } from "next/server";
import { makeApiRequest } from "@/lib/api";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const query = searchParams.get("q");

		if (!query) {
			return NextResponse.json(
				{ error: "Query parameter is required" },
				{ status: 400 },
			);
		}

		const { response, data } = await makeApiRequest(
			`api/music/search?q=${encodeURIComponent(query)}`,
			{
				method: "GET",
			},
		);

		if (!response.ok) {
			return NextResponse.json(
				{ error: data.error || "Failed to search music" },
				{ status: response.status },
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Error searching music:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
