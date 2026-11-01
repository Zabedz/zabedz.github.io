import { existsSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import chapters from './chapters.ts';
import { imageInfo } from './images.ts';
import { projects } from './projects/index.ts';
import type { ImageRef, Project, Visual } from './schema.ts';
import site from './site.ts';

const files = import.meta.glob<{ default: Project }>(['./projects/*.ts', '!./projects/index.ts'], {
	eager: true
});

// Paths already taken on the shared origin by other Pages sites.
const TAKEN = ['resume', 'chess-editor', 'dissertation', 'fiscal-till'];

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

describe('chapters', () => {
	it('reference existing projects, once each', () => {
		const slugs = chapters.flatMap((c) => c.projects.map((p) => p.slug));
		expect(slugs.filter((s) => !projects[s])).toEqual([]);
		expect(new Set(slugs).size).toBe(slugs.length);
	});

	it('have unique ids that are not reserved', () => {
		const ids = [...chapters.map((c) => c.id), 'top', 'about', 'main'];
		expect(new Set(ids).size).toBe(ids.length);
		const repos = Object.values(projects).map((p) => p.repo.split('/')[1]?.toLowerCase());
		const reserved = new Set(['hero', ...TAKEN, ...repos]);
		expect(
			chapters.map((c) => c.id).filter((id) => reserved.has(id) || id.startsWith('project-'))
		).toEqual([]);
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
		expect(project.repo).toMatch(/^[\w.-]+\/[\w.-]+$/);
		expect(project.highlights.length).toBeGreaterThanOrEqual(2);
		expect(project.highlights.length).toBeLessThanOrEqual(4);
		expect(project.stats?.length ?? 0).toBeLessThanOrEqual(4);
		expect(project.stack.length).toBeGreaterThan(0);
		if (project.repo.split('/')[0] !== site.owner) expect(project.role).toBeTruthy();
		if (project.status !== 'complete')
			expect(project.statusNote?.trim(), 'statusNote').toBeTruthy();
	});

	it('links to https URLs only', () => {
		for (const link of project.links ?? []) expect(new URL(link.href).protocol).toBe('https:');
	});

	it('has encoded images with alt text', () => {
		for (const image of images(project)) {
			expect(image.alt.trim().length, image.src).toBeGreaterThan(10);
			for (const src of [image.src, image.dark].filter((s) => s !== undefined)) {
				expect(src, 'lowercase <slug>/<name>').toMatch(new RegExp(`^${project.slug}/[a-z0-9-]+$`));
				expect(imageInfo(src), `${src} missing; run pnpm images`).toBeDefined();
				const exists = ['png', 'jpg', 'jpeg'].some((ext) =>
					existsSync(`assets/projects/${src}.${ext}`)
				);
				expect(exists, `assets/projects/${src}.png missing`).toBe(true);
			}
		}
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
		for (const text of strings([site, chapters])) {
			expect(text, text).toMatch(/^[\x20-\x7E]*$/);
			expect(text, text).not.toMatch(/\s--\s/);
			expect(text.match(BANNED_WORDS)?.[0], text).toBeUndefined();
		}
	});
});
