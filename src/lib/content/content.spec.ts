import { existsSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { imageInfo } from './images.ts';
import order from './order.ts';
import { projects } from './projects/index.ts';
import type { ImageRef, Project, Visual } from './schema.ts';
import site from './site.ts';

const files = import.meta.glob<{ default: Project }>(['./projects/*.ts', '!./projects/index.ts'], {
	eager: true
});

// Paths already taken on the shared origin by other Pages sites.
const TAKEN = ['resume', 'chess-editor', 'dissertation', 'fiscal-till'];

// A count of tests or spec files says nothing about the work; say what a test proves instead.
const TEST_COUNT =
	/\b\d[\d,]*\s+(?:[\w-]+\s+){0,2}(?:tests|test (?:files|functions|cases)|specs|spec files)\b/i;
// Plural only: 'Test balanced accuracy' is a held-out score.
const TEST_STAT = /\b(?:tests|specs|spec files|test (?:files|functions|cases))\b/i;

const BANNED_WORDS =
	/\b(delve|tapestry|boast|leverag|seamless|robust|realm|landscape|underscore|testament|navigat|elevat|pivotal|intricate|meticulous|showcas|foster|embark|synerg|harness|streamline|utili[sz]|comprehensive|notably|crucial|vital(ly)?\b|groundbreaking|transformative|innovative|cutting-edge|bespoke|garner|bolster|myriad|plethora|nuanced|holistic|profound|invaluable|unparalleled|adept|ever-evolving|unlock|empower|revolutioni[sz]|paramount|facilitat|endeavo|poised|nestled|renowned|captivating|moreover|furthermore|additionally|consequently|arguably|undoubtedly|essentially|powerful|game-changing|effortless|world-class|state-of-the-art|unleash|supercharg|intuitive|versatile|firstly|secondly|thirdly|ultimately|from scratch|hand-built|built by hand|single author|sole author)/i;

function strings(value: unknown): string[] {
	if (typeof value === 'string') return [value];
	if (Array.isArray(value)) return value.flatMap(strings);
	if (value && typeof value === 'object') return Object.values(value).flatMap(strings);
	return [];
}

function images(project: Project): ImageRef[] {
	const visual = project.visual?.type === 'image' ? [project.visual.image] : [];
	return [...visual, ...(project.gallery ?? [])];
}

function chartLengths(visual: Visual | undefined): string[] {
	if (visual?.type !== 'chart') return [];
	const { chart } = visual;
	if (chart.kind === 'bars') {
		return chart.series
			.filter((s) => s.values.length !== chart.categories.length)
			.map((s) => `${s.label}: ${s.values.length} values, ${chart.categories.length} categories`);
	}
	if (chart.kind === 'lines') {
		if (chart.x.length < 2) return ['lines needs at least 2 x labels'];
		return chart.panels
			.filter((p) => p.values.length !== chart.x.length)
			.map((p) => `${p.label}: ${p.values.length} values, ${chart.x.length} x labels`);
	}
	return chart.points.length ? [] : ['scatter has no points'];
}

describe('order', () => {
	it('lists existing projects, once each', () => {
		expect(order.length).toBeGreaterThan(0);
		expect(order.filter((s) => !projects[s])).toEqual([]);
		expect(new Set(order).size).toBe(order.length);
	});

	it('leaves the section ids free', () => {
		const repos = Object.values(projects).map((p) => p.repo.split('/')[1]?.toLowerCase());
		const taken = new Set([...TAKEN, ...repos]);
		expect(['top', 'about', 'projects', 'main'].filter((id) => taken.has(id))).toEqual([]);
	});
});

describe('static paths', () => {
	it('do not collide with other Pages sites on the origin', () => {
		const repos = Object.values(projects).map((p) => p.repo.split('/')[1]?.toLowerCase());
		const taken = new Set([...TAKEN, ...repos]);
		expect(readdirSync('static').filter((name) => taken.has(name.toLowerCase()))).toEqual([]);
	});
});

describe.each(Object.entries(files))('%s', (path, { default: project }) => {
	it('slug matches the file name', () => {
		expect(path).toBe(`./projects/${project.slug}.ts`);
	});

	it('has the required shape', () => {
		expect(project.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
		expect(project.repo).toMatch(/^[\w.-]+\/[\w.-]+$/);
		expect(project.highlights.length).toBeGreaterThanOrEqual(2);
		expect(project.highlights.length).toBeLessThanOrEqual(4);
		expect(project.stats?.length ?? 0).toBeLessThanOrEqual(4);
		expect(project.stack.length).toBeGreaterThan(0);
		if (project.status !== 'complete')
			expect(project.statusNote?.trim(), 'statusNote').toBeTruthy();
	});

	// Both collect failures so a project without links or images still makes one assertion.
	it('links to https URLs only', () => {
		const links = [...(project.links ?? []), ...(project.summaryLinks ?? [])];
		const insecure = links.filter((l) => new URL(l.href).protocol !== 'https:');
		expect(insecure.map((l) => l.href)).toEqual([]);
	});

	it('links only phrases the summary contains', () => {
		const missing = (project.summaryLinks ?? []).filter((l) => !project.summary.includes(l.label));
		expect(missing.map((l) => l.label)).toEqual([]);
	});

	it('has encoded images with alt text', () => {
		const problems: string[] = [];
		const name = new RegExp(`^${project.slug}/[a-z0-9-]+$`);
		for (const image of images(project)) {
			if (image.alt.trim().length <= 10) problems.push(`${image.src}: alt text too short`);
			for (const src of [image.src, image.dark].filter((s) => s !== undefined)) {
				if (!name.test(src)) problems.push(`${src}: not lowercase <slug>/<name>`);
				if (!imageInfo(src)) problems.push(`${src}: not encoded; run pnpm images`);
				const exists = ['png', 'jpg', 'jpeg'].some((ext) =>
					existsSync(`assets/projects/${src}.${ext}`)
				);
				if (!exists) problems.push(`assets/projects/${src}.png missing`);
			}
		}
		expect(problems).toEqual([]);
	});

	it('does not count tests', () => {
		const counts = strings(project).filter((text) => TEST_COUNT.test(text));
		const stats = (project.stats ?? []).filter((stat) => TEST_STAT.test(stat.label));
		expect([...counts, ...stats.map((s) => s.label)]).toEqual([]);
	});

	it('has charts with matching lengths', () => {
		expect(chartLengths(project.visual)).toEqual([]);
	});

	it('copy is ASCII and avoids the banned words', () => {
		for (const text of strings(project)) {
			expect(text, text).toMatch(/^[\x20-\x7E]*$/);
			expect(text, text).not.toMatch(/\s--\s/);
			expect(text.match(BANNED_WORDS)?.[0], text).toBeUndefined();
		}
	});
});

describe('site copy', () => {
	it('is ASCII and avoids the banned words', () => {
		for (const text of strings(site)) {
			expect(text, text).toMatch(/^[\x20-\x7E]*$/);
			expect(text, text).not.toMatch(/\s--\s/);
			expect(text.match(BANNED_WORDS)?.[0], text).toBeUndefined();
		}
	});
});
