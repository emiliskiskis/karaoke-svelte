import { getSong, getSongs } from '@/api/index';

export async function load({ params }) {
	const song = await getSong(params.videoId);
	if (!song) {
		throw new Error('Song with specified id not found');
	}
	return { songs: await getSongs(), song };
}
