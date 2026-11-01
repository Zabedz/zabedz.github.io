<script lang="ts">
	interface Props {
		direction: 'prev' | 'next';
		label: string;
		onclick: () => void;
		small?: boolean;
	}

	let { direction, label, onclick, small = false }: Props = $props();
</script>

<button type="button" class="arrow {direction}" class:small aria-label={label} {onclick}>
	<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
		<path d={direction === 'prev' ? 'M10 3 5 8l5 5' : 'M6 3l5 5-5 5'} />
	</svg>
</button>

<style>
	.arrow {
		display: grid;
		place-items: center;
		inline-size: 2.75rem;
		block-size: 2.75rem;
		padding: 0;
		border: 1px solid var(--rule);
		border-radius: 50%;
		background: var(--paper);
		color: var(--ink);
		cursor: pointer;
		transition:
			border-color var(--dur-fast) var(--ease-out),
			scale var(--dur-fast) var(--ease-out);
	}

	.small {
		inline-size: 2rem;
		block-size: 2rem;
	}

	svg {
		inline-size: 1rem;
		block-size: 1rem;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.75;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	@media (hover: hover) {
		.arrow:hover {
			border-color: var(--accent);
		}
	}

	/* The chevron leans the way the button moves. */
	@media (hover: hover) and (prefers-reduced-motion: no-preference) {
		svg {
			transition: translate var(--dur-fast) var(--ease-out);
		}

		.prev:hover svg {
			translate: -2px 0;
		}

		.next:hover svg {
			translate: 2px 0;
		}
	}

	.arrow:active {
		scale: 0.92;
	}
</style>
