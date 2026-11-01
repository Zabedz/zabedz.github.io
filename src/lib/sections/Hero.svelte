<script lang="ts">
	import type { Site } from '#lib/content/schema.ts';
	import LinkList from '#lib/components/LinkList.svelte';

	let { site }: { site: Site } = $props();

	// Decorative reliability curve: [stated confidence, accuracy], drifting under the diagonal.
	const POINTS: [number, number][] = [
		[0.15, 0.17],
		[0.3, 0.31],
		[0.45, 0.44],
		[0.6, 0.55],
		[0.75, 0.63],
		[0.9, 0.7],
		[0.99, 0.74]
	];
</script>

<section id="top" class="hero" tabindex="-1" aria-labelledby="hero-title">
	<svg class="curve" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
		<line x1="0" y1="100" x2="100" y2="0" />
		{#each POINTS as [x, y], i (x)}
			<g class="drop" data-i={i}>
				<circle cx={x * 100} cy={100 - y * 100} r={i === POINTS.length - 1 ? 2.4 : 1.3} />
			</g>
		{/each}
	</svg>
	<div class="wrap text">
		<h1 id="hero-title">{site.name}</h1>
		<p class="headline">{site.headline}</p>
		<LinkList links={site.links} />
	</div>
</section>

<style>
	.hero {
		position: relative;
		display: grid;
		align-items: end;
		min-block-size: 100svh;
		padding-block: calc(var(--nav-h) + var(--space-4)) var(--space-5);
		overflow: clip;
	}

	.text {
		position: relative;
		display: grid;
		gap: var(--space-3);
	}

	/* One line at every width: 16vw keeps the name inside a 320px screen. */
	h1 {
		font-size: min(var(--step-4), 16vw);
		font-stretch: 75%;
		font-weight: 700;
		line-height: 0.88;
		letter-spacing: -0.01em;
		white-space: nowrap;
	}

	.headline {
		font-size: var(--step-1);
		line-height: 1.35;
		color: var(--ink-2);
		max-inline-size: 34ch;
	}

	.curve {
		position: absolute;
		inset-block-start: calc(var(--nav-h) + var(--space-3));
		inset-inline-end: var(--gutter);
		inline-size: min(70vw, 34rem);
		overflow: visible;
	}

	line {
		stroke: var(--rule);
		stroke-width: 0.6;
		stroke-dasharray: 1.5 1.5;
	}

	circle {
		fill: var(--series-1);
	}

	.drop:last-child circle {
		fill: var(--series-2);
	}

	/*
	 * Load: the name and headline rise into place at full opacity (the headline is the LCP
	 * element), the links fade in after them, and the diagonal grows before the dots settle.
	 */
	@media (prefers-reduced-motion: no-preference) {
		h1 {
			animation: lift 900ms var(--ease-spring) both;
		}

		.headline {
			animation: lift 800ms var(--ease-spring) 80ms both;
		}

		.text > :global(.links) {
			animation: fade-up 600ms var(--ease-out) 260ms both;
		}

		line {
			transform-box: fill-box;
			transform-origin: 0 100%;
			animation: grow 900ms var(--ease-out) both;
		}

		.drop {
			animation: settle 900ms var(--ease-out) 300ms both;
		}

		/* Lift equals (confidence - accuracy) in viewBox units, so each dot starts on the line. */
		.drop[data-i='3'] {
			--lift: 5px;
		}

		.drop[data-i='4'] {
			--lift: 12px;
		}

		.drop[data-i='5'] {
			--lift: 20px;
		}

		.drop[data-i='6'] {
			--lift: 25px;
		}

		/* Scroll: the text recedes and the chart drifts up a little slower than the page. */
		@supports (animation-timeline: view()) and (animation-range: 0% 100%) {
			.text {
				animation: fade-out linear both;
				animation-timeline: view();
				animation-range: exit 0% exit 80%;
			}

			.curve {
				animation: drift linear both;
				animation-timeline: scroll(root);
				animation-range: 0 100svh;
			}
		}
	}

	@keyframes lift {
		from {
			translate: 0 0.35em;
		}
	}

	@keyframes fade-up {
		from {
			opacity: 0;
			translate: 0 0.75rem;
		}
	}

	@keyframes grow {
		from {
			scale: 0;
		}
	}

	@keyframes drift {
		to {
			translate: 0 -8vh;
		}
	}

	@keyframes settle {
		from {
			transform: translateY(calc(-1 * var(--lift, 0px)));
		}
	}

	@keyframes fade-out {
		to {
			opacity: 0;
			scale: 0.96;
			translate: 0 -2rem;
		}
	}
</style>
