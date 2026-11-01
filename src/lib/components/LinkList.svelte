<script lang="ts">
	import type { Link } from '#lib/content/schema.ts';

	let { links }: { links: Link[] } = $props();
</script>

{#if links.length}
	<ul class="links">
		{#each links as link, i (i)}
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external https URLs -->
			<li><a href={link.href}>{link.label}</a></li>
		{/each}
	</ul>
{/if}

<style>
	.links {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1) var(--space-3);
		list-style: none;
		margin: 0;
		padding: 0;
	}

	a {
		display: inline-flex;
		align-items: center;
		min-block-size: 2.75rem;
		font-weight: 600;
	}
</style>
