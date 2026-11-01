<script lang="ts">
	import { onMount } from 'svelte';
	import type { ImageRef, Project, Visual as VisualData } from '#lib/content/schema.ts';
	import { isArchived, lastUpdated } from '#lib/content/github.ts';
	import { carousel, type Carousel } from '#lib/motion/carousel.ts';
	import { chartTable } from './charts/table.ts';
	import DataTable from './charts/DataTable.svelte';
	import LinkList from './LinkList.svelte';
	import LinkedText from './LinkedText.svelte';
	import Picture from './Picture.svelte';
	import StatList from './StatList.svelte';
	import StatusBadge from './StatusBadge.svelte';
	import StepButton from './StepButton.svelte';
	import Visual from './Visual.svelte';

	let { project }: { project: Project } = $props();

	type Figure = { visual: VisualData } | { image: ImageRef };

	// Figure column: half the page from 64rem, capped by the page width.
	const SIZES = '(min-width: 80rem) 44rem, (min-width: 64rem) 55vw, 100vw';

	const id = $derived(`project-${project.slug}`);
	const links = $derived(project.links ?? []);
	const figures = $derived<Figure[]>([
		...(project.visual ? [{ visual: project.visual }] : []),
		...(project.gallery ?? []).map((image) => ({ image }))
	]);

	let strip = $state<HTMLElement>();
	let shown = $state(0);
	let figuresNav: Carousel | undefined;

	onMount(() => {
		if (!strip || figures.length < 2) return;
		figuresNav = carousel(strip, (i) => (shown = i));
		return () => figuresNav?.destroy();
	});

	function onkeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowLeft') figuresNav?.step(-1);
		else if (event.key === 'ArrowRight') figuresNav?.step(1);
		else return;
		event.preventDefault();
	}
</script>

<article class="slide" {id} aria-roledescription="slide" aria-labelledby="{id}-title">
	<div class="wrap grid">
		<div class="text">
			<StatusBadge
				status={project.status}
				updated={lastUpdated(project.repo)}
				archived={isArchived(project.repo)}
			/>
			<h3 id="{id}-title">{project.title}</h3>
			<p class="pitch">{project.pitch}</p>
			<p><LinkedText text={project.summary} links={project.summaryLinks} /></p>
			{#if project.credit}<p class="muted">{project.credit}</p>{/if}
			{#if project.status !== 'complete' && project.statusNote}
				<p class="muted"><strong>Status.</strong> {project.statusNote}</p>
			{/if}
			<ul class="highlights">
				{#each project.highlights as highlight, i (i)}<li>{highlight}</li>{/each}
			</ul>
			<p class="stack">
				<span class="visually-hidden">Built with: </span>{project.stack.join(', ')}
			</p>
			<LinkList {links} />
		</div>

		<div class="media">
			{#if project.stats?.length}<StatList stats={project.stats} />{/if}
			{#if figures.length}
				<!-- A scrolling region must take focus so keyboard users can scroll it (axe scrollable-region-focusable). -->
				<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
				<div
					class="figures"
					bind:this={strip}
					tabindex={figures.length > 1 ? 0 : undefined}
					role="region"
					aria-label="Figures for {project.title}"
				>
					{#each figures as figure, i (i)}
						<div class="figure">
							{#if 'visual' in figure}
								<Visual visual={figure.visual} sizes={SIZES} />
								{#if figure.visual.type === 'chart'}
									{@const chart = figure.visual.chart}
									<DataTable label="{chart.title}, data" {...chartTable(chart)} />
								{/if}
							{:else}
								<Picture image={figure.image} sizes={SIZES} />
							{/if}
						</div>
					{/each}
				</div>
				{#if figures.length > 1}
					<!-- Arrow keys from the buttons inside bubble here. -->
					<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
					<div class="figure-nav" role="group" aria-label="Figures" {onkeydown}>
						<StepButton
							small
							direction="prev"
							label="Previous figure"
							onclick={() => figuresNav?.step(-1)}
						/>
						<p class="count" aria-live="polite">
							<span class="visually-hidden">Figure {shown + 1} of {figures.length}</span>
							<span aria-hidden="true">{shown + 1} / {figures.length}</span>
						</p>
						<StepButton
							small
							direction="next"
							label="Next figure"
							onclick={() => figuresNav?.step(1)}
						/>
					</div>
				{/if}
			{/if}
		</div>
	</div>
</article>

<style>
	.slide {
		flex: 0 0 100%;
		min-inline-size: 0;
		padding-block: var(--space-4) var(--space-5);
		scroll-snap-align: start;
		scroll-snap-stop: always;
	}

	.grid {
		display: grid;
		gap: var(--space-4);
	}

	.text {
		display: grid;
		gap: var(--space-2);
		align-content: start;
		max-inline-size: var(--measure);
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

	.muted {
		color: var(--ink-2);
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

	.media {
		display: grid;
		gap: var(--space-3);
		align-content: start;
		min-inline-size: 0;
	}

	/* Positioned for the same reason as the project track: hidden text clips with its figure. */
	.figures {
		position: relative;
		display: flex;
		align-items: flex-start;
		overflow-x: auto;
		overflow-y: hidden;
		overscroll-behavior-x: contain;
		scroll-snap-type: x mandatory;
		scrollbar-width: none;
		border-radius: var(--radius);
	}

	/* The padding keeps focus rings inside the clipped strip. */
	.figure {
		flex: 0 0 100%;
		min-inline-size: 0;
		display: grid;
		gap: var(--space-1);
		padding: 0.25rem;
		scroll-snap-align: start;
		scroll-snap-stop: always;
	}

	/* Tall screenshots letterbox so one figure never outgrows the screen. */
	.figure :global(img) {
		max-block-size: min(65svh, 36rem);
		object-fit: contain;
	}

	.figure-nav {
		display: flex;
		align-items: center;
		gap: var(--space-1);
	}

	/* Without JS the buttons do nothing; the strip still scrolls. */
	:global(html:not([data-hydrated])) .figure-nav {
		visibility: hidden;
	}

	.count {
		min-inline-size: 3.5ch;
		text-align: center;
		font-size: var(--step--1);
		color: var(--ink-2);
	}

	@media (min-width: 64rem) {
		.grid {
			grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
			gap: var(--space-5);
		}
	}
</style>
