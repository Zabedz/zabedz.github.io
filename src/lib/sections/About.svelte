<script lang="ts">
	import type { Site } from '#lib/content/schema.ts';
	import Words from '#lib/components/Words.svelte';

	let { site }: { site: Site } = $props();
</script>

<section id="about" class="about" tabindex="-1" aria-labelledby="about-title">
	<div class="wrap grid">
		<h2 id="about-title"><Words text="About" /></h2>
		<div class="body">
			{#each site.about as paragraph, i (i)}<p>{paragraph}</p>{/each}
		</div>
	</div>
</section>

<style>
	.about {
		padding-block: var(--space-5);
		border-block-start: 1px solid var(--rule);
	}

	.grid {
		display: grid;
		gap: var(--space-3);
	}

	h2 {
		font-size: var(--step-4);
		font-stretch: 75%;
		font-weight: 700;
		line-height: 0.92;
	}

	.body {
		display: grid;
		gap: var(--space-2);
		max-inline-size: var(--measure);
		font-size: var(--step-1);
		line-height: 1.5;
	}

	@media (min-width: 64rem) {
		.grid {
			grid-template-columns: 5fr 7fr;
			gap: var(--space-5);
		}
	}
</style>
