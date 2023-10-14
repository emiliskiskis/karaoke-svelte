import { saveSong } from '@/api/index.js';
import { json } from '@sveltejs/kit';

export async function PATCH({ request }) {
	const data = await request.json();
	return json(await saveSong(data.videoId, data.song));
}
