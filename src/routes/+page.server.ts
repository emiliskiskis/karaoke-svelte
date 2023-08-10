import { MongoClient } from 'mongodb';

interface Song {
	title: string;
	videoId: string;
	text: string;
	times: number[];
}

const options = { projection: { _id: 0 } };

export async function load({ params }) {
	const client = new MongoClient('mongodb://localhost:27017');
	try {
		const db = client.db('local');
		const songs = db.collection('songs');

		const song = await songs.findOne<Song>({ videoId: 'UnIhRpIT7nc' }, options);
		console.log(song);
		return { song };
	} finally {
		await client.close();
	}
}
