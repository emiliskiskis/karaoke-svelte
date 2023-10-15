import { Collection, MongoClient } from 'mongodb';
import type { JMDict, Song, SongMeta } from './types';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';

export const noId = { projection: { _id: 0 } };

// prettier-ignore
export const addBefore = ['ゃ',	'ゅ',	'ょ',	'ャ',	'ュ',	'ョ',	'っ',	'ッ',	'ん',	'ン',	'.',	'。',	'、',	'ー'];
// prettier-ignore
export const joinTogether = ['今日',	'一人',	'二人',	'ゃう',	'ゅう',	'ょう',	'ャウ',	'ュウ',	'ョウ',	'えい',	'エイ',	'ない'];

function spawnProcess(command: string, args: string[]) {
	return new Promise<void>((resolve, reject) => {
		const process = spawn(command, args, { cwd: '/Users/emilispersonal/repos/karaoke-svelte' });
		console.log(`Running "${command} ${args.join(' ')}"`);
		// process.stdout.on('data', (data) => console.log(data.toString()));
		// process.stderr.on('data', (data) => console.log(data.toString()));
		process.on('close', (code) => {
			if (code == null || code > 0) {
				reject(code);
			}
			resolve();
		});
	});
}

const jmDictDownloadUrl =
	'https://github.com/scriptin/jmdict-simplified/releases/download/3.5.0%2B20231009190813/jmdict-eng-3.5.0+20231009190813.json.zip';
const jmDictFileName = 'jmdict-eng-3.5.0.json';

const jmdict: Promise<JMDict> = (async () => {
	if (existsSync(jmDictFileName)) {
		console.log('Reading JMDict from cache');
		return JSON.parse((await readFile(jmDictFileName)).toString());
	} else {
		try {
			console.log(`Downloading JMDict from ${jmDictDownloadUrl}`);
			await spawnProcess('wget', [jmDictDownloadUrl]);
			await spawnProcess('unzip', ['jmdict-eng-3.5.0+20231009190813.json.zip']);
			await spawnProcess('rm', ['jmdict-eng-3.5.0+20231009190813.json.zip']);
			const file = await readFile(jmDictFileName);
			return JSON.parse(file.toString());
		} catch (err) {
			console.error(err);
		}
	}
})();

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

export const findKanaFromKanji = async (kanji: string) =>
	(await jmdict).words.find((word) => word.kanji[0]?.text === kanji)?.kana[0]?.text;
