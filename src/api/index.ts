import { Collection, MongoClient } from 'mongodb';
import type { Song, SongMeta } from './types';

export const noId = { projection: { _id: 0 } };

export const query = async <T>(q: (collection: Collection<Song>) => T) => {
	const client = new MongoClient('mongodb://localhost:27017');
	try {
		const collection = client.db('local').collection<Song>('songs');
		return await q(collection);
	} finally {
		await client.close();
	}
};

export const getSongs = () =>
	query((collection) =>
		collection.find({}).project<SongMeta>({ _id: 0, title: 1, videoId: 1 }).toArray()
	);

export const getSong = (id: string) =>
	query((collection) => collection.findOne<Song>({ videoId: id }, noId));
