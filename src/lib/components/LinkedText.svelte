<script lang="ts">
	import type { Link } from '#lib/content/schema.ts';

	let { text, links = [] }: { text: string; links?: Link[] | undefined } = $props();

	/** Text split around the first occurrence of each label; overlapping labels are skipped. */
	const parts = $derived.by(() => {
		const hits = links
			.map((link) => ({ link, at: text.indexOf(link.label) }))
			.filter(({ at }) => at >= 0)
			.sort((a, b) => a.at - b.at);
		const out: { text: string; href?: string }[] = [];
		let from = 0;
		for (const { link, at } of hits) {
			if (at < from) continue;
			out.push({ text: text.slice(from, at) }, { text: link.label, href: link.href });
			from = at + link.label.length;
		}
		out.push({ text: text.slice(from) });
		return out;
	});
</script>

<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external https URLs -->
{#each parts as part, i (i)}{#if part.href}<a href={part.href}>{part.text}</a
		>{:else}{part.text}{/if}{/each}
