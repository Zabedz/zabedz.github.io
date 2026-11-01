import { prefersReducedMotion } from 'svelte/motion';

export interface Carousel {
	/** Shows slide `index`, wrapping past either end. */
	go(index: number): void;
	/** Moves `by` slides from the current one. */
	step(by: number): void;
	destroy(): void;
}

/**
 * Drives a horizontal scroll-snap track of full-width slides. Buttons call `go`/`step`; swipes and
 * trackpad scrolls move the track natively and are read back from `scrollLeft`.
 *
 * The current slide gets `data-current`; the others get `inert`, so Tab stays on the visible slide.
 * The track takes the current slide's height, so a short slide leaves no gap under it. A move of
 * one slide scrolls smoothly; a longer one jumps and the arriving slide gets `data-enter`, which
 * motion.css animates.
 */
export function carousel(track: HTMLElement, onChange: (index: number) => void): Carousel {
	const slides = () => [...track.children] as HTMLElement[];
	let current = Math.max(0, Math.round(track.scrollLeft / (track.clientWidth || 1)));
	// Set while a smooth scroll runs, so the slides it passes do not become current.
	let target: number | undefined;
	// The slide leaving during that scroll; the track keeps room for it until the scroll lands.
	let from: number | undefined;
	let frame = 0;
	let fitFrame = 0;
	let alignFrame = 0;

	const height = (i: number | undefined) =>
		i === undefined ? 0 : (slides()[i]?.offsetHeight ?? 0);

	function fit() {
		fitFrame = 0;
		const leaving = target === undefined ? 0 : height(from);
		const size = Math.max(height(current), leaving);
		if (size) track.style.setProperty('block-size', `${size}px`);
	}
	// Deferred a frame: writing the height inside the callback trips WebKit's loop error when
	// carousels nest.
	const sizes = new ResizeObserver(() => {
		fitFrame ||= requestAnimationFrame(fit);
	});

	function mark() {
		slides().forEach((slide, i) => {
			slide.inert = i !== current;
			slide.toggleAttribute('data-current', i === current);
		});
		sizes.disconnect();
		const slide = slides()[current];
		if (slide) sizes.observe(slide);
		fit();
	}

	function select(index: number) {
		if (index === current) return;
		current = index;
		mark();
		onChange(index);
	}

	function read() {
		frame = 0;
		const width = track.clientWidth;
		if (!width) return;
		if (target !== undefined) {
			if (Math.abs(track.scrollLeft - target * width) > 1) return;
			target = from = undefined;
			fit();
		}
		const last = slides().length - 1;
		select(Math.min(last, Math.max(0, Math.round(track.scrollLeft / width))));
	}

	const onScroll = () => {
		frame ||= requestAnimationFrame(read);
	};
	// A swipe or wheel during a programmatic scroll hands control back to the user.
	const release = () => {
		target = from = undefined;
	};
	const INPUT = ['pointerdown', 'wheel', 'touchstart', 'keydown'] as const;

	const onAnimationEnd = (event: AnimationEvent) => {
		if (!event.animationName.startsWith('enter-')) return;
		(event.target as Element).closest('[data-enter]')?.removeAttribute('data-enter');
	};

	function enter(slide: HTMLElement | undefined, forward: boolean) {
		if (!slide) return;
		slide.removeAttribute('data-enter');
		// Restarts the animation when the same slide arrives again before it ended.
		void slide.offsetWidth;
		slide.dataset.enter = forward ? 'next' : 'prev';
	}

	/**
	 * Chromium applies one more frame of a smooth scroll that an instant one interrupted, which
	 * leaves the track off its snap point; this puts it back over the next few frames.
	 */
	function realign(index: number, left: number, frames = 3) {
		alignFrame = requestAnimationFrame(() => {
			if (current !== index) return;
			if (Math.abs(track.scrollLeft - left) > 1) track.scrollTo({ left, behavior: 'instant' });
			if (frames > 1) realign(index, left, frames - 1);
		});
	}

	function go(index: number) {
		const count = slides().length;
		if (count === 0) return;
		const next = ((index % count) + count) % count;
		if (next === current) return;
		const left = next * track.clientWidth;
		const forward = index > current;
		const far = Math.abs(next - current) > 1;

		if (far || prefersReducedMotion.current) {
			// A smooth scroll this long would pass every slide in between.
			target = from = undefined;
			select(next);
			track.scrollTo({ left, behavior: 'instant' });
			realign(next, left);
			if (!prefersReducedMotion.current) enter(slides()[next], forward);
			return;
		}
		from = current;
		target = next;
		select(next);
		track.scrollTo({ left, behavior: 'smooth' });
	}

	track.addEventListener('scroll', onScroll, { passive: true });
	track.addEventListener('animationend', onAnimationEnd);
	for (const type of INPUT) track.addEventListener(type, release, { passive: true });
	mark();
	// A fragment link may have scrolled the track before hydration.
	onChange(current);

	return {
		go,
		step: (by) => go(current + by),
		destroy() {
			cancelAnimationFrame(frame);
			cancelAnimationFrame(fitFrame);
			cancelAnimationFrame(alignFrame);
			sizes.disconnect();
			track.removeEventListener('scroll', onScroll);
			track.removeEventListener('animationend', onAnimationEnd);
			for (const type of INPUT) track.removeEventListener(type, release);
		}
	};
}
