import type { Actions } from '@sveltejs/kit';
import { addSong } from '@/api';
import type { Song } from '@/api/types';

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const title = data.get('title');
		const videoId = data.get('videoId');
		const text = data.get('text');

		if (
			!title ||
			!videoId ||
			!text ||
			typeof title !== 'string' ||
			typeof videoId !== 'string' ||
			typeof text !== 'string'
		) {
			return;
		}

		const song: Song = {
			text: text.split(''),
			videoId,
			title
		};
		await addSong(song);
	}
};
