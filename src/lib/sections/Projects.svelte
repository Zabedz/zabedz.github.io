<script lang="ts">
	import { onMount } from 'svelte';
	import type { Project } from '#lib/content/schema.ts';
	import order from '#lib/content/order.ts';
	import { projects } from '#lib/content/projects/index.ts';
	import { carousel, type Carousel } from '#lib/motion/carousel.ts';
	import { prefersReducedMotion } from '#lib/motion/index.ts';
	import ProjectSlide from '#lib/components/ProjectSlide.svelte';
	import StepButton from '#lib/components/StepButton.svelte';
	import Words from '#lib/components/Words.svelte';

	const shown = order.flatMap((slug) => projects[slug] ?? []);
	const name = (project: Project | undefined) => project?.label ?? project?.title ?? '';

	let bar = $state<HTMLElement>();
	let track = $state<HTMLElement>();
	let stage = $state<HTMLElement>();
	let index = $state<HTMLElement>();
	let active = $state(0);
	let announcement = $state('');
	// Charts draw when their slide becomes current, but only once the section has been on screen.
	let seen = $state(false);
	// The index marks a current project only once the carousel can change it.
	let mounted = $state(false);
	let nav: Carousel | undefined;

	const at = (i: number) => shown[(i + shown.length) % shown.length];

	onMount(() => {
		if (!track) return;
		let ready = false;
		nav = carousel(track, (i) => {
			active = i;
			centerChip(i);
			if (ready) announcement = `Project ${i + 1} of ${shown.length}: ${shown[i]?.title}`;
		});
		ready = true;
		mounted = true;
		// A margin, since a tall track on a short screen never reaches a visible ratio.
		const io = new IntersectionObserver(
			([entry]) => {
				if (!entry?.isIntersecting) return;
				seen = true;
				io.disconnect();
			},
			{ rootMargin: '0px 0px -30% 0px' }
		);
		io.observe(track);

		// The side arrows center on the shortest slide, so they hold still as the track resizes.
		const slides = [...track.children] as HTMLElement[];
		let railFrame = 0;
		const fitRails = () => {
			railFrame = 0;
			const shortest = Math.min(...slides.map((slide) => slide.offsetHeight));
			if (shortest > 0) stage?.style.setProperty('--rail-h', `${shortest}px`);
		};
		// Deferred a frame, as in carousel.ts, to stay clear of WebKit's ResizeObserver loop error.
		const sizes = new ResizeObserver(() => {
			railFrame ||= requestAnimationFrame(fitRails);
		});
		for (const slide of slides) sizes.observe(slide);

		return () => {
			nav?.destroy();
			io.disconnect();
			cancelAnimationFrame(railFrame);
			sizes.disconnect();
		};
	});

	function centerChip(i: number) {
		const chip = index?.children[i] as HTMLElement | undefined;
		if (!index || !chip || index.scrollWidth <= index.clientWidth) return;
		index.scrollTo({
			left: chip.offsetLeft - (index.clientWidth - chip.offsetWidth) / 2,
			behavior: prefersReducedMotion.current ? 'instant' : 'smooth'
		});
	}

	/**
	 * Runs a move. With `align`, brings the slide's top back under the bar if the reader had
	 * scrolled down; the side arrows skip it so they stay under the pointer.
	 */
	function move(change: (nav: Carousel) => void, align = true) {
		if (!nav || !track || !bar) return;
		change(nav);
		const gap = track.getBoundingClientRect().top - bar.getBoundingClientRect().bottom;
		if (align && gap < 0) {
			window.scrollBy({ top: gap, behavior: prefersReducedMotion.current ? 'instant' : 'smooth' });
		}
	}

	function choose(event: MouseEvent, i: number) {
		if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
			return;
		}
		event.preventDefault();
		move((n) => n.go(i));
	}

	function onkeydown(event: KeyboardEvent, align = true) {
		if (event.key === 'ArrowLeft') move((n) => n.step(-1), align);
		else if (event.key === 'ArrowRight') move((n) => n.step(1), align);
		else return;
		event.preventDefault();
		// Focus follows the current name, which centerChip has scrolled into view.
		if (index?.contains(event.target as Node)) {
			index.children[active]?.querySelector('a')?.focus({ preventScroll: true });
		}
	}
</script>

