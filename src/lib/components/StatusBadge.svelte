<script lang="ts">
	import type { Status } from '#lib/content/schema.ts';

	interface Props {
		status: Status;
		updated?: string;
		archived?: boolean;
	}

	let { status, updated, archived = false }: Props = $props();

	const LABELS: Record<Status, string> = {
		complete: 'Complete',
		active: 'In progress',
		paused: 'Paused',
		prototype: 'Prototype'
	};
</script>

<p class="status">
	<span class="badge" data-status={status}>{LABELS[status]}</span>
	{#if archived}<span class="badge">Archived</span>{/if}
	{#if updated}<span class="updated">Updated {updated}</span>{/if}
</p>

<style>
	.status {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-1) var(--space-2);
		font-size: var(--step--1);
		color: var(--ink-2);
	}

	.badge {
		padding: 0.125rem 0.625rem;
		border: 1px solid var(--rule);
		border-radius: 999px;
		color: var(--ink);
	}

	.badge[data-status='complete'] {
		border-color: var(--accent);
	}
</style>
