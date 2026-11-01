/**
 * Fills `bar` with the page's scroll progress.
 *
 * A `scroll(root)` timeline divides by the page height, which changes whenever a carousel fits a
 * slide of a different height, so the bar moved with no scroll. Here a height change pins the bar
 * where it stands, and scrolling then fills it from that point toward either end.
 */
export function trackProgress(bar: HTMLElement): () => void {
	const root = document.documentElement;
	let frame = 0;
	let lastY = 0;
	let lastMax = 0;
	let shown = 0;
	// Where the last height change pinned the bar; cleared at either end of the page.
	let pin: { y: number; at: number } | undefined;

	function progress(y: number, max: number): number {
		if (y <= 0 || y >= max) {
			pin = undefined;
			return y <= 0 ? 0 : 1;
		}
		if (!pin) return y / max;
		if (y < pin.y) return pin.at * (y / pin.y);
		return pin.at + (1 - pin.at) * ((y - pin.y) / (max - pin.y));
	}

	function update() {
		frame = 0;
		const y = root.scrollTop;
		const max = root.scrollHeight - root.clientHeight;
		if (lastMax && max !== lastMax) pin = { y: lastY, at: shown };
		lastY = y;
		lastMax = max;
		shown = max > 0 ? progress(y, max) : 0;
		bar.style.setProperty('scale', `${shown} 1`);
	}

	const onScroll = () => {
		frame ||= requestAnimationFrame(update);
	};

	update();
	window.addEventListener('scroll', onScroll, { passive: true });
	return () => {
		cancelAnimationFrame(frame);
		window.removeEventListener('scroll', onScroll);
	};
}
