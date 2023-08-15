<script lang="ts">
	import YoutubePlayerPlus from 'youtube-player-plus';

	export let data;
	let playerDiv: HTMLDivElement;
	let player: YoutubePlayerPlus;
	let time: number;

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
			player.addListener('timeupdate', () => console.log(player.getCurrentTime()), 0);
		}
	}

	function onSongSelect(e: Event & { currentTarget: HTMLSelectElement }) {
		window.location.pathname = e.currentTarget.value;
	}
</script>

<header>カラオケ</header>
<div class="flex">
	<p id="text">
		{#each data.song.text.split('\n') as line, i}
			<div>
				{#each line.split('') as char, j}<span class={j % 5 === 0 ? 'white' : ''}>{char}</span
					>{/each}
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
				value={data.metadata.find((metadatum) => metadatum.videoId === data.song?.videoId)?.videoId}
				on:input={onSongSelect}
			>
				{#each data.metadata as metadatum}
					<option value={metadatum.videoId}>{metadatum.title}</option>
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
