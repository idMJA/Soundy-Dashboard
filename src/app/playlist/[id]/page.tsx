import PlaylistClient from "./PlaylistClient";

export default async function PlaylistPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const playlistId = (await params).id;

	return <PlaylistClient playlistId={playlistId} />;
}
