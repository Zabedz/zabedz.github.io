import AxeBuilder from '@axe-core/playwright';
import chapters from '../../src/lib/content/chapters.ts';
import { expect, test } from './fixtures';

const SECTIONS = [...chapters.map((c) => c.id), 'about'];
// A chapter below the first, so the jump has to scroll.
const TARGET = chapters.at(1) ?? chapters[0];

test('renders every section with its nav link', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
	const nav = page.getByRole('navigation', { name: 'Sections' });
	for (const id of SECTIONS) {
		await expect(page.locator(`section#${id}`)).toHaveCount(1);
		await expect(nav.locator(`a[href="#${id}"]`)).toHaveCount(1);
	}
});

test('nav jump lands below the header, moves focus, and back returns', async ({ page }) => {
	test.skip(!TARGET, 'no chapters');
	if (!TARGET) return;
	const { id, label } = TARGET;
	await page.goto('/');
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
	await page
		.getByRole('navigation', { name: 'Sections' })
		.getByRole('link', { name: label, exact: true })
		.click();
	await expect(page).toHaveURL(new RegExp(`#${id}$`));
	await expect(page.locator(`#${id}`)).toBeFocused();

	const navBottom = await page
		.locator('.site-nav')
		.evaluate((el) => el.getBoundingClientRect().bottom);
	const top = await page.locator(`#${id}`).evaluate((el) => el.getBoundingClientRect().top);
	expect(Math.abs(top - navBottom)).toBeLessThan(4);
	await expect(page.locator(`a[href="#${id}"]`)).toHaveAttribute('aria-current', 'true');

	await page.goBack();
	await expect(page).toHaveURL(/\/$/);
	await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(10);
});

for (const colorScheme of ['light', 'dark'] as const) {
	test(`has no axe violations in ${colorScheme} mode`, async ({ page }) => {
		await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
		await page.goto('/');
		await page
			.locator('details')
			.evaluateAll((all) => all.forEach((d) => ((d as HTMLDetailsElement).open = true)));
		const results = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
			.analyze();
		expect(
			results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' ')}`)
		).toEqual([]);
	});
}

test('reduced motion flattens every scene', async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/');
	const tall = await page
		.locator('.featured .track')
		.evaluateAll(
			(tracks) =>
				tracks.filter((t) => t.getBoundingClientRect().height > window.innerHeight * 1.5).length
		);
	expect(tall).toBe(0);
});

test('every image loads', async ({ page }) => {
	await page.goto('/');
	await page.evaluate(async () => {
		for (const img of document.querySelectorAll('img')) img.loading = 'eager';
		await Promise.all([...document.images].map((img) => img.decode().catch(() => undefined)));
	});
	const broken = await page
		.locator('img')
		.evaluateAll((imgs) =>
			(imgs as HTMLImageElement[])
				.filter((img) => img.naturalWidth === 0)
				.map((img) => img.currentSrc || img.src)
		);
	expect(broken).toEqual([]);
});
