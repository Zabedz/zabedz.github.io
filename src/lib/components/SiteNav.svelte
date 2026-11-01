<script lang="ts">
	import { onMount } from 'svelte';
	import { jump, observeSections } from '#lib/motion/index.ts';
	import { trackProgress } from '#lib/motion/progress.ts';

	interface Props {
		name: string;
		sections: { id: string; label: string }[];
		/** Observed for the active link but not listed, like the hero. */
		unlisted: string[];
	}

	let { name, sections, unlisted }: Props = $props();
	let active = $state('');
	let bar = $state<HTMLElement>();

	onMount(() => {
		const stopSections = observeSections(
			[...unlisted, ...sections.map((s) => s.id)],
			(id) => (active = id)
		);
		const stopProgress = bar ? trackProgress(bar) : undefined;
		return () => {
			stopSections();
			stopProgress?.();
		};
	});
</script>

<header class="site-nav">
	<nav class="wrap" aria-label="Sections">
		<a class="brand" href="#top" onclick={jump}>{name}</a>
		<ul>
			{#each sections as section (section.id)}
				<li>
					<a
						href="#{section.id}"
						onclick={jump}
						aria-current={active === section.id ? 'true' : undefined}>{section.label}</a
					>
				</li>
			{/each}
		</ul>
	</nav>
	<span class="progress" aria-hidden="true" bind:this={bar}></span>
</header>

<style>
	.site-nav {
		position: fixed;
		inset: 0 0 auto;
		z-index: 10;
		block-size: var(--nav-h);
		padding-inline: env(safe-area-inset-left) env(safe-area-inset-right);
		background: color-mix(in srgb, var(--paper) 94%, transparent);
		backdrop-filter: blur(12px) saturate(1.4);
		border-block-end: 1px solid var(--rule);
		view-transition-name: site-nav;
	}

	nav {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		block-size: 100%;
	}

	a {
		position: relative;
		color: var(--ink-2);
		text-decoration: none;
		transition: color var(--dur-fast) var(--ease-out);
		font-size: var(--step--1);
		display: inline-flex;
		align-items: center;
		min-block-size: 2.75rem;
		white-space: nowrap;
		padding-inline: 0.25rem;
	}

	/* The scrolling list clips anything drawn outside it. */
	a:focus-visible {
		outline-offset: -2px;
	}

	.brand {
		display: none;
		color: var(--ink);
		font-weight: 650;
		font-stretch: 85%;
		font-size: var(--step-0);
		margin-inline-end: auto;
	}

	ul {
		display: flex;
		gap: clamp(0rem, -0.5rem + 2vw, 1.25rem);
		list-style: none;
		margin: 0;
		padding: 0;
		overflow-x: auto;
		scrollbar-width: none;
		inline-size: 100%;
		justify-content: flex-end;
	}

	ul a::after {
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

	[aria-current='true'] {
		color: var(--ink);
	}

	[aria-current='true']::after {
		scale: 1 1;
	}

	@media (hover: hover) {
		a:hover {
			color: var(--ink);
		}

		ul a:hover::after {
			scale: 1 1;
		}
	}

	/* Page progress along the bottom edge, filled by trackProgress. */
	.progress {
		position: absolute;
		inset: auto 0 -1px;
		block-size: 2px;
		background: var(--accent);
		transform-origin: left center;
		scale: 0 1;
	}

	@media (prefers-reduced-motion: reduce) {
		.progress {
			visibility: hidden;
		}
	}

	/* Fades the end edge while more links sit offscreen. The timeline is inactive, so no
	 * fade, when the list fits. */
	@supports (animation-timeline: scroll()) {
		ul {
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

	@media (min-width: 40rem) {
		.brand {
			display: inline-flex;
		}

		ul {
			inline-size: auto;
		}
	}
</style>
