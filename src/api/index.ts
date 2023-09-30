import { MongoClient } from 'mongodb';
import type { Song, SongMeta } from './types';

export const noId = { projection: { _id: 0 } };

const client = new MongoClient('mongodb://localhost:27017');
export const songsCollection = client.db('local').collection('songs');

export const getSongs = () =>
	songsCollection.find<Song>({}).project<SongMeta>({ _id: 0, title: 1, videoId: 1 }).toArray();

export const getSong = (id: string) => songsCollection.findOne<Song>({ videoId: id }, noId);
