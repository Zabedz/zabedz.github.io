<script lang="ts">
	import type { Stat } from '#lib/content/schema.ts';

	let { stats }: { stats: Stat[] } = $props();
</script>

<dl class="stats">
	{#each stats as stat, i (i)}
		<div class="stat">
			<dt>{stat.label}</dt>
			<dd>{stat.value}</dd>
		</div>
	{/each}
</dl>

<style>
	.stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(8.5rem, 1fr));
		gap: var(--space-3);
	}

	.stats:has(.stat:nth-child(4)) {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	.stat {
		display: flex;
		flex-direction: column-reverse;
		justify-content: flex-end;
		gap: 0.25rem;
		padding-block-start: var(--space-1);
		border-block-start: 1px solid var(--rule);
	}

	dd {
		font-size: var(--step-2);
		font-weight: 650;
		font-stretch: 80%;
		line-height: 1;
	}

	dt {
		font-size: var(--step--1);
		color: var(--ink-2);
		line-height: 1.3;
	}
</style>