{#snippet arrow(direction: 'prev' | 'next', large = false)}
	{@const by = direction === 'prev' ? -1 : 1}
	<StepButton
		{direction}
		{large}
		label="{direction === 'prev' ? 'Previous' : 'Next'} project: {name(at(active + by))}"
		onclick={() => move((n) => n.step(by), !large)}
	/>
{/snippet}

<section
	id="projects"
	class="projects"
	data-seen={seen ? '' : undefined}
	tabindex="-1"
	aria-labelledby="projects-title"
	aria-roledescription="carousel"
>
	<header class="wrap head">
		<h2 id="projects-title"><Words text="Projects" /></h2>
	</header>

	<div class="bar" bind:this={bar}>
		<!-- Arrow keys from the links and buttons inside bubble here. -->
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div class="wrap controls" role="group" aria-label="Choose a project" {onkeydown}>
			<ul class="index" bind:this={index}>
				{#each shown as project, i (project.slug)}
					<li>
						<a
							href="#project-{project.slug}"
							aria-current={mounted && i === active ? 'true' : undefined}
							onclick={(event) => choose(event, i)}>{name(project)}</a
						>
					</li>
				{/each}
			</ul>
			<div class="stepper">
				{@render arrow('prev')}
				<p class="count" aria-hidden="true">{active + 1} / {shown.length}</p>
				{@render arrow('next')}
			</div>
		</div>
	</div>

	<div class="stage" bind:this={stage}>
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div
			class="rails"
			role="group"
			aria-label="Previous and next project"
			onkeydown={(event) => onkeydown(event, false)}
		>
			<div class="rail prev">{@render arrow('prev', true)}</div>
			<div class="rail next">{@render arrow('next', true)}</div>
		</div>
		<!-- tabindex: Firefox otherwise makes the scroller its own unnamed tab stop. -->
		<div class="track" tabindex="-1" bind:this={track}>
			{#each shown as project (project.slug)}
				<ProjectSlide {project} />
			{/each}
		</div>
	</div>
	<p class="visually-hidden" aria-live="polite">{announcement}</p>
</section>

<style>
	.projects {
		--bar-h: 3.75rem;
		/* Width of the large StepButton. */
		--arrow: 4rem;
		/* From 48rem each arrow sits in a column beside the slides, which narrow to make room. */
		--rail: calc(var(--arrow) + 2 * var(--space-2));
		--inner: min(100% - 2 * var(--rail), var(--page));
		padding-block-start: var(--space-5);
		border-block-start: 1px solid var(--rule);
	}

	h2 {
		font-size: var(--step-4);
		font-stretch: 75%;
		font-weight: 700;
		line-height: 0.92;
	}

	.bar {
		position: sticky;
		inset-block-start: var(--nav-h);
		z-index: 5;
		margin-block-start: var(--space-3);
		background: color-mix(in srgb, var(--paper) 94%, transparent);
		backdrop-filter: blur(12px) saturate(1.4);
		border-block: 1px solid var(--rule);
	}

	.controls {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		min-block-size: var(--bar-h);
	}

	.index {
		position: relative;
		display: flex;
		flex: 1;
		gap: 0 var(--space-2);
		min-inline-size: 0;
		margin: 0;
		padding: 0;
		list-style: none;
		overflow-x: auto;
		scrollbar-width: none;
	}

	.index a {
		position: relative;
		display: inline-flex;
		align-items: center;
		min-block-size: 2.75rem;
		padding-inline: 0.25rem;
		white-space: nowrap;
		font-size: var(--step--1);
		color: var(--ink-2);
		text-decoration: none;
	}

	/* The scrolling list clips anything drawn outside it. */
	.index a:focus-visible {
		outline-offset: -2px;
	}

	.index a::after {
		content: '';
		position: absolute;
		inset-inline: 0.25rem;
		inset-block-end: 0.375rem;
		block-size: 2px;
		background: var(--accent);
		scale: 0 1;
		transform-origin: left center;
		transition: scale var(--dur) var(--ease-spring);
	}

	.index [aria-current='true'] {
		color: var(--ink);
	}

	.index [aria-current='true']::after {
		scale: 1 1;
	}

	@media (hover: hover) {
		.index a:hover {
			color: var(--ink);
		}
	}

	/* Fades the end edge while more names sit offscreen; inactive, so no fade, when they fit. */
	@supports (animation-timeline: scroll()) {
		.index {
			animation: edge linear both;
			animation-timeline: scroll(self inline);
		}
	}

	@keyframes edge {
		from,
		95% {
			mask-image: linear-gradient(to left, transparent, #000 2.5rem);
		}

		to {
			mask-image: none;
		}
	}

	.stepper {
		display: flex;
		flex: none;
		align-items: center;
		gap: var(--space-1);
	}

	.count {
		min-inline-size: 4.5ch;
		text-align: center;
		font-size: var(--step--1);
		color: var(--ink-2);
	}

	/* Positioned so absolutely placed descendants (visually hidden text) clip with the slides. */
	.track {
		position: relative;
		display: flex;
		align-items: flex-start;
		overflow-x: auto;
		overflow-y: hidden;
		overscroll-behavior-x: contain;
		scroll-snap-type: x mandatory;
		scrollbar-width: none;
	}

	/* Fragment jumps and focus scrolling land below the sticky bar. */
	.track > :global(.slide),
	.track :global(:is(a, button, summary, [tabindex='0'])) {
		scroll-margin-block-start: calc(var(--bar-h) + var(--space-2));
	}

	/* Without JS the buttons do nothing; the name links still scroll the track. */
	:global(html:not([data-hydrated])) :is(.stepper, .rails) {
		visibility: hidden;
	}

	.stage {
		position: relative;
	}

	.rails {
		display: none;
		position: absolute;
		inset: 0;
		z-index: 4;
		pointer-events: none;
	}

	/* As tall as the shortest slide (--rail-h, set on mount), with the arrow at its middle. */
	.rail {
		position: absolute;
		inset-block-start: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		inline-size: var(--rail);
		block-size: var(--rail-h, 100%);
	}

	.rail.prev {
		inset-inline-start: calc((100% - var(--inner)) / 2 - var(--rail));
	}

	.rail.next {
		inset-inline-end: calc((100% - var(--inner)) / 2 - var(--rail));
	}

	.rail > :global(.arrow) {
		pointer-events: auto;
	}

	@media (width >= 48rem) {
		.bar > .wrap,
		.track > :global(.slide > .wrap) {
			inline-size: var(--inner);
		}

		.rails {
			display: block;
		}

		.stepper > :global(.arrow) {
			display: none;
		}
	}

	/* Phones: the names take their own row above the stepper. */
	@media (width < 30rem) {
		.projects {
			--bar-h: 6.5rem;
		}

		.controls {
			flex-wrap: wrap;
			row-gap: 0;
		}

		.index {
			flex: 1 0 100%;
		}

		.stepper {
			margin-inline-start: auto;
		}
	}

	/* Before hydration, keeps later slides' figures from lazy-loading ahead of first paint. */
	.track:not(:has(> :global(.slide[data-current]))) > :global(.slide + .slide .figure) {
		content-visibility: auto;
		contain-intrinsic-size: auto 20rem;
	}
</style>
