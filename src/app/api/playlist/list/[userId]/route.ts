import { NextResponse } from "next/server";
import { makeApiRequest } from "@/lib/api";

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ userId: string }> },
) {
	try {
		const { userId } = await params;

		const { response, data } = await makeApiRequest(
			`api/playlist/list/${userId}`,
			{
				method: "GET",
			},
		);

		if (!response.ok) {
			return NextResponse.json(
				{ error: data.error || "Failed to fetch playlists" },
				{ status: response.status },
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Error fetching playlists:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
