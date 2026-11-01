import { asset } from '$app/paths';
import type { AssetPath } from '$app/types';
import manifest from './generated/images.json';

export interface ImageInfo {
	width: number;
	height: number;
	widths: number[];
}

const images: Record<string, ImageInfo> = manifest;

/** Manifest entry for an `ImageRef.src`, or undefined when `pnpm images` has not encoded it. */
export function imageInfo(src: string): ImageInfo | undefined {
	return images[src];
}

export type Shape = 'wide' | 'landscape' | 'tall';

// Width-to-height ratios that pick a gallery cell size.
const WIDE = 2;
const LANDSCAPE = 1.1;

export function shape(info: ImageInfo): Shape {
	const ratio = info.width / info.height;
	return ratio >= WIDE ? 'wide' : ratio >= LANDSCAPE ? 'landscape' : 'tall';
}

export function imageUrl(src: string, width: number): string {
	return asset(`projects/${src}-${width}.avif` as AssetPath);
}

export function srcset(src: string, info: ImageInfo): string {
	return info.widths.map((w) => `${imageUrl(src, w)} ${w}w`).join(', ');
}
