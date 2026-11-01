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

	h1 {
		font-size: var(--step-4);
		font-stretch: 75%;
		font-weight: 700;
		line-height: 0.88;
		letter-spacing: -0.01em;
		max-inline-size: 9ch;
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

	@media (prefers-reduced-motion: no-preference) {
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

		@supports (animation-timeline: view()) {
			.text {
				animation: fade-out linear both;
				animation-timeline: view();
				animation-range: exit 0% exit 80%;
			}
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
			transform: translateY(-2rem);
		}
	}
</style>
