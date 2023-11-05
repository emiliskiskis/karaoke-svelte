<script lang="ts">
	import { browser } from '$app/environment';
	import { displayTime } from '@/lib';
	import { CorrectionStep, EditingMode, state } from '@/lib/stores';
	import { onDestroy, onMount } from 'svelte';
	import YoutubePlayerPlus from 'youtube-player-plus';

	export let data;

	// Types and enums

	// Variables

	const { text, times, videoId } = data.song;
	let furiganaInputProps:
		| { visible: false }
		| {
				visible: true;
				i: number;
				j: number;
				charRef: HTMLSpanElement;
		  } = {
		visible: false
	};

	let playerDiv: HTMLDivElement;
	let player: YoutubePlayerPlus;
	let handle: number | undefined;
	let onCount = 0;

	$: mode = $state.mode;
	$: correctionStep = $state.correctionStep;
	$: correctionData = $state.correctionData;
	$: currentInstruction = $state.currentInstruction;

	let timeSteps: number[][];
	let editingTimes: number[] = [];

	// Functions
	const isKanji = (char?: string) => (!char ? false : /[\u4e00-\u9faf々]/.test(char));

	const sumArray = (arr: (string | [string, string])[]): number[] => {
		return arr.map((_, i) =>
			arr
				.slice(0, i)
				.reduce((acc, curr) => acc + (typeof curr === 'string' ? 1 : curr[1].length), 0)
		);
	};

	const memoize = <T extends (...args: any[]) => any>(fn: T) => {
		const cache = new Map<string, ReturnType<T>>();
		const cached = (...params: Parameters<T>): ReturnType<T> => {
			const key = params.join();
			let val: ReturnType<T> | undefined;
			if ((val = cache.get(key))) {
				return val;
			}
			const newVal = fn(...params);
			cache.set(key, newVal);
			return newVal;
		};
		return cached;
	};

	const getFuriganaStyles = (props: typeof furiganaInputProps) => {
		const { visible } = props;

		if (!visible) {
			return 'display: none';
		}

		const { offsetLeft, offsetTop, offsetWidth } = props.charRef;

		return (
			`top: ${Math.max(offsetTop - 35, 0)}px;` +
			`left: ${Math.max(offsetLeft - 60 + offsetWidth / 2, 0)}px`
		);
	};

	// Methods

	const getCharacterStyles = memoize((shouldBeOn: boolean, index: number, char?: string) => {
		return [
			isKanji(char) && 'important-red',
			mode === EditingMode.Correction &&
				index >= correctionData.beginning &&
				index <= correctionData.end &&
				'red',
			shouldBeOn &&
				(correctionStep === CorrectionStep.FixTimings &&
				index >= correctionData.beginning &&
				index <= correctionData.end
					? 'green'
					: 'white')
		]
			.filter((a): a is string => typeof a === 'string')
			.join(' ');
	});

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

	// Handlers

	const handleFrame = () => {
		if (!times) return;
		const time = player.getCurrentTime();
		if (
			mode === EditingMode.Correction &&
			onCount === correctionData.beginning &&
			time < times[correctionData.end + 1]
		) {
			return;
		}
		// Go back in time if seeked backwards
		if (onCount > 0) {
			while (times[onCount - 1] > time) {
				onCount--;
			}
		}
		while (times[onCount] <= time) {
			onCount++;
		}
		if (
			mode === EditingMode.Correction &&
			correctionStep === CorrectionStep.FixTimings &&
			onCount > correctionData.end
		) {
			state.update((state) => ({
				...state,
				mode: EditingMode.Playback,
				currentInstruction: 'Correction done!'
			}));
		}
	};

	const handleFixTimingsClick = () => {
		player.pause();
		$state = {
			mode: EditingMode.Correction,
			correctionStep: CorrectionStep.SelectStartPoint,
			correctionData: {
				beginning: 99999,
				end: 0
			},
			currentInstruction: 'Select the beginning of the incorrect segment'
		};
	};

	const handleCharClick = (i: number, j: number, e?: MouseEvent) => {
		switch (mode) {
			case EditingMode.Uninitialized:
				if (furiganaInputProps.visible) {
					const { i: fi, j: fj } = furiganaInputProps;
					if (i === fi && j === fj) {
						furiganaInputProps = {
							visible: false
						};
					}
					return;
				}

				const char = text[i][j];
				if (isKanji(typeof char === 'string' ? char : char[0])) {
					if (!e?.target) {
						return;
					}
					furiganaInputProps = {
						visible: true,
						i,
						j,
						charRef: e.target as HTMLSpanElement
					};
				}
				break;
			case EditingMode.Playback:
				if (!times) return;
				player.seek(times[i]);
				break;
			case EditingMode.Transcription:
				if (!times) return;
				break;
			case EditingMode.Correction:
				if (!times) return;
				switch (correctionStep) {
					case CorrectionStep.SelectStartPoint:
						state.update((state) => ({
							...state,
							correctionData: {
								beginning: i,
								end: i
							},
							currentInstruction: 'Select the end of the incorrect segment',
							correctionStep: CorrectionStep.SelectEndPoint
						}));
						break;
					case CorrectionStep.SelectEndPoint:
						correctionData.end = i;
						player.seek(Math.max(times[correctionData.beginning] - 5 * player.playbackRate, 0));
						player.play();

						let countdown = 5;
						state.update((state) => ({
							...state,
							currentInstruction: `Begin transcribing in ${countdown--}...`
						}));

						let _handle = window.setInterval(() => {
							state.update((state) => ({
								...state,
								currentInstruction: `Begin transcribing in ${countdown}...`
							}));
							if (countdown-- === 0) {
								state.update((state) => ({
									...state,
									currentInstruction: 'Transcribe!'
								}));
								window.clearInterval(_handle);
							}
						}, 1000);

						state.update((state) => ({
							...state,
							correctionStep: CorrectionStep.FixTimings
						}));
						break;
					case CorrectionStep.FixTimings:
						state.update((state) => ({
							...state,
							mode: EditingMode.Playback
						}));
						break;
				}
				break;
		}
	};

	const handleCharHover = (i: number) => {
		if (mode !== EditingMode.Correction || !times) {
			return;
		}

		switch (correctionStep) {
			case CorrectionStep.SelectStartPoint: {
				state.update((state) => ({
					...state,
					currentInstruction: displayTime(times[i])
				}));
				break;
			}
			case CorrectionStep.SelectEndPoint: {
				state.update((state) => ({
					...state,
					correctionData: {
						...state.correctionData,
						end: Math.max(correctionData.beginning, i)
					},
					currentInstruction: displayTime(times[correctionData.beginning], times[i])
				}));
				break;
			}
			case CorrectionStep.FixTimings:
				break;
		}
	};

	const handleSongSelect = (e: Event & { currentTarget: HTMLSelectElement }) => {
		window.location.pathname = e.currentTarget.value;
	};

	const handleSpacebarClick = () => {
		switch (mode) {
			case EditingMode.Uninitialized:
				break;
			case EditingMode.Playback:
				break;
			case EditingMode.Transcription:
				const time = +player.getCurrentTime().toFixed(2);
				editingTimes.push(time);

				onCount++;
				if (
					editingTimes.length ===
					(timeSteps.at(-1)?.at(-1) ?? 0) + (text.at(-1)?.at(-1)?.length ?? 0)
				) {
					fetch(`/${videoId}`, {
						method: 'PATCH',
						body: JSON.stringify({
							videoId,
							song: {
								times: editingTimes
							}
						}),
						headers: {
							'Content-Type': 'application/json'
						}
					});
					$state.mode = EditingMode.Uninitialized;
				}
				break;
			case EditingMode.Correction:
				switch (correctionStep) {
					case CorrectionStep.SelectStartPoint:
						break;
					case CorrectionStep.SelectEndPoint:
						break;
					case CorrectionStep.FixTimings:
						if (onCount >= correctionData.beginning && onCount <= correctionData.end) {
							onCount++;
						}
						break;
				}
				break;
		}
	};

	const handleFuriganaInputEnter = (value: string) => {
		const { visible } = furiganaInputProps;
		if (!visible) {
			return;
		}

		const { i, j } = furiganaInputProps;
		const oldChar = text[i][j];

		if (typeof oldChar === 'string') {
			if (!value) return;
			text[i][j] = [oldChar, value];
		} else {
			if (!value) {
				text[i][j] = oldChar[0];
			} else {
				text[i][j] = [oldChar[0], value];
			}
		}

		fetch(`/${videoId}`, {
			method: 'PATCH',
			body: JSON.stringify({
				videoId,
				song: {
					text
				}
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		furiganaInputProps = {
			visible: false
		};
	};

	const handleStartTranscriptionClick = () => {
		$state.mode = EditingMode.Transcription;
	};

	// Lifecycle methods

	onMount(() => {
		window.addEventListener('keydown', (event) => {
			if (event.key === ' ') {
				event.preventDefault();
				handleSpacebarClick();
			}
		});
		window.addEventListener('beforeunload', () => {
			localStorage.setItem('current_time', player.getCurrentTime().toFixed(2));
		});
		return () => stopRender();
	});

	onDestroy(() => {
		if (browser) {
			localStorage.setItem('current_time', player.getCurrentTime().toFixed(2));
		}
	});

	// Dynamic values

	$: timeSteps = text
		.map((line) => line.filter((char) => typeof char === 'object' || !/\s/.test(char)))
		.map((line, i) =>
			line.map(
				(_, j) =>
					text
						.slice(0, i)
						.reduce(
							(acc, line) =>
								acc +
								line.reduce(
									(acc, char) => acc + (typeof char === 'string' ? 1 : char[1].length),
									0
								),
							0
						) +
					line
						.slice(0, j)
						.reduce((acc, char) => acc + (typeof char === 'string' ? 1 : char[1].length), 0)
			)
		);

	$: {
		if (playerDiv) {
			player = new YoutubePlayerPlus(playerDiv, {
				// relatedVideos: false,
				width: 640,
				height: 390
			});
			player.load(data.song.videoId, true);
			const playingCallback = () => {
				player.seek(+(localStorage.getItem('current_time') || 0));
				player.removeListener('playing', playingCallback);
			};
			player.addListener('playing', playingCallback);
			player.addListener('ended', () => {
				localStorage.removeItem('current_time');
			});
			player.setPlaybackRate(1);
			if (times) {
				startRender();
				$state.mode = EditingMode.Playback;
			}
		}
	}

	$: furiganaStyles = getFuriganaStyles(furiganaInputProps);

	$: console.log({ text, timeSteps });
	$: console.log($state);
	$: console.log(furiganaInputProps);
</script>

<header>カラオケ</header>
<input
	class="furigana-input"
	style={furiganaStyles}
	on:change={(e) => {
		handleFuriganaInputEnter(e.currentTarget.value);
		e.currentTarget.value = '';
	}}
	value={furiganaInputProps.visible &&
	typeof text[furiganaInputProps.i][furiganaInputProps.j] === 'object'
		? text[furiganaInputProps.i][furiganaInputProps.j][1]
		: ''}
/>
<main class="flex">
	<p id="text">
		{#each text as line, i}
			<div>
				{#each line as char, j}
					{#if typeof char === 'string'}
						{#if /\s/.test(char)}
							{char}
						{:else}
							<span
								class={[
									'character',
									getCharacterStyles(onCount > timeSteps[i][j], timeSteps[i][j], char)
								].join(' ')}
								on:click={(e) => handleCharClick(i, j, e)}
								on:mouseenter={() => handleCharHover(timeSteps[i][j])}
							>
								{char}
							</span>
						{/if}
					{:else}
						<ruby>
							<span
								class={[
									'character',
									getCharacterStyles(onCount > timeSteps[i][j], timeSteps[i][j])
								].join(' ')}
								on:click={(e) => handleCharClick(i, j, e)}
								on:mouseenter={() => handleCharHover(timeSteps[i][j])}
							>
								{char[0]}
							</span>
							<rt>
								{#each char[1].split('') as penis, k}
									<span
										class={getCharacterStyles(onCount > timeSteps[i][j] + k, timeSteps[i][j] + k)}
										on:click={() => handleCharClick(i, j + k)}
										on:mouseenter={() => handleCharHover(timeSteps[i][j] + k)}
									>
										{penis}
									</span>
								{/each}
							</rt>
						</ruby>
					{/if}
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
				<button id="record" type="button" on:click={handleStartTranscriptionClick}
					>Start transcription</button
				>
				<button id="replay" type="button" disabled>Start lyrics</button>
				<button id="correct" type="button" disabled={!times} on:click={handleFixTimingsClick}>
					Correct timings
				</button>
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
		width: fit-content;
		margin: 10px;
	}

	@media (min-width: 800px) {
		#aside {
			position: sticky;
			top: 52px;
			height: fit-content;
		}
	}

	@media (max-width: 800px) {
		.flex {
			flex-direction: column;
		}
	}

	.character {
		display: inline;
	}

	.furigana-input {
		font-size: 1.5em;
		position: absolute;
		text-align: center;
		width: 120px;
	}

	.red {
		color: red;
	}

	span.important-red {
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
	}
</style>
