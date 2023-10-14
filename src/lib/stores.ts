import { writable } from 'svelte/store';

export enum EditingMode {
	Uninitialized,
	Playback,
	Transcription,
	Correction
}

export enum CorrectionStep {
	SelectStartPoint,
	SelectEndPoint,
	FixTimings
}

export interface State {
	mode: EditingMode;
	correctionStep: CorrectionStep;
	correctionData: {
		beginning: number;
		end: number;
	};
	currentInstruction: string;
}

export const state = writable<State>({
	mode: EditingMode.Uninitialized,
	correctionStep: CorrectionStep.SelectStartPoint,
	correctionData: {
		beginning: 99999,
		end: 0
	},
	currentInstruction: ''
});
