import { expect, test } from './fixtures';

const WIDTHS = [320, 768, 1440, 2560];

for (const width of WIDTHS) {
	test(`no horizontal overflow at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 900 });
		await page.goto('/');
		const overflow = await page.evaluate(
			() => document.documentElement.scrollWidth - window.innerWidth
		);
		expect(overflow).toBeLessThanOrEqual(0);
	});
}

// Review screenshots in test-results/; nothing is compared against a baseline.
for (const width of [320, 768, 1440]) {
	for (const colorScheme of ['light', 'dark'] as const) {
		for (const reducedMotion of ['no-preference', 'reduce'] as const) {
			test(`screenshot ${width} ${colorScheme} ${reducedMotion}`, async ({
				page,
				browserName
			}, info) => {
				test.skip(browserName !== 'chromium', 'screenshots come from one engine');
				await page.setViewportSize({ width, height: 900 });
				await page.emulateMedia({ colorScheme, reducedMotion });
				await page.goto('/');
				await page.evaluate(async () => {
					const images = [...document.images];
					for (const img of images) img.loading = 'eager';
					await Promise.all([document.fonts.ready, ...images.map((img) => img.decode())]);
				});
				await page.screenshot({
					path: info.outputPath(`page-${width}-${colorScheme}-${reducedMotion}.png`),
					fullPage: true
				});
			});
		}
	}
}
