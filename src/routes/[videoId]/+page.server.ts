import { MongoClient } from 'mongodb';

interface Song {
	title: string;
	videoId: string;
	text: string;
	times: number[];
}

interface SongMeta {
	title: string;
	videoId: string;
}

const options = { projection: { _id: 0 } };

export async function load({ params }) {
	const client = new MongoClient('mongodb://localhost:27017');
	try {
		const db = client.db('local');
		const songs = db.collection('songs');

		const metadata = await songs
			.find<Song>({})
			.project<SongMeta>({ _id: 0, title: 1, videoId: 1 })
			.toArray();
		const song = await songs.findOne<Song>({ videoId: params.videoId }, options);
		if (!song) {
			throw new Error('Song with specified id not found');
		}
		return { metadata, song };
	} finally {
		await client.close();
	}
}
