<script lang="ts">
	import type { Visual } from '#lib/content/schema.ts';
	import Bars from './charts/Bars.svelte';
	import Lines from './charts/Lines.svelte';
	import Scatter from './charts/Scatter.svelte';
	import Picture from './Picture.svelte';
	import Steps from './Steps.svelte';

	let { visual, sizes }: { visual: Visual; sizes: string } = $props();
</script>

{#if visual.type === 'image'}
	<Picture image={visual.image} {sizes} />
{:else if visual.type === 'steps'}
	<Steps title={visual.title} steps={visual.steps} />
{:else if visual.chart.kind === 'bars'}
	<Bars chart={visual.chart} />
{:else if visual.chart.kind === 'lines'}
	<Lines chart={visual.chart} />
{:else}
	<Scatter chart={visual.chart} />
{/if}
