import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { makeApiRequest } from "@/lib/api";

// POST /api/playlist - Create new playlist
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		const { response, data } = await makeApiRequest("api/playlist/create", {
			method: "POST",
			body: JSON.stringify(body),
		});

		if (!response.ok) {
			return NextResponse.json(
				{ error: data.error || "Failed to create playlist" },
				{ status: response.status },
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Error creating playlist:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

// DELETE /api/playlist - Delete playlist
export async function DELETE(request: NextRequest) {
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

// PUT /api/playlist - Add track to playlist
export async function PUT(request: NextRequest) {
	try {
		const body = await request.json();

		const { response, data } = await makeApiRequest("api/playlist/add", {
			method: "POST",
			body: JSON.stringify(body),
		});

		if (!response.ok) {
			return NextResponse.json(
				{ error: data.error || "Failed to add track to playlist" },
				{ status: response.status },
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Error adding track to playlist:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

// PATCH /api/playlist - Remove track from playlist
export async function PATCH(request: NextRequest) {
	try {
		const body = await request.json();

		const { response, data } = await makeApiRequest("api/playlist/remove", {
			method: "POST",
			body: JSON.stringify(body),
		});

		if (!response.ok) {
			return NextResponse.json(
				{ error: data.error || "Failed to remove track from playlist" },
				{ status: response.status },
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Error removing track from playlist:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
