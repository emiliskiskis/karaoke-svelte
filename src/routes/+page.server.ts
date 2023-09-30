import { getSongs } from '@/api/index';

export async function load() {
	return {
		songs: await getSongs()
	};
}
