export interface Song extends SongMeta {
	text: (string | [string, string])[][];
	lines?: string[][];
	times?: number[];
}

export interface SongMeta {
	title: string;
	videoId: string;
}

export interface JMDict {
	words: {
		id: string;
		kanji: Character[];
		kana: Character[];
	}[];
}

interface Character {
	common: boolean;
	text: string;
}
