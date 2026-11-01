import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';

// Inline style of SvelteKit's route announcer; recompute from build output after a SvelteKit upgrade.
const ANNOUNCER_STYLE = 'sha256-S8qMpvofolR8Mpjy4kQvEm7m1q8clzU4dfDH0AmvZjo=';

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter({ strict: true }),
			// Inlines each CSS file under 20 kB raw, so first paint waits on no stylesheet request.
			inlineStyleThreshold: 20_000,
			csp: {
				mode: 'hash',
				directives: {
					'default-src': ['self'],
					'script-src': ['self'],
					'style-src': ['self'],
					'style-src-attr': ['unsafe-hashes', ANNOUNCER_STYLE],
					'img-src': ['self', 'data:'],
					'font-src': ['self'],
					'connect-src': ['self'],
					'object-src': ['none'],
					'base-uri': ['self'],
					'form-action': ['none'],
					'require-trusted-types-for': ['script'],
					'trusted-types': ['svelte-trusted-html', 'sveltekit-trusted-url']
				}
			}
		})
	],
	test: {
		expect: { requireAssertions: true },
		// The on-disk transform cache keeps stale import.meta.glob results, so a new project file is missed.
		fsModuleCache: false,
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'client',
					browser: {
						enabled: true,
						provider: playwright(),
						instances: [{ browser: 'chromium', headless: true }]
					},
					include: ['src/**/*.svelte.{test,spec}.ts']
				}
			},
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.ts'],
					exclude: ['src/**/*.svelte.{test,spec}.ts']
				}
			}
		]
	}
});
