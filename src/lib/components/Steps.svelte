<script lang="ts">
	import type { Step } from '#lib/content/schema.ts';

	let { title, steps }: { title: string; steps: Step[] } = $props();
</script>

<figure class="steps">
	<figcaption>{title}</figcaption>
	<ol>
		{#each steps as step, i (i)}
			<li class="step" data-i={i}>
				<span class="title">{step.title}</span>
				{#if step.detail}<span class="detail">{step.detail}</span>{/if}
			</li>
		{/each}
	</ol>
</figure>

<style>
	.steps {
		display: grid;
		gap: var(--space-2);
	}

	figcaption {
		font-size: var(--step--1);
		color: var(--ink-2);
	}

	ol {
		display: grid;
		list-style: none;
		margin: 0;
		padding: 0;
		counter-reset: step;
	}

	.step {
		position: relative;
		display: grid;
		gap: 0.125rem;
		padding-block: 0 var(--space-2);
		padding-inline-start: 2.75rem;
		counter-increment: step;
	}

	/* Number in a ring, joined to the next step by a rule. */
	.step::before {
		content: counter(step);
		position: absolute;
		inset-inline-start: 0;
		inset-block-start: 0;
		display: grid;
		place-items: center;
		inline-size: 1.75rem;
		block-size: 1.75rem;
		border: 1.5px solid var(--series-1);
		border-radius: 50%;
		font-size: var(--step--1);
		font-weight: 650;
		background: var(--paper);
	}

	.step:not(:last-child)::after {
		content: '';
		position: absolute;
		inset-inline-start: calc(0.875rem - 0.75px);
		inset-block: 1.75rem 0;
		border-inline-start: 1.5px solid var(--rule);
	}

	.title {
		font-weight: 650;
		line-height: 1.75rem;
	}

	.detail {
		color: var(--ink-2);
		font-size: var(--step--1);
		line-height: 1.45;
	}
</style>
