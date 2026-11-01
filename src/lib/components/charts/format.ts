const decimal = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 3 });
const percent = new Intl.NumberFormat('en-GB', {
	maximumFractionDigits: 1,
	signDisplay: 'exceptZero'
});

export function formatValue(value: number, format: 'decimal' | 'percent' = 'decimal'): string {
	return format === 'percent' ? `${percent.format(value)}%` : decimal.format(value);
}

/** [min, max] padded to include zero when `withZero`, and never zero-width. */
export function extent(values: number[], withZero = false): [number, number] {
	let lo = Math.min(...values);
	let hi = Math.max(...values);
	if (withZero) {
		lo = Math.min(lo, 0);
		hi = Math.max(hi, 0);
	}
	if (lo === hi) return [lo - 1, hi + 1];
	return [lo, hi];
}
