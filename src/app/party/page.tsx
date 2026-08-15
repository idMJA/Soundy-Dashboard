"use client";

import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function PartyPageRedirect() {
	useEffect(() => {
		redirect("/");
	}, []);

	return null;
}
