<script lang="ts">
	import type { Chapter } from '#lib/content/schema.ts';
	import { projects } from '#lib/content/projects/index.ts';
	import ProjectScene from '#lib/components/ProjectScene.svelte';
	import Words from '#lib/components/Words.svelte';

	let { chapter }: { chapter: Chapter } = $props();

	const entries = $derived(
		chapter.projects.flatMap((entry) => {
			const project = projects[entry.slug];
			// A stage with only text has nothing to pin.
			return project
				? [{ project, featured: (entry.featured ?? false) && project.visual !== undefined }]
				: [];
		})
	);
</script>

{#if entries.length}
	<section id={chapter.id} class="chapter" tabindex="-1" aria-labelledby="{chapter.id}-title">
		<header class="opener wrap">
			<h2 id="{chapter.id}-title"><Words text={chapter.title} /></h2>
			<p>{chapter.intro}</p>
		</header>
		{#each entries as { project, featured } (project.slug)}
			<ProjectScene {project} {featured} />
		{/each}
	</section>
{/if}

<style>
	.chapter {
		padding-block-start: var(--space-5);
	}

	.opener {
		display: grid;
		gap: var(--space-2);
		padding-block-end: var(--space-4);
	}

	h2 {
		font-size: var(--step-4);
		font-stretch: 75%;
		font-weight: 700;
		line-height: 0.92;
		max-inline-size: 14ch;
	}

	p {
		font-size: var(--step-1);
		color: var(--ink-2);
		max-inline-size: 44ch;
	}
</style>
