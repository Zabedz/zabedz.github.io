<script lang="ts">
	import type { BarChart } from '#lib/content/schema.ts';
	import { extent, formatValue } from './format.ts';

	let { chart }: { chart: BarChart } = $props();

	const domain = $derived(
		extent(
			chart.series.flatMap((s) => s.values),
			true
		)
	);
	const span = $derived(domain[1] - domain[0]);
	const zero = $derived((-domain[0] / span) * 100);

	function bar(value: number): { x: number; width: number } {
		const width = (Math.abs(value) / span) * 100;
		return { x: value >= 0 ? zero : zero - width, width };
	}
</script>

<figure class="chart bars">
	<figcaption>{chart.title}</figcaption>
	<ul class="legend">
		{#each chart.series as series, s (s)}
			<li><span class="swatch" data-series={s}></span>{series.label}</li>
		{/each}
	</ul>
	<div class="rows">
		{#each chart.categories as category, c (c)}
			<div class="row">
				<span class="category">{category}</span>
				<svg class="track" aria-hidden="true" focusable="false">
					<line class="zero" x1="{zero}%" x2="{zero}%" y1="0" y2="100%" />
					{#each chart.series as series, s (s)}
						{@const value = series.values[c] ?? 0}
						{@const b = bar(value)}
						<rect
							class="mark"
							data-series={s}
							data-neg={value < 0 ? '' : undefined}
							x="{b.x}%"
							y={s * 12 + 2}
							width="{b.width}%"
							height="10"
							rx="2"
						>
							<title>{series.label}, {category}: {formatValue(value, chart.format)}</title>
						</rect>
					{/each}
				</svg>
			</div>
		{/each}
	</div>
	<p class="axis">
		<span>{formatValue(domain[0], chart.format)}</span>
		<span>{formatValue(domain[1], chart.format)}</span>
	</p>
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

	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		list-style: none;
		margin: 0;
		padding: 0;
		font-size: var(--step--1);
		color: var(--ink-2);
	}

	.legend li {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
	}

	.swatch {
		inline-size: 0.75rem;
		block-size: 0.75rem;
		border-radius: 2px;
		background: var(--series-1);
	}

	.swatch[data-series='1'] {
		background: var(--series-2);
	}

	.rows {
		display: grid;
		gap: var(--space-1);
	}

	.row {
		display: grid;
		grid-template-columns: minmax(6rem, 30%) 1fr;
		align-items: center;
		gap: var(--space-2);
	}

	.category {
		font-size: var(--step--1);
		overflow-wrap: anywhere;
	}

	.track {
		inline-size: 100%;
		block-size: 26px;
		overflow: visible;
	}

	.zero {
		stroke: var(--ink-2);
		stroke-width: 1;
	}

	.mark {
		fill: var(--series-1);
	}

	.mark[data-series='1'] {
		fill: var(--series-2);
	}

	.axis {
		display: flex;
		justify-content: space-between;
		padding-inline-start: calc(max(6rem, 30%) + var(--space-2));
		font-size: var(--step--1);
		color: var(--ink-2);
	}

	.note {
		font-size: var(--step--1);
		color: var(--ink-2);
	}
</style>
