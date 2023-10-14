import { Collection, MongoClient } from 'mongodb';
import type { Song, SongMeta } from './types';

export const noId = { projection: { _id: 0 } };

// prettier-ignore
export const addBefore = ['ゃ',	'ゅ',	'ょ',	'ャ',	'ュ',	'ョ',	'っ',	'ッ',	'ん',	'ン',	'.',	'。',	'、',	'ー'];
// prettier-ignore
export const joinTogether = ['今日',	'一人',	'二人',	'ゃう',	'ゅう',	'ょう',	'ャウ',	'ュウ',	'ョウ',	'えい',	'エイ',	'ない'];

export const query = async <T>(q: (collection: Collection<Song>) => Promise<T>) => {
	const client = new MongoClient('mongodb://localhost:27017');
	try {
		const collection = client.db('karaoke').collection<Song>('songs');
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

export const addSong = (song: Song) => query((collection) => collection.insertOne(song));

export const saveSong = (videoId: string, song: Partial<Song>) =>
	query((collection) =>
		collection.updateOne(
			{
				videoId
			},
			{
				$set: { ...song }
			}
		)
	);
