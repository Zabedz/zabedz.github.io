<script lang="ts">
	import type { ImageRef } from '#lib/content/schema.ts';
	import { imageInfo, imageUrl, shape, srcset } from '#lib/content/images.ts';

	interface Props {
		image: ImageRef;
		sizes: string;
	}

	let { image, sizes }: Props = $props();

	const info = $derived(imageInfo(image.src));
	const dark = $derived(image.dark ? imageInfo(image.dark) : undefined);
</script>

{#if info}
	<figure class="picture" data-shape={shape(info)}>
		<picture>
			{#if image.dark && dark}
				<source
					media="(prefers-color-scheme: dark)"
					srcset={srcset(image.dark, dark)}
					{sizes}
					width={dark.width}
					height={dark.height}
				/>
			{/if}
			<img
				src={imageUrl(image.src, info.widths.at(-1) ?? info.width)}
				srcset={srcset(image.src, info)}
				{sizes}
				width={info.width}
				height={info.height}
				alt={image.alt}
				loading="lazy"
				decoding="async"
			/>
		</picture>
		{#if image.caption}<figcaption>{image.caption}</figcaption>{/if}
	</figure>
{/if}

<style>
	.picture {
		display: grid;
		gap: var(--space-1);
	}

	img {
		max-inline-size: 100%;
		block-size: auto;
		border-radius: var(--radius);
		background: var(--paper-2);
	}

	figcaption {
		font-size: var(--step--1);
		color: var(--ink-2);
	}
</style>
