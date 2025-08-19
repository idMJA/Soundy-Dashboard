import SearchClient from "./SearchClient";

export default async function SearchQueryPage({
	params,
}: {
	params: Promise<{ query: string }>;
}) {
	const query = (await params).query;

	return <SearchClient initialQuery={query} />;
}
