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

for (const width of [320, 1440, 2560]) {
	test(`name stays on one line at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 900 });
		await page.goto('/');
		const h1 = page.getByRole('heading', { level: 1 });
		const { height, fontSize, overflow } = await h1.evaluate((el) => ({
			height: el.getBoundingClientRect().height,
			fontSize: parseFloat(getComputedStyle(el).fontSize),
			overflow: el.scrollWidth - el.clientWidth
		}));
		expect(height).toBeLessThan(fontSize * 1.5);
		expect(overflow).toBeLessThanOrEqual(0);
	});
}

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

// Svelte scopes keyframes per component, so a name can silently point at nothing.
test('every animation names a defined keyframe', async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto('/');
	const missing = await page.evaluate(() => {
		const defined = new Set<string>();
		const walk = (rules: CSSRuleList) => {
			for (const rule of rules) {
				if (rule instanceof CSSKeyframesRule) defined.add(rule.name);
				else if ('cssRules' in rule) walk((rule as CSSGroupingRule).cssRules);
			}
		};
		for (const sheet of document.styleSheets) walk(sheet.cssRules);
		const used = new Set<string>();
		for (const el of document.querySelectorAll('*')) {
			for (const pseudo of [null, '::before', '::after']) {
				for (const name of getComputedStyle(el, pseudo).animationName.split(',')) {
					if (name.trim() !== 'none') used.add(name.trim());
				}
			}
		}
		return [...used].filter((name) => !defined.has(name));
	});
	expect(missing).toEqual([]);
});

const scrollAnimations = () =>
	document.getAnimations().filter((a) => a.timeline && !(a.timeline instanceof DocumentTimeline))
		.length;

for (const width of [1440, 390]) {
	test(`scroll animations run at ${width}px`, async ({ page, browserName }) => {
		test.skip(browserName !== 'chromium', 'scroll timeline support differs by engine version');
		await page.setViewportSize({ width, height: 900 });
		await page.goto('/');
		expect(await page.evaluate(scrollAnimations)).toBeGreaterThan(20);
	});
}

for (const [width, height] of [
	[1024, 640],
	[1280, 720],
	[1366, 768]
] as const) {
	test(`pinned stages fit the screen at ${width}x${height}`, async ({ page }) => {
		await page.setViewportSize({ width, height });
		await page.goto('/');
		// offsetHeight: the stage's own animations scale its bounding box.
		const over = await page.evaluate(() => {
			const avail =
				innerHeight - (document.querySelector<HTMLElement>('.site-nav')?.offsetHeight ?? 0);
			return [...document.querySelectorAll<HTMLElement>('.featured .stage')]
				.filter((s) => getComputedStyle(s).position === 'sticky' && s.offsetHeight > avail + 1)
				.map((s) => `${s.parentElement?.parentElement?.id}: ${s.offsetHeight} > ${avail}`);
		});
		expect(over).toEqual([]);
	});
}

test('reduced motion flattens every scene', async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/');
	expect(await page.evaluate(scrollAnimations)).toBe(0);
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
