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

		const splitText = text
			.split('\r\n')
			.flatMap((text) => text.split('\n'))
			.map((line) => line.split(''));

		const song: Song = {
			text: splitText,
			videoId,
			title
		};
		await addSong(song);
	}
};
