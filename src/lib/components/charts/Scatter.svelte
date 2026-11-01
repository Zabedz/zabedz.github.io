<script lang="ts">
	import type { ScatterChart } from '#lib/content/schema.ts';
	import { extent, formatValue } from './format.ts';

	let { chart }: { chart: ScatterChart } = $props();

	const W = 400;
	const H = 280;
	const PAD = 8;

	const xs = $derived(
		extent([...chart.points.map((p) => p[0]), ...(chart.threshold ? [chart.threshold.x] : [])])
	);
	const ys = $derived(extent(chart.points.map((p) => p[1])));

	const sx = (x: number) => PAD + ((x - xs[0]) / (xs[1] - xs[0])) * (W - 2 * PAD);
	const sy = (y: number) => H - PAD - ((y - ys[0]) / (ys[1] - ys[0])) * (H - 2 * PAD);
</script>

<figure class="chart scatter">
	<figcaption>{chart.title}</figcaption>
	<div class="plot">
		<p class="y-label">{chart.yLabel}</p>
		<div class="y-ticks">
			<span>{formatValue(ys[1])}</span><span>{formatValue(ys[0])}</span>
		</div>
		<svg viewBox="0 0 {W} {H}" aria-hidden="true" focusable="false">
			<line class="axis" x1="0" y1={H} x2={W} y2={H} />
			<line class="axis" x1="0" y1="0" x2="0" y2={H} />
			{#if chart.threshold}
				<line
					class="threshold"
					x1={sx(chart.threshold.x)}
					x2={sx(chart.threshold.x)}
					y1="0"
					y2={H}
				/>
			{/if}
			{#each chart.points as [x, y], i (i)}
				<circle class="mark" cx={sx(x)} cy={sy(y)} r="4">
					<title>{chart.xLabel} {formatValue(x)}, {chart.yLabel} {formatValue(y)}</title>
				</circle>
			{/each}
		</svg>
		<div class="x-ticks">
			<span>{formatValue(xs[0])}</span><span>{formatValue(xs[1])}</span>
		</div>
		<p class="x-label">{chart.xLabel}</p>
	</div>
	{#if chart.threshold}
		<p class="note">
			<span class="dash" aria-hidden="true"></span>{chart.threshold.label} ({formatValue(
				chart.threshold.x
			)})
		</p>
	{/if}
	{#if chart.note}<p class="note">{chart.note}</p>{/if}
</figure>

<style>
	.chart {
		display: grid;
		gap: var(--space-2);
	}

	figcaption {
		font-weight: 650;
	}

	.plot {
		display: grid;
		grid-template-columns: auto 1fr;
		grid-template-areas: 'ylabel ylabel' 'yticks svg' '. xticks' '. xlabel';
		gap: 0.25rem var(--space-1);
		font-size: 0.75rem;
		color: var(--ink-2);
	}

	.y-label {
		grid-area: ylabel;
	}

	.y-ticks {
		grid-area: yticks;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		text-align: end;
	}

	svg {
		grid-area: svg;
		inline-size: 100%;
		block-size: auto;
		overflow: visible;
	}

	.x-ticks {
		grid-area: xticks;
		display: flex;
		justify-content: space-between;
	}

	.x-label {
		grid-area: xlabel;
		text-align: center;
	}

	.axis {
		stroke: var(--ink-2);
		stroke-width: 1;
	}

	.threshold {
		stroke: var(--ink-2);
		stroke-width: 1.5;
		stroke-dasharray: 6 4;
	}

	.mark {
		fill: var(--series-1);
		fill-opacity: 0.85;
		stroke: var(--paper);
		stroke-width: 2;
	}

	.note {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		font-size: var(--step--1);
		color: var(--ink-2);
	}

	.dash {
		inline-size: 1.5rem;
		border-block-start: 1.5px dashed var(--ink-2);
	}
</style>
