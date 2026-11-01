import type { Chart } from '#lib/content/schema.ts';
import { formatValue } from './format.ts';

export interface Table {
	headers: string[];
	rows: string[][];
}

export function chartTable(chart: Chart): Table {
	if (chart.kind === 'bars') {
		return {
			headers: [chart.categoryLabel ?? 'Category', ...chart.series.map((s) => s.label)],
			rows: chart.categories.map((category, c) => [
				category,
				...chart.series.map((s) => formatValue(s.values[c] ?? 0, chart.format))
			])
		};
	}
	if (chart.kind === 'lines') {
		return {
			headers: [
				chart.xLabel ?? 'Point',
				...chart.panels.map((p) => (p.unit ? `${p.label} (${p.unit})` : p.label))
			],
			rows: chart.x.map((x, i) => [x, ...chart.panels.map((p) => formatValue(p.values[i] ?? 0))])
		};
	}
	return {
		headers: ['#', chart.xLabel, chart.yLabel],
		rows: chart.points.map(([x, y], i) => [String(i + 1), formatValue(x), formatValue(y)])
	};
}
