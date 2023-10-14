import { describe, expect, it } from 'vitest';

describe('sum test', () => {
	it('adds 1 + 2 to equal 3', () => {
		expect(1 + 2).toBe(3);
		expect(2 + 1).toBe(3);
		expect(1 + 1 + 1).toBe(3);
	});
});
