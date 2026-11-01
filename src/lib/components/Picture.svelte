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

	picture {
		display: block;
		inline-size: fit-content;
		max-inline-size: 100%;
		overflow: clip;
		border-radius: var(--radius);
	}

	img {
		max-inline-size: 100%;
		block-size: auto;
		background: var(--paper-2);
		transition: scale var(--dur) var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		picture:hover img {
			scale: 1.03;
		}
	}

	figcaption {
		font-size: var(--step--1);
		color: var(--ink-2);
	}
</style>
