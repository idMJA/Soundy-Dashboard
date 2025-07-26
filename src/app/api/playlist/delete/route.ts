import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { makeApiRequest } from "@/lib/api";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { response, data } = await makeApiRequest("api/playlist/delete", {
			method: "POST",
			body: JSON.stringify(body),
		});
		if (!response.ok) {
			return NextResponse.json(
				{ error: data.error || "Failed to delete playlist" },
				{ status: response.status },
			);
		}
		return NextResponse.json(data);
	} catch (error) {
		console.error("Error deleting playlist:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
