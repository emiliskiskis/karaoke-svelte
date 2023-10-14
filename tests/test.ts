import { expect, test } from '@playwright/test';

test('index page has 稲葉曇『ラグトレイン』', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('link', { name: '稲葉曇『ラグトレイン』' })).toBeVisible();
});
