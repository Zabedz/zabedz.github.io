<script lang="ts">
	import type { Project } from '#lib/content/schema.ts';
	import { isArchived, lastUpdated } from '#lib/content/github.ts';
	import { imageInfo, shape, type Shape } from '#lib/content/images.ts';
	import site from '#lib/content/site.ts';
	import { chartTable } from './charts/table.ts';
	import DataTable from './charts/DataTable.svelte';
	import LinkList from './LinkList.svelte';
	import Picture from './Picture.svelte';
	import StatList from './StatList.svelte';
	import StatusBadge from './StatusBadge.svelte';
	import Visual from './Visual.svelte';

	let { project, featured = false }: { project: Project; featured?: boolean } = $props();

	// Mirrors the .gallery grid: wide spans the row, landscape half, tall a third.
	const GALLERY_SIZES: Record<Shape, string> = {
		wide: '(min-width: 80rem) 75rem, 100vw',
		landscape: '(min-width: 64rem) 37rem, (min-width: 40rem) 50vw, 100vw',
		tall: '(min-width: 64rem) 24rem, (min-width: 40rem) 50vw, 100vw'
	};

	function galleryShape(src: string): Shape {
		const info = imageInfo(src);
		return info ? shape(info) : 'wide';
	}

	const id = $derived(`project-${project.slug}`);
	const owner = $derived(project.repo.split('/')[0]);
	const collaboration = $derived(owner !== site.owner);
	const links = $derived(project.links ?? []);
	// Rendered below the pinned stage so its focusable controls never sit under a stuck stage.
	const chart = $derived(project.visual?.type === 'chart' ? project.visual.chart : undefined);
</script>

