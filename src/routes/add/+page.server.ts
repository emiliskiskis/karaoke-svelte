import type { Actions } from '@sveltejs/kit';
import { addSong, findKanaFromKanji } from '@/api';
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

		const splitText: (string | [string, string])[][] = text
			.split('\r\n')
			.flatMap((text) => text.split('\n'))
			.map((line) => line.split(''));

		for (const i in splitText) {
			for (const j in splitText[i]) {
				const char = splitText[i][j];
				if (typeof char !== 'string') {
					continue;
				}
				const kana = await findKanaFromKanji(char);
				if (kana) {
					splitText[i][j] = [char, kana];
					console.log(splitText[i][j]);
				}
			}
		}

		const song: Song = {
			text: splitText,
			videoId,
			title
		};
		await addSong(song);
	}
};
