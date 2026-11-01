<script lang="ts">
	import type { LineChart } from '#lib/content/schema.ts';
	import { extent, formatValue } from './format.ts';

	let { chart }: { chart: LineChart } = $props();

	// viewBox units; the SVG stretches to the panel, strokes stay 2px via non-scaling-stroke.
	const W = 100;
	const H = 30;

	let hover = $state<number | undefined>();

	const last = $derived(Math.max(chart.x.length - 1, 1));

	function path(values: number[]): string {
		const [lo, hi] = extent(values);
		return values
			.map(
				(v, i) =>
					`${i ? 'L' : 'M'}${((i / last) * W).toFixed(2)},${(H - ((v - lo) / (hi - lo)) * H).toFixed(2)}`
			)
			.join('');
	}

	function track(event: PointerEvent & { currentTarget: HTMLElement }): void {
		const box = event.currentTarget.getBoundingClientRect();
		const ratio = Math.min(Math.max((event.clientX - box.left) / box.width, 0), 1);
		hover = Math.round(ratio * last);
	}

	const ticks = $derived(
		[...new Set([0, Math.floor(last / 2), last])].filter((t) => t < chart.x.length)
	);
</script>

<figure class="chart lines">
	<figcaption>{chart.title}</figcaption>
	<p class="readout" aria-hidden="true">
		{#if hover !== undefined}
			<strong>{chart.x[hover]}</strong>
			{#each chart.panels as panel, p (p)}
				<span
					>{panel.label}
					{formatValue(panel.values[hover] ?? 0)}{panel.unit ? ` ${panel.unit}` : ''}</span
				>
			{/each}
		{:else}
			Point at a panel to read values.
		{/if}
	</p>
	<div
		class="panels"
		role="presentation"
		onpointermove={track}
		onpointerleave={() => (hover = undefined)}
	>
		{#each chart.panels as panel, p (p)}
			{@const [lo, hi] = extent(panel.values)}
			<div class="panel">
				<p class="label">
					{panel.label}{#if panel.unit}<span class="unit">{` (${panel.unit})`}</span>{/if}
				</p>
				<p class="range"><span>{formatValue(hi)}</span><span>{formatValue(lo)}</span></p>
				<svg viewBox="0 0 {W} {H}" preserveAspectRatio="none" aria-hidden="true" focusable="false">
					<line class="base" x1="0" x2={W} y1={H} y2={H} />
					<path class="mark" d={path(panel.values)} />
					{#if hover !== undefined}
						<line class="cursor" x1={(hover / last) * W} x2={(hover / last) * W} y1="0" y2={H} />
					{/if}
				</svg>
			</div>
		{/each}
		<p class="ticks">
			{#each ticks as t (t)}<span>{chart.x[t]}</span>{/each}
		</p>
	</div>
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

	.readout {
		display: flex;
		flex-wrap: wrap;
		gap: 0 var(--space-2);
		min-block-size: 3em;
		font-size: var(--step--1);
		color: var(--ink-2);
	}

	.readout strong {
		color: var(--ink);
	}

	.panels {
		display: grid;
		gap: var(--space-2);
		touch-action: pan-y;
	}

	.panel {
		display: grid;
		grid-template-columns: 1fr 3.5rem;
		grid-template-areas: 'label label' 'plot range';
		gap: 0.25rem var(--space-1);
	}

	.label {
		grid-area: label;
		font-size: var(--step--1);
		font-weight: 600;
	}

	.unit {
		font-weight: 400;
		color: var(--ink-2);
	}

	.range {
		grid-area: range;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		font-size: 0.75rem;
		line-height: 1.2;
		color: var(--ink-2);
		text-align: end;
	}

	svg {
		grid-area: plot;
		inline-size: 100%;
		block-size: 4.5rem;
		overflow: visible;
	}

	.base {
		stroke: var(--ink-2);
		stroke-width: 1;
		vector-effect: non-scaling-stroke;
	}

	.mark {
		fill: none;
		stroke: var(--series-1);
		stroke-width: 2;
		stroke-linejoin: round;
		vector-effect: non-scaling-stroke;
	}

	.cursor {
		stroke: var(--ink-2);
		stroke-width: 1;
		vector-effect: non-scaling-stroke;
	}

	.ticks {
		display: flex;
		justify-content: space-between;
		font-size: 0.75rem;
		color: var(--ink-2);
		margin-inline-end: calc(3.5rem + var(--space-1));
	}

	.note {
		font-size: var(--step--1);
		color: var(--ink-2);
	}
</style>
