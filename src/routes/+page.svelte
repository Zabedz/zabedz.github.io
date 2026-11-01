<script lang="ts">
	import chapters from '#lib/content/chapters.ts';
	import site from '#lib/content/site.ts';
	import SiteNav from '#lib/components/SiteNav.svelte';
	import About from '#lib/sections/About.svelte';
	import Chapter from '#lib/sections/Chapter.svelte';
	import Hero from '#lib/sections/Hero.svelte';
	import { projects } from '#lib/content/projects/index.ts';

	// Chapter renders nothing without a project, so its nav link would point nowhere.
	const shown = chapters.filter((c) => c.projects.some((p) => projects[p.slug]));
	const sections = [
		{ id: 'about', label: 'About' },
		...shown.map(({ id, label }) => ({ id, label }))
	];
</script>

<a class="skip" href="#main">Skip to content</a>
<SiteNav name={site.name} {sections} unlisted={['top']} />
<main id="main">
	<Hero {site} />
	<About {site} />
	{#each shown as chapter (chapter.id)}
		<Chapter {chapter} />
	{/each}
</main>
<footer class="wrap">
	<p>
		{site.name}. Source for this site:
		<a href="https://github.com/{site.owner}/{site.owner.toLowerCase()}.github.io">GitHub</a>.
	</p>
</footer>

<style>
	.skip {
		position: absolute;
		inset-inline-start: var(--gutter);
		inset-block-start: -10rem;
		z-index: 20;
		padding: var(--space-1) var(--space-2);
		background: var(--ink);
		color: var(--paper);
	}

	.skip:focus {
		inset-block-start: var(--space-1);
	}

	footer {
		padding-block: var(--space-4);
		font-size: var(--step--1);
		color: var(--ink-2);
	}
</style>
