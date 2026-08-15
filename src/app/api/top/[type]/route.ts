import { type NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ type: string }> },
) {
	try {
		const { type } = await params;
		const searchParams = request.nextUrl.searchParams.toString();
		const endpoint = `/api/top/${type}${searchParams ? `?${searchParams}` : ""}`;
		const apiUrl = getApiUrl(endpoint);

		const res = await fetch(apiUrl, {
			headers: { "Content-Type": "application/json" },
			next: { revalidate: 30 },
		});

		if (!res.ok) {
			return NextResponse.json({ tracks: [], users: [], guilds: [] });
		}

		const data = await res.json();
		return NextResponse.json(data);
	} catch (error) {
		return NextResponse.json(
			{
				error:
					error instanceof Error ? error.message : "Failed to fetch top data",
			},
			{ status: 500 },
		);
	}
}
