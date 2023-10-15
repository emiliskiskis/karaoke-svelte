export interface Song extends SongMeta {
	text: (string | [string, string])[][];
	lines?: string[][];
	times?: number[];
}

export interface SongMeta {
	title: string;
	videoId: string;
}
