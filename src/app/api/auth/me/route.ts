import crypto from "node:crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function GET(request: NextRequest) {
	try {
		const token = request.cookies.get("discord_user")?.value;

		if (!token) {
			return NextResponse.json(
				{
					success: false,
					isLoggedIn: false,
					error: "Not logged in",
				},
				{ status: 401 },
			);
		}

		// Verify signature
		const parts = token.split(".");
		if (parts.length !== 2) {
			throw new Error("Invalid token format");
		}

		const [base64Data, signature] = parts;
		const secret = process.env.JWT_SECRET;
		if (!secret) {
			throw new Error("JWT_SECRET environment variable is not configured");
		}
		const expectedSignature = crypto
			.createHmac("sha256", secret)
			.update(base64Data)
			.digest("base64url");

		if (signature !== expectedSignature) {
			const response = NextResponse.json(
				{
					success: false,
					isLoggedIn: false,
					error: "Invalid session signature",
				},
				{ status: 401 },
			);
			response.cookies.set({
				name: "discord_user",
				value: "",
				expires: new Date(0),
				path: "/",
			});
			return response;
		}

		const userJson = Buffer.from(base64Data, "base64url").toString("utf-8");
		const user = JSON.parse(userJson);

		return NextResponse.json({
			success: true,
			isLoggedIn: true,
			user: user,
			token: token,
		});
	} catch (error) {
		return NextResponse.json(
			{
				success: false,
				isLoggedIn: false,
				error: error instanceof Error ? error.message : "Authentication error",
			},
			{ status: 500 },
		);
	}
}
