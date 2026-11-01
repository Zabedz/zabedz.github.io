<script lang="ts">
	import '#lib/styles/tokens.css';
	import '#lib/styles/base.css';
	import '#lib/styles/motion.css';
	import { onMount } from 'svelte';
	import { asset } from '$app/paths';
	import site from '#lib/content/site.ts';
	import fontUrl from '#lib/fonts/instrument-sans.woff2?url';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	// Lets CSS and tests tell a hydrated page from the prerendered HTML.
	onMount(() => {
		document.documentElement.dataset.hydrated = '';
	});
</script>

<svelte:head>
	<title>{site.name}</title>
	<meta name="description" content={site.description} />
	<link rel="preload" href={fontUrl} as="font" type="font/woff2" crossorigin="anonymous" />
	<link rel="icon" href={asset('favicon.svg')} type="image/svg+xml" />
	<link rel="canonical" href={site.url} />
	<meta property="og:type" content="website" />
	<meta property="og:title" content={site.name} />
	<meta property="og:description" content={site.description} />
	<meta property="og:url" content={site.url} />
	<meta name="theme-color" content="#f2f4f3" media="(prefers-color-scheme: light)" />
	<meta name="theme-color" content="#0f1a1c" media="(prefers-color-scheme: dark)" />
</svelte:head>

{@render children()}
