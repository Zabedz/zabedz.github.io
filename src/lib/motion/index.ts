import { prefersReducedMotion } from 'svelte/motion';

export { prefersReducedMotion };

/** Click handler for in-page links: the fragment jump runs inside a view transition when allowed. */
export function jump(event: MouseEvent & { currentTarget: HTMLAnchorElement }): void {
	const { currentTarget: link } = event;
	if (!event.isTrusted || event.button !== 0) return;
	if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
	const target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
	if (!target) return;

	if (!('startViewTransition' in document) || prefersReducedMotion.current) {
		setTimeout(() => target.focus({ preventScroll: true }));
		return;
	}
	event.preventDefault();
	const root = document.documentElement;
	// Picks the slide direction in base.css.
	root.dataset.vt = target.getBoundingClientRect().top > 0 ? 'down' : 'up';
	const transition = document.startViewTransition(() => {
		// Untrusted, so this handler skips it and SvelteKit records history and scroll.
		link.click();
		target.scrollIntoView({ block: 'start', behavior: 'instant' });
		target.focus({ preventScroll: true });
	});
	void transition.finished.finally(() => delete root.dataset.vt);
}

/**
 * Calls `onActive` with the id of the section crossing the middle of the viewport, or the last
 * id once the page is scrolled to its end (a short last section never reaches the middle).
 */
export function observeSections(ids: string[], onActive: (id: string) => void): () => void {
	const last = ids.at(-1);
	const atEnd = () =>
		window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 1;
	const io = new IntersectionObserver(
		(entries) => {
			if (last && atEnd()) return onActive(last);
			for (const entry of entries) if (entry.isIntersecting) onActive(entry.target.id);
		},
		{ rootMargin: '-45% 0px -54% 0px' }
	);
	for (const id of ids) {
		const el = document.getElementById(id);
		if (el) io.observe(el);
	}
	const onScroll = () => {
		if (last && atEnd()) onActive(last);
	};
	window.addEventListener('scroll', onScroll, { passive: true });
	return () => {
		io.disconnect();
		window.removeEventListener('scroll', onScroll);
	};
}
