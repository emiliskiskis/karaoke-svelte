<script lang="ts">
	import { displayTime } from '@/lib/index.js';
	import { onMount } from 'svelte';
	import YoutubePlayerPlus from 'youtube-player-plus';

	export let data;

	// Types and enums

	enum EditingMode {
		Uninitialized,
		Playback,
		Transcription,
		Correction
	}

	enum CorrectionStep {
		SelectStartPoint,
		SelectEndPoint,
		FixTimings
	}

	// Variables

	let playerDiv: HTMLDivElement;
	let player: YoutubePlayerPlus;
	let handle: number | undefined;
	let onCount = 0;

	let mode = EditingMode.Playback;
	let correctionStep = CorrectionStep.SelectStartPoint;
	let correctionData = {
		beginning: 99999,
		end: 0
	};
	let currentInstruction = '';

	const lines = data.song.text.split('\n');

	const chars = lines
		.map((line) => line.split(''))
		.map((line) => {
			let newLine = [];
			for (let i = 0; i < line.length; i++) {
				newLine.push(line[i]);
				if (i === line.length - 1) {
					continue;
				}
				while (
					i !== line.length - 1 &&
					([
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
					].includes(line[i + 1]) ||
						!line[i + 1].trim())
				) {
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
					].includes(line[i] + line[i + 1])
				) {
					newLine[newLine.length - 1] += line[i + 1];
					i++;
				}
			}
			return newLine;
		});

	const timeSteps = chars.map((line, i) =>
		chars.slice(0, i).reduce((acc, curr) => acc + curr.length, 0)
	);

	// Functions / handlers

	const startRender = () => {
		if (handle) {
			window.clearInterval(handle);
		}
		handle = window.setInterval(handleFrame, 1000 / 60);
	};

	const stopRender = () => {
		window.clearInterval(handle);
		handle = undefined;
	};

	const handleFrame = () => {
		const time = player.getCurrentTime();
		// Go back in time if seeked backwards
		if (onCount > 0) {
			while (data.song.times![onCount - 1] > time) {
				onCount--;
			}
		}
		while (data.song.times![onCount] <= time) {
			onCount++;
		}
		if (
			mode === EditingMode.Correction &&
			correctionStep === CorrectionStep.FixTimings &&
			onCount > correctionData.end
		) {
			mode = EditingMode.Playback;
			currentInstruction = 'Correction done!';
		}
	};

	const handleFixTimingsClick = () => {
		player.pause();
		mode = EditingMode.Correction;
		correctionStep = CorrectionStep.SelectStartPoint;
		correctionData = {
			beginning: 99999,
			end: 0
		};
		currentInstruction = 'Select the beginning of the incorrect segment';
	};

	const handleCharClick = (i: number) => {
		switch (mode) {
			case EditingMode.Uninitialized:
				break;
			case EditingMode.Playback:
				if (data.song.times) {
					player.seek(data.song.times[i]);
				}
				break;
			case EditingMode.Transcription:
				break;
			case EditingMode.Correction:
				switch (correctionStep) {
					case CorrectionStep.SelectStartPoint:
						correctionData.beginning = i;
						correctionData.end = i;
						currentInstruction = 'Select the end of the incorrect segment';
						correctionStep = CorrectionStep.SelectEndPoint;
						break;
					case CorrectionStep.SelectEndPoint:
						correctionData.end = i;
						player.seek(
							Math.max(data.song.times![correctionData.beginning] - 5 * player.playbackRate, 0)
						);
						player.play();

						let countdown = 5;
						currentInstruction = `Begin transcribing in ${countdown--}...`;

						let _handle = window.setInterval(() => {
							currentInstruction = `Begin transcribing in ${countdown}...`;
							if (countdown-- === 0) {
								currentInstruction = 'Transcribe!';
								window.clearInterval(_handle);
							}
						}, 1000);

						correctionStep = CorrectionStep.FixTimings;
						break;
					case CorrectionStep.FixTimings:
						mode = EditingMode.Playback;
						break;
				}
				break;
		}
	};

	const handleCharHover = (i: number) => {
		if (mode !== EditingMode.Correction) return;
		switch (correctionStep) {
			case CorrectionStep.SelectStartPoint: {
				currentInstruction = displayTime(data.song.times[i]);
				break;
			}
			case CorrectionStep.SelectEndPoint: {
				currentInstruction = displayTime(
					data.song.times[correctionData.beginning],
					data.song.times[i]
				);
				correctionData.end = Math.max(correctionData.beginning, i);
				break;
			}
			case CorrectionStep.FixTimings:
				break;
		}
	};

	const handleSongSelect = (e: Event & { currentTarget: HTMLSelectElement }) => {
		window.location.pathname = e.currentTarget.value;
	};

	// Lifecycle methods

	onMount(() => {
		return () => stopRender();
	});

	// Dynamic values

	$: {
		if (playerDiv) {
			player = new YoutubePlayerPlus(playerDiv, {
				// relatedVideos: false,
				width: 640,
				height: 390
			});
			player.load(data.song.videoId, true);
			player.setPlaybackRate(2);
			startRender();
		}
	}

	// $: console.log({ chars, lines, timeSteps });
	// $: console.log({ onCount });
	$: console.log({
		mode,
		correctionStep,
		begin: correctionData.beginning,
		end: correctionData.end
	});
</script>

<header>カラオケ</header>
<main class="flex">
	<p id="text">
		{#each chars as line, i}
			<div>
				{#each line as char, j}
					<span
						class={[
							mode === EditingMode.Correction &&
								timeSteps[i] + j >= correctionData.beginning &&
								timeSteps[i] + j <= correctionData.end &&
								'red',
							timeSteps[i] + j < onCount &&
								(correctionStep === CorrectionStep.FixTimings &&
								timeSteps[i] + j >= correctionData.beginning &&
								timeSteps[i] + j <= correctionData.end
									? 'green'
									: 'white')
						]
							.filter((a) => a)
							.join(' ')}
						on:click={() => handleCharClick(timeSteps[i] + j)}
						on:mouseenter={() => handleCharHover(timeSteps[i] + j)}>{char}</span
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
				<button
					id="correct"
					type="button"
					disabled={!data.song.times}
					on:click={handleFixTimingsClick}>Correct timings</button
				>
			</div>
			<select
				id="select-song"
				value={data.songs.find((_song) => _song.videoId === data.song.videoId)?.videoId}
				on:input={handleSongSelect}
			>
				{#each data.songs as song}
					<option value={song.videoId}>{song.title}</option>
				{/each}
			</select>
		</div>
		<div id="instructions">{currentInstruction}</div>
	</div>
</main>

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

	.red {
		color: red;
	}

	.green {
		color: green;
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
