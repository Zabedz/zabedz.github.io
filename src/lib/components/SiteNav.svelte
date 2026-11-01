<script lang="ts">
	import { onMount } from 'svelte';
	import { jump, observeSections } from '#lib/motion/index.ts';

	interface Props {
		name: string;
		sections: { id: string; label: string }[];
		/** Observed for the active link but not listed, like the hero. */
		unlisted: string[];
	}

	let { name, sections, unlisted }: Props = $props();
	let active = $state('');

	onMount(() =>
		observeSections([...unlisted, ...sections.map((s) => s.id)], (id) => (active = id))
	);
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
</header>

<style>
	.site-nav {
		position: fixed;
		inset: 0 0 auto;
		z-index: 10;
		block-size: var(--nav-h);
		padding-inline: env(safe-area-inset-left) env(safe-area-inset-right);
		background: color-mix(in srgb, var(--paper) 86%, transparent);
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
		color: var(--ink-2);
		text-decoration: none;
		font-size: var(--step--1);
		display: inline-flex;
		align-items: center;
		min-block-size: 2.75rem;
		white-space: nowrap;
		padding-inline: 0.375rem;
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
		justify-content: space-between;
	}

	[aria-current='true'] {
		color: var(--ink);
		box-shadow: inset 0 -2px 0 var(--accent);
	}

	@media (hover: hover) {
		a:hover {
			color: var(--ink);
		}
	}

	@media (min-width: 40rem) {
		.brand {
			display: inline-flex;
		}

		ul {
			inline-size: auto;
			justify-content: flex-end;
		}
	}
</style>
