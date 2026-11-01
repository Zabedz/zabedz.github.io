import type { Project } from '../schema';

export default {
	slug: 'tombstone',
	repo: 'Zabedz/Tombstone',
	title: 'Tombstone',
	pitch: 'A collaborative plain-text editor on an RGA CRDT in TypeScript.',
	summary:
		'Tombstone is a TypeScript monorepo built around an RGA text CRDT, with a WebSocket relay that does version-vector catch-up, a browser editor, and a visualiser that steps two replicas through a merge. Concurrent edits converge to the same text on every replica. Property tests over convergence, commutativity, causal delivery, and lost or duplicated characters are the main evidence of correctness.',
	status: 'complete',
	stack: [
		'TypeScript',
		'fast-check',
		'Vitest',
		'React',
		'Vite',
		'WebSocket (ws)',
		'pnpm workspaces',
		'Docker Compose'
	],
	highlights: [
		'The RGA is a tree: each character anchors after the one it was inserted after, siblings order by id largest first, and the text is the pre-order walk with tombstones skipped.',
		'A first-cut tombstone collector let replicas diverge ("" vs "y") by removing a deleted leaf while a concurrent insert after it was in flight. Collection now waits for a quiescent frontier.',
		'Gapless per-replica counters let a version vector name exactly which operations a peer is missing. Catch-up is property-tested over a link that drops and reorders messages.',
		'The CRDT package has no dependencies and no DOM types, ESLint blocks wrong-way imports between layers, and CI gates on typecheck, lint, unit, and property tests.'
	],
	visual: {
		type: 'image',
		image: {
			src: 'tombstone/rga-tree',
			dark: 'tombstone/rga-tree-dark',
			alt: 'An RGA tree where "h" has a deleted child "i", and "i" still anchors two children, "?" and "!". The pre-order walk skips the tombstone and reads "h?!".',
			caption: 'A tombstone keeps its place so its children survive.'
		}
	},
	gallery: [
		{
			src: 'tombstone/visualiser-merge',
			alt: 'The merge visualiser after the last step: two replicas that received the same operations in opposite orders show the same cells, d o g c, a struck-through a, and t.',
			caption: 'Opposite delivery orders, same final text.'
		},
		{
			src: 'tombstone/orphaned-insert',
			dark: 'tombstone/orphaned-insert-dark',
			alt: 'Sequence diagram of three sites. Site A collects a tombstoned leaf while site C\'s insert after it is still in flight, so the insert parks forever and A reads "" while B and C read "y".',
			caption: 'The interleaving logged in FINDINGS.md.'
		}
	],
	links: [{ label: 'Source', href: 'https://github.com/Zabedz/Tombstone' }]
} satisfies Project;