<article class="project" class:featured {id} aria-labelledby="{id}-title">
	<div class="track">
		<div class="stage wrap">
			<div class="intro">
				<StatusBadge
					status={project.status}
					updated={lastUpdated(project.repo)}
					archived={isArchived(project.repo)}
				/>
				<h3 id="{id}-title">{project.title}</h3>
				<p class="pitch">{project.pitch}</p>
				{#if collaboration}
					<p class="collab">Team project in {project.repo}</p>
				{/if}
				{#if project.stats?.length}<StatList stats={project.stats} />{/if}
			</div>
			{#if project.visual}
				<div class="visual">
					<Visual visual={project.visual} sizes="(min-width: 64rem) 44rem, 100vw" />
				</div>
			{/if}
		</div>
	</div>

	<div class="detail wrap">
		<div class="prose">
			<p>{project.summary}</p>
			{#if project.team}<p><strong>Team.</strong> {project.team}</p>{/if}
			{#if project.role}<p><strong>My part.</strong> {project.role}</p>{/if}
			{#if project.credit}<p class="muted">{project.credit}</p>{/if}
			{#if project.status !== 'complete' && project.statusNote}
				<p class="muted"><strong>Status.</strong> {project.statusNote}</p>
			{/if}
		</div>
		<div class="facts">
			<ul class="highlights">
				{#each project.highlights as highlight, i (i)}<li>{highlight}</li>{/each}
			</ul>
			<p class="stack">
				<span class="visually-hidden">Built with: </span>{project.stack.join(', ')}
			</p>
			<LinkList {links} />
		</div>
		{#if chart}
			<div class="table">
				<DataTable label="{chart.title}, data" {...chartTable(chart)} />
			</div>
		{/if}
		{#if project.gallery?.length}
			<div class="gallery">
				{#each project.gallery as image, i (i)}
					<Picture {image} sizes={GALLERY_SIZES[galleryShape(image.src)]} />
				{/each}
			</div>
		{/if}
	</div>
</article>

<style>
	.project {
		display: grid;
		gap: var(--space-4);
		padding-block: var(--space-5);
		border-block-start: 1px solid var(--rule);
	}

	.stage {
		display: grid;
		gap: var(--space-4);
		align-items: center;
	}

	.intro {
		display: grid;
		gap: var(--space-2);
		align-content: start;
	}

	h3 {
		font-size: var(--step-3);
		font-stretch: 80%;
		font-weight: 700;
	}

	.pitch {
		font-size: var(--step-1);
		line-height: 1.4;
		max-inline-size: 36ch;
	}

	.collab,
	.muted {
		color: var(--ink-2);
	}

	.visual {
		min-inline-size: 0;
	}

	.detail {
		display: grid;
		gap: var(--space-4);
	}

	.prose {
		display: grid;
		gap: var(--space-2);
		align-content: start;
		max-inline-size: var(--measure);
	}

	.facts {
		display: grid;
		gap: var(--space-2);
		align-content: start;
		max-inline-size: var(--measure);
	}

	.highlights {
		display: grid;
		gap: var(--space-1);
		padding-inline-start: 1.1em;
	}

	.highlights li::marker {
		color: var(--accent);
	}

	.stack {
		font-size: var(--step--1);
		color: var(--ink-2);
	}

	.gallery {
		display: grid;
		gap: var(--space-4) var(--space-3);
		align-items: start;
	}

	@media (min-width: 40rem) {
		.gallery {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.gallery > :global([data-shape='wide']) {
			grid-column: 1 / -1;
		}
	}

	@media (min-width: 64rem) {
		.stage {
			grid-template-columns: 5fr 7fr;
			gap: var(--space-5);
		}

		.stage:not(:has(.visual)) {
			grid-template-columns: minmax(0, 7fr) 5fr;
		}

		.detail {
			grid-template-columns: 1fr 1fr;
			column-gap: var(--space-5);
		}

		.table {
			grid-column: 1 / -1;
		}

		.gallery {
			grid-column: 1 / -1;
			grid-template-columns: repeat(6, minmax(0, 1fr));
		}

		.gallery > :global([data-shape='landscape']) {
			grid-column: span 3;
		}

		.gallery > :global([data-shape='tall']) {
			grid-column: span 2;
		}
	}

	/* Pinned scene: the stage sticks below the nav while the track scrolls past. */
	@supports (animation-timeline: view()) {
		@media (prefers-reduced-motion: no-preference) and (min-width: 64rem) and (min-height: 40rem) {
			.featured {
				padding-block-start: 0;
			}

			.featured .track {
				block-size: 200svh;
				view-timeline: --scene block;
			}

			.featured .stage {
				position: sticky;
				inset-block-start: var(--nav-h);
				min-block-size: calc(100svh - var(--nav-h));
				overflow-x: clip;
				padding-block: var(--space-4);
			}

			.featured .intro > :global(*) {
				animation: -global-scene-rise linear both;
				animation-timeline: --scene;
				animation-range: entry 40% contain 15%;
			}

			.featured .visual {
				animation: -global-scene-settle linear both;
				animation-timeline: --scene;
				animation-range: entry 30% contain 20%;
			}

			.featured .intro :global(.stat) {
				animation: -global-scene-rise linear both;
				animation-timeline: --scene;
				animation-range: contain 5% contain 30%;
			}

			.featured .visual :global(.step) {
				animation: -global-step-on linear both;
				animation-timeline: --scene;
			}

			.featured .visual :global(.step[data-i='0']) {
				animation-range: contain 10% contain 18%;
			}

			.featured .visual :global(.step[data-i='1']) {
				animation-range: contain 18% contain 26%;
			}

			.featured .visual :global(.step[data-i='2']) {
				animation-range: contain 26% contain 34%;
			}

			.featured .visual :global(.step[data-i='3']) {
				animation-range: contain 34% contain 42%;
			}

			.featured .visual :global(.step[data-i='4']) {
				animation-range: contain 42% contain 50%;
			}

			.featured .visual :global(.step[data-i='5']) {
				animation-range: contain 50% contain 58%;
			}

			.featured .visual :global(.step[data-i='6']) {
				animation-range: contain 58% contain 66%;
			}

			.featured .visual :global(.step:nth-child(n + 8)) {
				animation-range: contain 66% contain 74%;
			}

			.featured .visual :global(.lines .mark),
			.featured .visual :global(.bars .mark),
			.featured .visual :global(.scatter .mark) {
				animation: -global-mark-in linear both;
				animation-timeline: --scene;
				animation-range: contain 10% contain 60%;
			}
		}
	}

	@keyframes -global-scene-rise {
		from {
			opacity: 0;
			transform: translateY(1.5rem);
		}
	}

	@keyframes -global-scene-settle {
		from {
			opacity: 0.3;
			transform: scale(1.06);
		}
	}

	@keyframes -global-step-on {
		from {
			opacity: 0.3;
		}
	}

	@keyframes -global-mark-in {
		from {
			opacity: 0.15;
		}
	}
</style>
