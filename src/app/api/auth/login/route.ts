import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function GET(request: NextRequest) {
	const response = NextResponse.redirect(
		new URL("/api/auth/discord", request.url),
	);
	return response;
}
