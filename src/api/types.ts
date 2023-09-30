export interface Song extends SongMeta {
	text: string;
	times: number[];
}

export interface SongMeta {
	title: string;
	videoId: string;
}
