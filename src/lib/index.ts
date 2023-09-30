// place files you want to import through the `$lib` alias in this folder.

export const formatTime = (timeSeconds: number) => {
	return `${Math.floor(timeSeconds / 60)}:${Math.floor(timeSeconds % 60)
		.toString()
		.padStart(2, '0')}`;
};

export const displayTime = (startTime: number, endTime?: number) => {
	let newInstruction = `Select the beginning of the incorrect segment (start: ${formatTime(
		startTime
	)}`;
	if (endTime) {
		newInstruction += `, end: ${formatTime(endTime)}`;
	}
	return newInstruction + ')';
};
