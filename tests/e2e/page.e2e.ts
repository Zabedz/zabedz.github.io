import AxeBuilder from '@axe-core/playwright';
import order from '../../src/lib/content/order.ts';
import { expect, test } from './fixtures';

const SECTIONS = ['about', 'projects'];

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
	const [id, label] = ['projects', 'Projects'];
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
		expect(await page.evaluate(scrollAnimations)).toBeGreaterThan(order.length);
	});
}

test('reduced motion turns scroll motion off', async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/');
	expect(await page.evaluate(scrollAnimations)).toBe(0);
});

const current = (page: import('@playwright/test').Page) =>
	page.locator('#projects .slide:not([inert])');

for (const reducedMotion of ['no-preference', 'reduce'] as const) {
	test(`carousel steps and wraps (${reducedMotion})`, async ({ page }) => {
		const [first, second] = order;
		const last = order.at(-1);
		test.skip(!first || !second || !last, 'needs two projects');
		if (!first || !second || !last) return;
		await page.emulateMedia({ reducedMotion });
		await page.goto('/');
		await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });

		await expect(current(page)).toHaveCount(1);
		await expect(current(page)).toHaveAttribute('id', `project-${first}`);

		const next = page.getByRole('button', { name: /^Next project/ });
		await next.click();
		await expect(current(page)).toHaveAttribute('id', `project-${second}`);
		const title = await page.locator(`#project-${second} h3`).textContent();
		await expect(page.getByText(`Project 2 of ${order.length}: ${title}`)).toBeAttached();
		await expect
			.poll(() =>
				page
					.locator(`#project-${second}`)
					.evaluate((el) => Math.round(el.getBoundingClientRect().left))
			)
			.toBe(0);

		const prev = page.getByRole('button', { name: /^Previous project/ });
		await prev.click();
		await prev.click();
		await expect(current(page)).toHaveAttribute('id', `project-${last}`);
		await next.click();
		await expect(current(page)).toHaveAttribute('id', `project-${first}`);

		const chip = page.locator(`#projects a[href="#project-${last}"]`);
		await chip.click();
		await expect(current(page)).toHaveAttribute('id', `project-${last}`);
		await expect(chip).toHaveAttribute('aria-current', 'true');

		await next.focus();
		await page.keyboard.press('ArrowRight');
		await expect(current(page)).toHaveAttribute('id', `project-${first}`);
	});
}

const settled = (page: import('@playwright/test').Page) =>
	expect
		.poll(() => current(page).evaluate((el) => Math.round(el.getBoundingClientRect().left)))
		.toBe(0);

test('rapid moves end on the last one, aligned', async ({ page }) => {
	await page.goto('/');
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
	const prev = page.getByRole('button', { name: /^Previous project/ });
	await prev.scrollIntoViewIfNeeded();
	const box = await prev.boundingBox();
	if (!box) throw new Error('Previous project button has no box');
	for (let i = 0; i < 3; i++) {
		await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
		await page.waitForTimeout(40);
	}
	await expect(current(page)).toHaveAttribute('id', `project-${order.at(-3)}`);
	await settled(page);

	const first = page.locator(`#projects a[href="#project-${order[0]}"]`);
	await first.click();
	await expect(current(page)).toHaveAttribute('id', `project-${order[0]}`);
	// WebKit does not focus a link on click.
	await first.focus();
	await page.keyboard.press('ArrowLeft');
	await page.keyboard.press('ArrowLeft');
	await expect(current(page)).toHaveAttribute('id', `project-${order.at(-2)}`);
	await settled(page);

	await page.getByRole('button', { name: /^Next project/ }).click();
	await page.locator(`#projects a[href="#project-${order[3]}"]`).click();
	await expect(current(page)).toHaveAttribute('id', `project-${order[3]}`);
	await settled(page);
});

test('arrow keys on a project name move focus with the current project', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 800 });
	await page.goto('/');
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
	await page.locator(`#projects a[href="#project-${order[0]}"]`).focus();
	for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowRight');
	const focused = page.locator(`#projects a[href="#project-${order[3]}"]`);
	await expect(focused).toBeFocused();
	await expect(focused).toBeInViewport();
});

test('resizing after a move keeps one aligned current slide', async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto('/');
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
	const next = page.getByRole('button', { name: /^Next project/ });
	for (let i = 0; i < 3; i++) await next.click();
	await settled(page);
	await page.setViewportSize({ width: 800, height: 900 });
	await expect(current(page)).toHaveAttribute('id', `project-${order[3]}`);
	await settled(page);
});

test('the track is as tall as the current slide', async ({ page }) => {
	await page.goto('/');
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
	const heights = () =>
		page.evaluate(() => {
			const track = document.querySelector<HTMLElement>('#projects .track');
			const slide = document.querySelector<HTMLElement>('#projects .slide:not([inert])');
			return [track?.offsetHeight, slide?.offsetHeight];
		});
	const [track, slide] = await heights();
	expect(track).toBe(slide);
	await page.getByRole('button', { name: /^Next project/ }).click();
	await expect.poll(async () => new Set(await heights()).size).toBe(1);
});

test('a project link opens its slide', async ({ page }) => {
	const target = order[3] ?? order.at(-1);
	test.skip(!target, 'no projects');
	if (!target) return;
	await page.goto(`/#project-${target}`);
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
	await expect(current(page)).toHaveAttribute('id', `project-${target}`);
	await expect(page.locator(`#project-${target}`)).toBeInViewport();
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

test.describe('without JS', () => {
	test.use({ javaScriptEnabled: false });

	test('project names reach every slide and the buttons stay hidden', async ({ page }) => {
		const target = order.at(-1);
		test.skip(!target, 'no projects');
		await page.goto('/');
		await expect(page.locator('#projects .stepper')).toBeHidden();
		await expect(page.locator('#projects [aria-current]')).toHaveCount(0);
		await page.locator(`#projects a[href="#project-${target}"]`).click();
		await expect(page.locator(`#project-${target}`)).toBeInViewport();
	});
});
