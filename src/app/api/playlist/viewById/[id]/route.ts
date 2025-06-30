import { type NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api";

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;

		// For view playlist, we redirect to the backend URL since it might return HTML or special content
		const url = getApiUrl(`api/playlist/viewById/${id}`);

		return NextResponse.redirect(url);
	} catch (error) {
		console.error("Error viewing playlist:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
