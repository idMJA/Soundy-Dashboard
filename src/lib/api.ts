// Utility function to build API URLs from environment variables
export function getApiUrl(endpoint: string): string {
	const protocol = process.env.API_PROTOCOL || "http";
	const baseUrl = process.env.API_URL || "localhost:4000";

	// Remove leading slash from endpoint if present
	const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;

	return `${protocol}://${baseUrl}/${cleanEndpoint}`;
}

// Helper function for making API requests to the backend
export async function makeApiRequest(
	endpoint: string,
	options: RequestInit = {},
) {
	const url = getApiUrl(endpoint);

	const defaultOptions: RequestInit = {
		headers: {
			"Content-Type": "application/json",
			...options.headers,
		},
	};

	const mergedOptions = {
		...defaultOptions,
		...options,
		headers: {
			...defaultOptions.headers,
			...options.headers,
		},
	};

	const response = await fetch(url, mergedOptions);
	const data = await response.json();

	return { response, data };
}
