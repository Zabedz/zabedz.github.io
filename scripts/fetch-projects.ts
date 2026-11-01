/**
 * Fetch public metadata for every project listed in order.ts into
 * src/lib/content/generated/github.json. Hidden drafts are skipped, so their repos may be private.
 * GITHUB_TOKEN is optional; without it the unauthenticated limit (60 requests an hour) applies.
 */
import { readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { RepoMeta } from '../src/lib/content/github.ts';
import order from '../src/lib/content/order.ts';
import type { Project } from '../src/lib/content/schema.ts';

const PROJECTS = 'src/lib/content/projects';
const OUT = 'src/lib/content/generated/github.json';
const API = 'https://api.github.com';

interface RepoResponse {
	private: boolean;
	archived: boolean;
	pushed_at: string;
}

const headers: Record<string, string> = {
	Accept: 'application/vnd.github+json',
	'X-GitHub-Api-Version': '2022-11-28'
};
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

const listed = new Set(order);
const files = readdirSync(PROJECTS).filter((f) => f.endsWith('.ts') && f !== 'index.ts');
const repos = new Set<string>();
for (const file of files) {
	const mod = (await import(pathToFileURL(resolve(join(PROJECTS, file))).href)) as {
		default: Project;
	};
	if (listed.has(mod.default.slug)) repos.add(mod.default.repo);
}

const out: Record<string, RepoMeta> = {};
for (const repo of [...repos].sort()) {
	const res = await fetch(`${API}/repos/${repo}`, { headers });
	if (res.status === 404)
		throw new Error(`${repo}: not found or private; remove it from ${PROJECTS}`);
	if (!res.ok) throw new Error(`${repo}: GitHub API ${res.status} ${await res.text()}`);
	const body = (await res.json()) as RepoResponse;
	if (body.private) throw new Error(`${repo}: repository is private`);
	if (typeof body.pushed_at !== 'string' || Number.isNaN(Date.parse(body.pushed_at))) {
		throw new Error(`${repo}: bad pushed_at ${JSON.stringify(body.pushed_at)}`);
	}
	out[repo] = {
		pushedAt: body.pushed_at,
		archived: body.archived === true
	};
}

writeFileSync(OUT, JSON.stringify(out, null, '\t') + '\n');
console.log(`${Object.keys(out).length} repos in ${OUT}`);
