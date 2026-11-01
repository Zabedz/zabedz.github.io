<script lang="ts">
	/** Heading text split into masked words for the scroll reveal; screen readers get the plain text. */
	let { text }: { text: string } = $props();

	const words = $derived(text.split(/\s+/).filter(Boolean));
</script>

<span class="visually-hidden">{text}</span>
<span class="words" aria-hidden="true">
	{#each words as word, i (i)}<span class="w"><span>{word}</span></span>{/each}
</span>

<style>
	/* Padding keeps descenders inside the mask; the negative margin cancels it in layout. */
	.w {
		display: inline-block;
		overflow: clip;
		padding-block: 0.12em;
		margin-block: -0.12em;
		margin-inline-end: 0.22em;
	}

	.w:last-child {
		margin-inline-end: 0;
	}
</style>
