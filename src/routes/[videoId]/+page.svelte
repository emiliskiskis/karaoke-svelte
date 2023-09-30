<script lang="ts">
	import { onMount } from 'svelte';
	import YoutubePlayerPlus from 'youtube-player-plus';

	export let data;
	let playerDiv: HTMLDivElement;
	let player: YoutubePlayerPlus;

	$: {
		if (playerDiv) {
			console.log(playerDiv);
			player = new YoutubePlayerPlus(playerDiv, {
				relatedVideos: false,
				timeUpdateFrequency: 60,
				width: 640,
				height: 390
			});
			player.load(data.song.videoId, true);
			player.setPlaybackRate(5);
		}
	}

	let handle: number | undefined;
	let onCount = 0;

	const handleUpdate = () => {
		const time = player.getCurrentTime();
		while (data.song.times[onCount] <= time) {
			onCount++;
		}
	};

	onMount(() => {
		if (handle) {
			window.clearInterval(handle);
		}
		handle = window.setInterval(handleUpdate, 100 / 6);
		return () => {
			window.clearInterval(handle);
			handle = undefined;
		};
	});

	function onSongSelect(e: Event & { currentTarget: HTMLSelectElement }) {
		window.location.pathname = e.currentTarget.value;
	}

	$: lines = data.song.text.split('\n');
	$: chars = lines
		.map((line) => line.split(''))
		.map((line) => {
			let newLine = [];
			for (let i = 0; i < line.length; i++) {
				newLine.push(line[i]);
				if (i === line.length - 1) {
					continue;
				}
				while (
					[
						'ゃ',
						'ゅ',
						'ょ',
						'ャ',
						'ュ',
						'ョ',
						'っ',
						'ッ',
						'ん',
						'ン',
						'.',
						'。',
						'、',
						'ー'
					].includes(line[i + 1])
				) {
					console.log(newLine);
					newLine[newLine.length - 1] += line[i + 1];
					i++;
				}
				if (
					[
						'今日',
						'一人',
						'二人',
						'ゃう',
						'ゅう',
						'ょう',
						'ャウ',
						'ュウ',
						'ョウ',
						'えい',
						'エイ',
						'ない'
					].includes(`${line[i]}${line[i + 1]}`)
				) {
					console.log(newLine);
					newLine[newLine.length - 1] += line[i + 1];
					i++;
				}
			}
			return newLine;
		});
	$: timeSteps = chars.map((line, i) =>
		chars.slice(0, i).reduce((acc, curr) => acc + curr.length, 0)
	);

	$: console.log({ chars, lines, timeSteps });

	const handleCharClick = (i: number) => {
		onCount = i;
		player.seek(data.song.times[i]);
	};
</script>

<header>カラオケ</header>
<div class="flex">
	<p id="text">
		{#each chars as line, i}
			<div>
				{#each line as char, j}
					<span
						class={timeSteps[i] + j < onCount ? 'white' : ''}
						on:click={() => handleCharClick(timeSteps[i] + j)}>{char}</span
					>
				{/each}
			</div>
		{/each}
	</p>
	<div id="aside">
		<div>
			<div bind:this={playerDiv} />
		</div>
		<div class="flex between">
			<div>
				<button id="record" type="button" disabled>Start transcription</button>
				<button id="replay" type="button" disabled>Start lyrics</button>
				<button id="correct" type="button" disabled>Correct timings</button>
			</div>
			<select
				id="select-song"
				value={data.songs.find((_song) => _song.videoId === data.song?.videoId)?.videoId}
				on:input={onSongSelect}
			>
				{#each data.songs as song}
					<option value={song.videoId}>{song.title}</option>
				{/each}
			</select>
		</div>
		<div id="instructions">Hello World</div>
	</div>
</div>

<style>
	p {
		font-size: 36px;
		font-weight: bold;
		width: fit-content;
		margin: 10px;
		font-family: 'MS Mincho';
	}

	#aside {
		position: sticky;
		top: 52px;
		height: fit-content;
	}

	.white {
		color: white;
	}

	.flex {
		display: flex;
		gap: 50px;
	}

	.flex.between {
		justify-content: space-between;
	}

	span {
		cursor: pointer;
	}

	#text > div {
		min-height: 1em;
	}

	#instructions {
		font-size: 2em;
		margin: 16px 0;
	}

	header {
		margin: 16px 0 0 8px;
		color: brown;
		font-size: 3em;
	}

	:global(body) {
		background-color: lightgreen;
		font-family: 'Arial';
	}
</style>
