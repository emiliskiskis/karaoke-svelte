<script>
	import YoutubePlayerPlus from 'youtube-player-plus';

	export let data;
	let playerDiv;
	console.log(playerDiv);

	if (playerDiv) {
		console.log(playerDiv);
		const player = new YoutubePlayerPlus(playerDiv, {
			relatedVideos: false,
			width: 640,
			height: 390
		});
		if (data.song) {
			player.load(data.song?.videoId);
		}
	}
</script>

<header>カラオケ</header>
<div class="flex">
	<p id="text">
		{#if data.song}
			{#each data.song.text.split('\n') as line}
				<div>
					{#each line.split('') as char}<span>{char}</span>{/each}
				</div>
			{/each}
		{/if}
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
			<select id="select-song">
				<option value="0">稲葉曇『ラグトレイン』</option>
				<option value="1">ポルノグラフィティ『メリッサ』</option>
				<option value="2">ポルノグラフィティ『サウダージ』</option>
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
